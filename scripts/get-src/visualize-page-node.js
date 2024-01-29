import fs from 'fs';
import path from 'path';
import { createCanvas } from "canvas";
import { parsePageSrc, findPageWindowSize } from '@qarify/pages';
import { getPageLayout } from '@qarify/runtime-env';

import * as url from 'url';

/**@typedef {import('@qarify/types').QAPageNode} QAPageNode */

/**
 * 
 * @param {QAPageNode} node page node
 * @param {string} filePath path to save the result image
 */
export function visualizePageNode(node, filePath) {
  return new Promise((resolve, reject) => {
    const size = findPageWindowSize(node);
    console.log('visualizePageNode(): size:', size);
    const layout = getPageLayout(node, {
      attributes: {
        visible: true,
      },
    });

    const canvas = createCanvas(size.width, size.height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size.width, size.height);

    // ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    for (const item of layout) {
      console.log('>>>>', item.rect);
      ctx.strokeRect(item.rect[0], item.rect[1], item.rect[2], item.rect[3]);
    }

    const ws = fs.createWriteStream(filePath);
    ws.on('finish', resolve);
    ws.on('error', reject);
    canvas.createPNGStream().pipe(ws);
  });
}

const JSONSRC2NODE = {
  'isEnabled': (attr, v) => attr['enabled'] = (v === '1'),
  'isVisible': (attr, v) => attr['visible'] = (v === '1'),
  'isAccessible': (attr, v) => attr['accessible'] = (v === '1'),
  'rect': (attr, v) => {
    Object.assign(attr, v);
  },
  'frame': () => {},
  'isFocused': () => {},
  'value': (attr, v) => attr['value'] = v,
  'label': (attr, v) => attr['lable'] = v,
  'type': (attr, v) => attr['type'] = v,
  'name': (attr, v) => attr['name'] = v,
  'rawIdentifier': (attr, v) => attr['rawIdentifier'] = v,
};

/**
 * 
 * @param {object} jsonsrc 
 * @param {object} node 
 */
function jsonsrc2node(jsonsrc, node = {}) {
  const props = Object.keys(jsonsrc);
  if (!node['attributes']) {
    node['attributes'] = {};
  }
  const { attributes } = node;
  for(const prop of props) {
    if (JSONSRC2NODE[prop]) {
      JSONSRC2NODE[prop](attributes, jsonsrc[prop]);
    } else if (prop !== 'children') {
      console.error('>>>>>>>> NOT EXPECTED Prop in json-src:', prop);
    }
  }
  const children = jsonsrc['children'];
  if (children && children.length) {
    node['children'] = new Array(children.length)
    for (let i = 0; i < children.length; i ++) {
      node['children'][i] = jsonsrc2node(children[i]);
    }
  }
  return node;
}

/**
 * 
 * @param {string | object} src 
 */
export async function parseAndVizSource(src, outDir, outFilePrefix) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  let node;
  if (typeof src === 'string') {
    const srcPath = path.join(outDir, `${outFilePrefix}.xml`);
    fs.writeFileSync(srcPath, src);
    // parse xml-src to ui-node
    node = parsePageSrc(src);
  } else {
    const srcPath = path.join(outDir, `${outFilePrefix}.json`);
    fs.writeFileSync(srcPath, JSON.stringify(src, undefined, 2));
    // convert json-src to ui-node
    node = jsonsrc2node(src);
  }

  const jsonPath = path.join(outDir, `${outFilePrefix}-node.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(node, undefined, 2));

  const imgPath = path.join(outDir, `${outFilePrefix}.png`);
  return await visualizePageNode(node, imgPath);
}
