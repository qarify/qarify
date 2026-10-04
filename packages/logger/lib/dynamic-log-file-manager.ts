import fs from 'node:fs';
import path from 'node:path';

export const DynamicLogFileManager = {
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
    } else {
      const stream = fs.createWriteStream(logFile, { flags: 'a' });
      this.streams.set(id, stream);
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
