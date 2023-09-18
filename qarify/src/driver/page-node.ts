import type { QAPageNode, QAPageNodeAttribute } from '@qarify/types';
import { DOMParser } from '@xmldom/xmldom';
import XPath from 'xpath';

let _pageDoc: Document | undefined = undefined;

// Attributes on nodes that we know are unique to the node
const UNIQUE_XPATH_ATTRIBUTES = ['axId', 'accessibility-id', 'name', 'id', 'content-desc'];

type PageParserOptions = {
  xpath?: boolean;
  title?: boolean;
};

export function parsePageSrc(pageSrc: string, { xpath, title }: PageParserOptions = {} ): QAPageNode {
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
      path,
      children: _childNodesOf(xmlNode).map((childNode, childIndex) =>
        translateRecursively(childNode, path, childIndex)
      ),
      ...(xpath ? {xpath: getOptimalXPath(_pageDoc!, xmlNode, UNIQUE_XPATH_ATTRIBUTES)} : {}),
      ...(title ? {title: _getTitle(xmlNode.tagName, attributes)} : {}),
    };
  };

  return firstChild ? translateRecursively(firstChild) : ({} as QAPageNode);
}

function _getTitle(tagName: string, attributes: QAPageNodeAttribute) {
  const { name, text } = attributes;
  const moreTitle = text ? ` [text=${text}]` : name ? ` [name=${name}]` : '';
  return `${tagName}${moreTitle.length > 20 ? (moreTitle.substring(0, 20) + '...') : moreTitle}`;
}

export const _getPageDoc = () => _pageDoc;

export function isUniqueAttribute(attrName: string, attrValue: string) {
  // If no sourceXML provided, assume it's unique
  if (!_pageDoc) {
    return true;
  }
  // eslint-disable-next-line no-useless-escape
  return (XPath.select(`/\/*[@${attrName}="${attrValue.replace(/"/g, '')}"]`, _pageDoc)as Array<Node>).length < 2;
}

/**
 * Get an optimal XPath for a DOMNode
 * @param doc
 * @param domNode
 */
export function getOptimalXPath(
  doc: Document,
  domNode?: Element,
  uniqueAttributes = UNIQUE_XPATH_ATTRIBUTES
): string | undefined {
  try {
    // BASE CASE #1: If this isn't an element, we're above the root, return empty string
    if (!domNode || !domNode.tagName || domNode.nodeType !== 1) {
      return '';
    }

    // BASE CASE #2: If this node has a unique attribute, return an absolute XPath with that attribute
    for (const attrName of uniqueAttributes) {
      const attrValue = domNode.getAttribute(attrName);
      if (attrValue) {
        let xpath = `//${domNode.tagName || '*'}[@${attrName}="${attrValue}"]`;
        let othersWithAttr;

        // If the XPath does not parse, move to the next unique attribute
        try {
          othersWithAttr = XPath.select(xpath, doc);
        } catch (ign) {
          continue;
        }

        // If the attribute isn't actually unique, get it's index too
        if (othersWithAttr && (othersWithAttr as Node[]).length > 1) {
          const index = (othersWithAttr as Node[]).indexOf(domNode);
          xpath = `(${xpath})[${index + 1}]`;
        }
        return xpath;
      }
    }

    // Get the relative xpath of this node using tagName
    let xpath = `/${domNode.tagName}`;

    // If this node has siblings of the same tagName, get the index of this node
    if (domNode.parentNode) {
      // Get the siblings
      const childNodes = Array.prototype.slice
        .call(domNode.parentNode.childNodes, 0)
        .filter((childNode) => childNode.nodeType === 1 && childNode.tagName === domNode.tagName);

      // If there's more than one sibling, append the index
      if (childNodes.length > 1) {
        const index = childNodes.indexOf(domNode);
        xpath += `[${index + 1}]`;
      }
    }

    // Make a recursive call to this nodes parents and prepend it to this xpath
    return getOptimalXPath(doc, domNode.parentNode as Element, uniqueAttributes) + xpath;
  } catch (error) {
    // If there's an unexpected exception, abort and don't get an XPath
    console.error(
      `The most optimal XPATH could not be determined because an error was thrown: '${JSON.stringify(
        error,
        null,
        2
      )}'`
    );
    return undefined;
  }
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

export function findPageNodeWindowSize(node: QAPageNode): { width: number, height: number } | undefined {
  let res = findPageNode(node, '');
  if (res && res.tagName === 'UI' && res.children && res.children.length) {
    const tagName = res.children[0].tagName;
    if (tagName === 'App' && res.children[0].attributes.width && res.children[0].attributes.height) {
      // props from 'App' tag
      return {
        width: res.children[0].attributes.width,
        height: res.children[0].attributes.height,
      };
    }
    if (tagName === 'View' && res.attributes.width && res.attributes.height) {
      // props from 'UI' tag
      return {
        width: res.attributes.width,
        height: res.attributes.height,
      };
    }
  }
  return undefined;
}

export function findPageNodeScrollPosition(node: QAPageNode): { verticalValue: number, verticalPages: number, horizontalValue: number, horizontalPages: number } {
  let horizontalValue = 0;
  let verticalValue = 0;
  let horizontalPages = 1;
  let verticalPages = 1;
  const scrollBarEle = filterPageNode(node, {
    hasValue: true, hasAxId: true, hasText: true,
    attributes: {
      axId: /^(vertical|horizontal) scroll bar,/i,
    }
  });
  if (scrollBarEle && scrollBarEle.length) {
    const verticalNode = scrollBarEle.find((e) => e.attributes.axId?.toLowerCase().startsWith('vertical'));
    if (verticalNode) {
      verticalValue = parseInt(verticalNode.attributes.value!);
      verticalPages = parseInt(verticalNode.attributes.axId?.split(',')[1]!)
    }
    const horizontalNode = scrollBarEle.find((e) => e.attributes.axId?.toLowerCase().startsWith('horizontal'));
    if (horizontalNode) {
      horizontalValue = parseInt(horizontalNode.attributes.value!);
      horizontalPages = parseInt(horizontalNode.attributes.axId?.split(',')[1]!)
    }
  }
  return {
    verticalValue,
    verticalPages,
    horizontalValue,
    horizontalPages,
  }
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

export function _childNodesOf(xmlNode: Document | HTMLElement | Element): Element[] {
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

type AttrName = keyof QAPageNodeAttribute;
type FilterPageNodeOptions = {
  hasText?: boolean,
  hasValue?: boolean,
  hasAxId?: boolean,
  attributes?: {
    [Attr in AttrName]?: QAPageNodeAttribute[Attr] extends (string|undefined) ? (string | RegExp) : QAPageNodeAttribute[Attr]
  },
};

type QAPageNodeAttributeKeys = Array<keyof QAPageNodeAttribute>;
function _filterPageNode(nodes: QAPageNode[], options: FilterPageNodeOptions, attrKeys: QAPageNodeAttributeKeys, res: QAPageNode[]) {
  const {
    hasText, hasValue, hasAxId, attributes,
  } = options;

  for (const item of nodes) {
    const { attributes: attr } = item;
    let match = !!attr;

    if (match && typeof hasText !== 'undefined') {
      match = hasText ? !!attr.text : !attr.text;
    }
    if (match && typeof hasValue !== 'undefined') {
      match = hasValue ? !!attr.value : !attr.value;
    }
    if (match && typeof hasAxId !== 'undefined') {
      match = hasAxId ? !!attr.axId : !attr.axId;
    }
    if (match && attrKeys.length && attributes) {
      for (const key of attrKeys) {
        if (attributes[key] instanceof RegExp && (attributes[key] as RegExp).test(item.attributes[key] as string)) {
          continue;
        }
        else if (attributes[key] === item.attributes[key]) {
          continue;
        }
        match = false;
        break;
      }
    }
    if (match) {
      res.push(item);
    }
    if (item.children && item.children.length) {
      _filterPageNode(item.children, options, attrKeys, res);
    }
  }
  return res;
}

export function filterPageNode(node: QAPageNode, options: FilterPageNodeOptions) {
  const res: QAPageNode[] = [];
  const attrKeys = (options && options.attributes ? Object.keys(options.attributes) : []) as QAPageNodeAttributeKeys;
  if (!node || !node.children || !node.children.length) { return res; }
  return _filterPageNode(node.children, options || {}, attrKeys, res);
}
