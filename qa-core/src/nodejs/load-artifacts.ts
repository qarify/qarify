import fs from 'node:fs';
import path from "node:path";

export function loadPageLayout(id: string) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(id);
    fs.readFile(filePath, 'ascii', (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
}

export function savePageLayout(id: string, data: any) {
  const filePath = path.join()
}
