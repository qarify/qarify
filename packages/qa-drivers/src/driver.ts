import type { QADriver } from "@qarify/types";

type Drivers = {
  [key: string]: QADriver; //  | WebdriverIO.MultiRemoteBrowser
};

let drivers: Drivers = {} as Drivers;

export function getDriver(sessionId: string): QADriver | undefined {
  return drivers[sessionId];
}

export function setDriver(sessionId: string, client: QADriver) {
  drivers[sessionId] = client;
}

export async function removeDriver(sessionId: string) {
  if (drivers[sessionId]) {
    delete drivers[sessionId];
  }
}
