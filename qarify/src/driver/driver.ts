
type Drivers = {
  [key: string]: WebdriverIO.Browser; //  | WebdriverIO.MultiRemoteBrowser
};

let drivers: Drivers = {} as Drivers;

export function getDriver(sessionId: string): WebdriverIO.Browser | undefined {
  return drivers[sessionId];
}

export function setDriver(sessionId: string, client: WebdriverIO.Browser) {
  drivers[sessionId] = client;
}

export async function removeDriver(sessionId: string) {
  if (drivers[sessionId]) {
    delete drivers[sessionId];
  }
}
