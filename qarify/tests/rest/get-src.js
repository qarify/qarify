// const http = require('node:http');
import http from 'http';

console.log('>>> Get screen source via appium request.');

const SESSION_ID = 'fb30d157-09d3-450a-bbdd-99466570fa98';
const URL = `http://127.0.0.1:4723/session/${SESSION_ID}/source`;

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
    console.log('>>> data.value:');
    console.log(data.value);
  });
}).on('error', err => {
  console.log('Error: ', err.message);
});
