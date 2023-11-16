// const http = require('node:http');
import http from 'http';
import fs from 'fs';
import path from 'path';
import * as url from 'url';

console.log('>>> Get page source via appium request.');

const GET_SESSIONS_URL = `http://127.0.0.1:4723/sessions`;
const NEW_SESSION_URL = `http://127.0.0.1:4723/session`;
const CAPs = {
  'ios': {
    "capabilities": {
      "alwaysMatch": {
        "platformName": "iOS",
        "appium:automationName": "XCUITest",
        "appium:deviceName": "iPhone 14",
        "appium:platformVersion": "16.4",
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


const startTime = Date.now();

// get session id
http.get(GET_SESSIONS_URL, (res) => {
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
    const sessions = [];
    let deleteSession = false;
    if (!data.value.length) {
      if (capForNewSession) {
        try {
          const session = await newSession(capForNewSession)
          sessions.push({ id: session.value.sessionId, platformName: session.value.capabilities.platformName })
          deleteSession = true;
        } catch (e) {
          console.error('!!! Error on newSession:', e);
        }
      }
    } else {
      data.value.forEach(
        (e) => sessions.push({ id: e.id, platformName: e.capabilities.platformName })
      )
    }
    if (sessions.length) {
      console.log('>>> response sessions:', sessions);
      for (const session of sessions) {
        try {
          await getPageSource(session.id);
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
              await closeSession(session.id);
            } catch {/* ignore */}
          }
        }
      }
    } else {
      console.error('Error: no sessions');
      console.log(data.value);
    }
    // TOFIX: should call exit?
    process.exit(0);
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
