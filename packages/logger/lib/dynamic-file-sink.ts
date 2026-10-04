import { getTextFormatter, type Sink, type LogRecord } from '@logtape/logtape';
import { DynamicLogFileManager } from './dynamic-log-file-manager';
import fs from 'node:fs';

// 1. 공통 포매터 생성 (순수 함수 역할)
const sharedFormatter = getTextFormatter({
  timestamp: 'time',
  // 필요한 포맷 커스텀
});

export function getDynamicFileSink(keyName = 'sessionId'): Sink {
  return (record: LogRecord) => {
    const logId = record.properties[keyName] as string;
    if (!logId) return; // Log ID가 없으면 무시 (필요시 fallback 처리 가능)

    const target = DynamicLogFileManager.getStream(logId);
    if (!target) return; // 스트림이 열려있지 않으면 무시

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
