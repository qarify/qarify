import type { InternalDriver } from "@qarify/types";

type Drivers = {
  [key: string]: InternalDriver; //  | WebdriverIO.MultiRemoteBrowser
};

let drivers: Drivers = {} as Drivers;

export function getDriver(sessionId: string): InternalDriver | undefined {
  return drivers[sessionId];
}

export function setDriver(sessionId: string, client: InternalDriver) {
  drivers[sessionId] = client;
}

export async function removeDriver(sessionId: string) {
  if (drivers[sessionId]) {
    delete drivers[sessionId];
  }
}
