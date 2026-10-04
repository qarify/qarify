import { type LogRecord, getTextFormatter } from '@logtape/logtape';
import * as fs from 'fs';
import * as path from 'path';

export const SessionLogger = {
  streams: new Map<string, fs.WriteStream | number>(),

  // 애플리케이션에서 로깅 시작 시 호출
  open(id: string, logFile: string, isSync = false) {
    if (this.streams.has(id)) return;

    if (!fs.existsSync(logFile)) {
      fs.mkdirSync(path.dirname(logFile), { recursive: true });
    }

    if (isSync) {
      const fd = fs.openSync(logFile, 'a');
      this.streams.set(id, fd); // number 저장
      return fd;
    } else {
      const stream = fs.createWriteStream(logFile, { flags: 'a' });
      this.streams.set(id, stream);
      return stream;
    }
  },

  // 애플리케이션에서 로깅 종료 시 호출
  async close(id: string) {
    const target = this.streams.get(id);
    if (target === undefined) return;
    this.streams.delete(id);

    // typeof로 런타임 타입 체크 (가장 빠름)
    if (typeof target === 'number') {
      fs.closeSync(target);
    } else {
      await new Promise<void>((resolve) => {
        target.end(() => resolve());
      });
    }
  },

  // 싱크에서 스트림을 가져올 때 사용
  getStream(id: string): fs.WriteStream | number | undefined {
    return this.streams.get(id);
  },

  async closeAll() {
    for (const target of this.streams.values()) {
      if (typeof target === 'number') {
        fs.closeSync(target);
      } else {
        await new Promise<void>((resolve) => {
          target.end(() => resolve());
        });
      }
    }
    this.streams.clear();
  },
};

// 1. 공통 포매터 생성 (순수 함수 역할)
const sharedFormatter = getTextFormatter({
  timestamp: 'time',
  // 필요한 포맷 커스텀
});

// Define a custom sink to split files by session
export function getSessionFileSink(logDir?: string, isSync = false, keyName = 'sessionId') {
  return (record: LogRecord) => {
    const logId = record.properties[keyName] as string;
    if (!logId) return; // Log ID가 없으면 무시 (필요시 fallback 처리 가능)

    let target = SessionLogger.getStream(logId);
    if (!target) {
      if (logDir) {
        target = SessionLogger.open(logId, path.join(logDir, `session-${logId}.log`), isSync);
      }
    }
    if (!target) {
      return;
    }

    // 공통 포매터를 사용해 문자열로 변환 후 스트림에 기록
    const logString = JSON.stringify({ msg: sharedFormatter(record), props: record.properties }) + '\n';
    // getTextFormatter는 string을 반환하지만 터미널 색상 코드 등이 포함될 수 있으므로,
    // 파일 저장 전용 포매터를 별도로 두는 것도 좋은 방법입니다.
    if (typeof target === 'number') {
      // target이 number이면 동기식 파일 디스크립터
      fs.writeSync(target, logString);
    } else {
      // target이 object이면 비동기식 WriteStream
      target.write(logString);
    }
  };
}
