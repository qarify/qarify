import http from 'http';
import fs from 'fs';
import path from 'path';
import * as url from 'url';

import * as qarify from '@qarify/core';
import { parseAndVizSource } from './visualize-page-node.js';

console.log('>>> Get page source via appium request.');

const GET_SESSIONS_URL = `http://127.0.0.1:4723/sessions`;
const NEW_SESSION_URL = `http://127.0.0.1:4723/session`;
const CAPs = {
  'ios': {
    "capabilities": {
      "alwaysMatch": {
        "platformName": "iOS",
        "appium:automationName": "XCUITest",
        "appium:deviceName": "iPhone 15 Pro",
        "appium:platformVersion": "17.0",
        "appium:orientation": "PORTRAIT"
      }
    }
  },
  'android': {
    "capabilities": {
      "alwaysMatch": {
        "platformName": "android",
        "appium:automationName": "UiAutomator2",
        "appium:avd": "Pixel_API_33",
        "appium:platformVersion": "13.0",
        "appium:orientation": "PORTRAIT"
      }
    }
  },
}
const capForNewSession = CAPs['ios']

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const OUTDIR = path.join(__dirname, 'output');

// get session id
function getSessions() {
  return new Promise((resolve, reject) => {
    http.get(GET_SESSIONS_URL, (res) => {
      let rawData = [];
      if (res.statusCode !== 200) {
        console.log('!!! Error Status Code:', res.statusCode);
        console.error(res);
        reject(res);
      }

      res.on('data', chunk => {
        rawData.push(chunk);
      });

      res.on('end', async () => {
        const data = JSON.parse(Buffer.concat(rawData).toString());
        const sessions = [];
        if (!data.value.length) {
          if (capForNewSession) {
            try {
              const session = await newSession(capForNewSession)
              sessions.push({
                id: session.value.sessionId, platformName: session.value.capabilities.platformName, isCreatedSession: true
              });
            } catch (e) {
              console.error('!!! Error on newSession:', e);
              reject(e);
            }
          }
        } else {
          data.value.forEach(
            (e) => sessions.push({ id: e.id, platformName: e.capabilities.platformName })
          );
        }
        if (sessions.length) {
          console.log('>>> response sessions:', sessions);
          resolve(sessions);
        } else {
          console.error('Error: no sessions');
          console.log(data.value);
          reject(new Error('no sessions'));
        }
      });
    }).on('error', err => {
      console.log('Error: ', err.message);
      reject(err);
    });
  });
}

function getPageSource(sessionId, srcPath=undefined) {
  return new Promise((resolve, reject) => {
    const URL = `http://127.0.0.1:4723/session/${sessionId}/source`;
    http.get(URL, res => {
      let rawData = [];
      if (res.statusCode !== 200) {
        console.log('!!! get-page-source(): Error Status Code:', res.statusCode, res.statusMessage);
        console.error(`${res.statusCode}:${res.statusMessage}`);
        reject(res);
      }

      res.on('data', chunk => {
        rawData.push(chunk);
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const data = JSON.parse(Buffer.concat(rawData).toString());
          if (srcPath) {
            fs.writeFileSync(srcPath, data.value);
          }
          resolve(data.value);
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
      method: 'DELETE', host: url.hostname, port: url.port, protocol: url.protocol, path: url.pathname
    }, res => {
      if (res.statusCode !== 200) {
        console.log('!!! closeSession(): Error Status Code:', res.statusCode, res.statusMessage);
        reject(`${res.statusCode}:${res.statusMessage}`);
      }
      resolve();
    })
    .end()
    .on('error', reject);
  });
}

async function newSession(cap) {
  try {
    const response = await fetch(NEW_SESSION_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(cap)
    });
    if (!response.ok) {
      throw new Error(`${response.statusText}(${response.status})`);
    }
    return await response.json();
  } catch (e) {
    throw e;
  }
}

function main() {
  const startTime = Date.now();
  getSessions().then(async (sessions) => {
    let pageSrc = undefined;
    let sessionId = undefined;
    for (const session of sessions) {
      let deleteSession = !!session.isCreatedSession;
      sessionId = session.id;
      try {
        // const srcPath = path.join(OUTDIR, `${sessionId}.xml`);
        const srcPath = path.join(OUTDIR, `out.xml`);
        pageSrc = await getPageSource(sessionId, srcPath);
        break; // exit when no error
      }
      catch (e) {
        console.error(e);
        // close errored session
        deleteSession = true;
        console.log('>>> try to remove errored session');
      }
      finally {
        if (deleteSession) {
          console.log('>>> close session');
          try {
            await closeSession(sessionId);
          } catch {/* ignore */}
        }
      }
    }
    if (pageSrc) {
      console.log('>>> got page source: Elapsed:', `${((Date.now() - startTime) / 1000)}s`);
      await parseAndVizSource(pageSrc);
    }

    // TOFIX: should call exit?
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

main();
