// const http = require('node:http');
import http from 'http';
import fs from 'fs';
import path from 'path';
import * as url from 'url';

console.log('>>> Get page source via appium request.');

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const OUTDIR = path.join(__dirname, 'output');
const startTime = Date.now();

// get session id
const SESSIONS_URL = `http://127.0.0.1:4723/sessions`;
http.get(SESSIONS_URL, (res) => {
  let rawData = [];
  if (res.statusCode !== 200) {
    console.log('!!! Error Status Code:', res.statusCode);
    console.error(res);
    return;
  }

  res.on('data', chunk => {
    rawData.push(chunk);
  });

  res.on('end', async () => {
    const data = JSON.parse(Buffer.concat(rawData).toString());
    if (data.value.length) {
      console.log('>>> response sessions:', data.value.map((e) => [e.id, e.capabilities.platformName]));
      for (const session of data.value) {
        try {
          await getPageSource(session.id);
          break; // exit when no error
        }
        catch (e) {
          console.error(e);
          // close errored session
          console.log('>>> try to remove errored session');
          try {
          await closeSession(session.id);
          } catch {}
        }
      }
    } else {
      console.error('Error: no sessions');
      console.log(data.value);
    }
  });
}).on('error', err => {
  console.log('Error: ', err.message);
});

function getPageSource(sessionId) {
  return new Promise((resolve, reject) => {
    const URL = `http://127.0.0.1:4723/session/${sessionId}/source`;
    http.get(URL, res => {
      let rawData = [];
      if (res.statusCode !== 200) {
        console.log('!!! get-page-source(): Error Status Code:', res.statusCode, res.statusMessage);
        reject(`${res.statusCode}:${res.statusMessage}`);
      }

      res.on('data', chunk => {
        rawData.push(chunk);
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const data = JSON.parse(Buffer.concat(rawData).toString());
          // console.log('>>> data.value:');
          // console.log(data.value);
          (!fs.existsSync(OUTDIR)) && fs.mkdirSync(OUTDIR);
          const filePath = path.join(OUTDIR, `${sessionId}.xml`);
          fs.writeFileSync(filePath, data.value);
          console.log('>>> Done: save to', filePath);
          console.log('>>> Elapsed:', `${((Date.now() - startTime) / 1000)}s`);
          resolve();
        } else {
          console.log('!!!', Buffer.concat(rawData).toString());
        }
      });

    })
    .end()
    .on('error', err => {
      reject(err);
    });
  });
}

function closeSession(sessionId) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://127.0.0.1:4723/session/${sessionId}`);
    http.request({
      method: 'DELETE', host: url.host, port: url.port, protocol: url.protocol, path: url.pathname
    }, res => {
      if (res.statusCode !== 200) {
        console.log('!!! get-page-source(): Error Status Code:', res.statusCode, res.statusMessage);
        reject(`${res.statusCode}:${res.statusMessage}`);
      }
      resolve();
    })
    .end()
    .on('error', reject);
  });
}
