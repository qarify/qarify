import type { QAPageNode, QAPageNodeAttribute } from '@qarify/types';
import { DOMParser } from '@xmldom/xmldom';

let _pageDoc: Document | undefined = undefined;

export function parsePageSrc(pageSrc: string): QAPageNode {
  _pageDoc = new DOMParser().parseFromString(pageSrc);

  // get the first child element node in the doc. some drivers write their xml differently so we
  // first try to find an element as a direct descendend of the doc, then look for one in
  // documentElement
  const firstChild = _childNodesOf(_pageDoc)[0] || _childNodesOf(_pageDoc.documentElement)[0];

  const translateRecursively = (xmlNode: Element, parentPath = '', index?: number): QAPageNode => {
    const attributes = {} as QAPageNodeAttribute;
    for (let attrIdx = 0; attrIdx < xmlNode.attributes.length; attrIdx += 1) {
      const attr = xmlNode.attributes.item(attrIdx);
      if (attr) {
        // @ts-ignore
        attributes[attr.name as AttributeName] = _castAttributeType(attr.name as AttributeName, attr.value);
      }
    }
    // 'label' is legacy prop but use it with 'text'
    if ('text' in attributes) { attributes.label = attributes.text; }
    const path = index === undefined ? '' : `${!parentPath ? '' : `${parentPath}.`}${index}`;

    return {
      tagName: xmlNode.tagName,
      attributes,
      children: _childNodesOf(xmlNode).map((childNode, childIndex) =>
        translateRecursively(childNode, path, childIndex)
      ),
    };
  };

  return firstChild ? translateRecursively(firstChild) : ({} as QAPageNode);
}

export function findPageNode(node: QAPageNode, path: string) {
  if (!node) {return null;}

  if (!path) {return node;}

  const indicies = path.split('.').map((e) => parseInt(e, 10));
  let cur = node;
  for (let i = 0; i < indicies.length; i += 1) {
    if (!cur.children || indicies[i] >= cur.children.length ) {return null;}
    cur = cur.children[indicies[i]];
    if (!cur) {return null;}
  }
  return cur;
}

export function findPageNodePlatform(node: QAPageNode) {
  let res = findPageNode(node, '');
  if (res && res.tagName === 'UI' && res.children && res.children.length) {
    const tagName = res.children[0].tagName;
    if (tagName === 'App') {
      return 'ios';
    }
    if (tagName === 'View') {
      return 'android';
    }
  }
  return 'unknown';
}

export function findPageNodeWindowSize(node: QAPageNode) {
  let res = findPageNode(node, '');
  if (res && res.tagName === 'UI' && res.children && res.children.length) {
    const tagName = res.children[0].tagName;
    if (tagName === 'App') {
      // props from 'App' tag
      return {
        width: res.children[0].attributes.width,
        height: res.children[0].attributes.height,
      };
    }
    if (tagName === 'View') {
      // props from 'UI' tag
      return {
        width: res.attributes.width,
        height: res.attributes.height,
      };
    }
  }
  return undefined;
}


const boolean_props = ['visible', 'accessible'] as Array<QAPageNodeAttribute>;
const number_props = ['x', 'y', 'width', 'height'] as Array<QAPageNodeAttribute>;

function _castAttributeType(name: QAPageNodeAttribute, value: string) {
  if (number_props.indexOf(name) >= 0) {
    return value ? parseInt(value, 10) : 0;
  } else if (boolean_props.indexOf(name) >= 0) {
    return value === 'true';
  } else {
    return value;
  }
}

function _childNodesOf(xmlNode: Document | HTMLElement | Element): Element[] {
  if (!xmlNode || !xmlNode.hasChildNodes()) {
    return [];
  }

  const result = [];
  for (let childIdx = 0; childIdx < xmlNode.childNodes.length; childIdx += 1) {
    const childNode = xmlNode.childNodes.item(childIdx);
    if (childNode.nodeType === 1) { // ELEMENT_NODE
      result.push(childNode);
    }
  }
  return result as Element[];
};
