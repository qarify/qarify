import { expect } from 'expect-webdriverio';
import { QADriverSession } from '@qarify/types';

import { makeSession, closeSession } from "../../src/driver/index.js";
import { getPageNode } from "../../src/page/index.js";
import { localIosDriver } from '../helper/default-qaconfig.js';

describe("page", () => {
  let session: QADriverSession | undefined = undefined;
  before(async () => {
    session = await makeSession(localIosDriver);
  });

  after(async () => {
    session && await closeSession(session.sessionId);
  });

  it("should parse page node", async function() {
    this.timeout(10000); // 10s

    const pageNode = await getPageNode(session!.sessionId);
    expect(pageNode).toBeDefined();

    // TODO: test selectors
    // See page-node.spec.ts
    console.log(pageNode);
  });
});
