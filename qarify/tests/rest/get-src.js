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
http.get(SESSIONS_URL, res => {
  let rawData = [];
  if (res.statusCode !== 200) {
    console.log('!!! Error Status Code:', res.statusCode);
  }

  res.on('data', chunk => {
    rawData.push(chunk);
  });

  res.on('end', () => {
    const data = JSON.parse(Buffer.concat(rawData).toString());
    if (data.value.length) {
      getPageSource(data.value[0].id);
    } else {
      console.error('Error: no sessions');
      console.log(data.value);
    }
  });
}).on('error', err => {
  console.log('Error: ', err.message);
});

function getPageSource(sessionId) {
  const URL = `http://127.0.0.1:4723/session/${sessionId}/source`;

  http.get(URL, res => {
    let rawData = [];
    if (res.statusCode !== 200) {
      console.log('!!! Error Status Code:', res.statusCode);
    }
  
    res.on('data', chunk => {
      rawData.push(chunk);
    });
  
    res.on('end', () => {
      const data = JSON.parse(Buffer.concat(rawData).toString());
      // console.log('>>> data.value:');
      // console.log(data.value);
      (!fs.existsSync(OUTDIR)) && fs.mkdirSync(OUTDIR);
      fs.writeFileSync(path.join(OUTDIR, `${sessionId}.xml`), data.value);

      console.log('>>> Elapsed:', `${((Date.now() - startTime) / 1000)}s`);
    });
  }).on('error', err => {
    console.log('Error: ', err.message);
  });
}