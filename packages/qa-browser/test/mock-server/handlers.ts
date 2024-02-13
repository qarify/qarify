import 'msw'
import { type HttpHandler, HttpResponse, http } from 'msw'

// Mock Data

const mockIosSession = {
  "value": {
    "capabilities": {
      "webStorageEnabled": false,
      "locationContextEnabled": false,
      "browserName": "",
      "platform": "MAC",
      "javascriptEnabled": true,
      "databaseEnabled": false,
      "takesScreenshot": true,
      "networkConnectionEnabled": false,
      "platformName": "iOS",
      "automationName": "XCUITest",
      "deviceName": "iPhone 15 Pro",
      "platformVersion": "17.0",
      "orientation": "PORTRAIT",
      "mjpegServerPort": 9100,
      "mjpegScreenshotUrl": "http://localhost:9100",
      "udid": "86D50497-6A14-4344-ACD3-6B413448E134"
    },
    "sessionId": "76794b2c-70ce-4847-9151-438d94cc289e"
  }
};

export const restHandlers: Array<HttpHandler> = [
  http.get('/session/foobar-123/element', () => (
    HttpResponse.json(
      { value: { 'element-6066-11e4-a52e-4f735466cecf': 'some-elem-123' } }
    )
  )),
  http.post('http://127.0.0.1:4723/wd/session', () => (
    HttpResponse.json(mockIosSession)
  )),
  http.delete('http://127.0.0.1:4723/wd/session/76794b2c-70ce-4847-9151-438d94cc289e', () => (
    HttpResponse.json({
      "value": null
    })
  ))
]

export const handlers = [
  ...restHandlers,
];
