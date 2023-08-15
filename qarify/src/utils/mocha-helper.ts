import type Mocha from "mocha";

import type { TestSuiteNode } from '../types';

//
// See https://github.com/maty21/mocha-sidebar/blob/master/lib/core.js
//

function _crawlSuite(suite: Mocha.Suite, node: TestSuiteNode) {
  if (suite.tests && suite.tests.length) {
    node.children = suite.tests.map(test => ({
      type: 'test',
      title: test.title,
      path: node.path.concat(suite.title),
      file: test.file
    }));
  }

  if (suite.suites && suite.suites.length) {
    if (!node.children) {
      node.children = [];
    }
    node.children = node.children.concat(suite.suites.map((e) => {
      const child = _crawlSuite(e, {
        type: 'suite',
        title: e.title,
        path: node.path.concat(suite.title),
        file: e.file,
      });
      return child;
    }));
  }

  return node;
}

export function getTestSuiteNode(mocha: Mocha) {
  return _crawlSuite(mocha.suite, {
    type: 'suite',
    title: '',
    path: [],
  });
}
