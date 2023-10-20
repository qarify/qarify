import type { QAPageNode, QAPageNodeAttribute, QAPageNodeSelector, PageParserOptions } from '@qarify/types';
import { DOMParser } from '@xmldom/xmldom';
import XPath from 'xpath';
import { STRATEGY_MAPPINGS } from '../constants.js';

type QAPageNodeAttrName = keyof QAPageNodeAttribute;

let _pageDoc: Document | undefined = undefined;
export const getPageDoc = () => _pageDoc;

let _pageSrcFormat: PageSrcFormat = 'universal';
export const getPageSrcFormat = () => _pageSrcFormat;

// Attributes on nodes that we know are unique to the node
const UNIQUE_XPATH_ATTRIBUTES = ['axId', 'accessibility-id', 'name', 'id', 'content-desc'];

type PageSrcFormat = 'universal' | 'ios' | 'android'; //typeof PAGE_SRC_FORMAT[number];
const PAGE_SRC_FORMAT: Array<PageSrcFormat> = ['universal', 'ios', 'android'];

type CastFunc<T=any> = (value: string) => T;
const _toInt = (value: string) => value ? parseInt(value, 10) : 0;
const _toBoolean = (value: string) => value === 'true';
const _toString = (value: string) => value;

type PageSrcProps = {
  universal: 'visible' | 'enabled' | 'accessible' | 'x' | 'y' | 'width' | 'height' | 'value' | 'axId' | 'text' | 'id',
  ios:       'visible' | 'enabled' | 'accessible' | 'x' | 'y' | 'width' | 'height' | 'value' | 'name' | 'label',
  android: 'displayed' | 'enabled' | 'checked' | 'selected' | 'bounds' | 'scrollable' | 'text',
};
type PropMap = {
  [format in PageSrcFormat]: {
    [name in PageSrcProps[format][number]]: [QAPageNodeAttrName, CastFunc]
  }
};

// type UniversalFormatProps = keyof PropMap['universal'];
// type IosFormatProps = keyof PropMap['ios'];
// type AndroidFormatProps = keyof PropMap['android'];

const PROP_MAP: PropMap = {
  'universal': {
    'visible': ['visible', _toBoolean],
    'enabled': ['enabled', _toBoolean],
    'accessible': ['accessible', _toBoolean],
    'x': ['x', _toInt],
    'y': ['y', _toInt],
    'width': ['width', _toInt],
    'height': ['height', _toInt],
    'value': ['value', _toString],
    'axId': ['axId', _toString],
    'text': ['text', _toString],
    'id': ['id', _toString],
  },
  'ios': {
    'name': ['axId', _toString],
    'label': ['axId', _toString],
    'visible': ['visible', _toBoolean],
    'enabled': ['enabled', _toBoolean],
    'accessible': ['accessible', _toBoolean],
    'x': ['x', _toInt],
    'y': ['y', _toInt],
    'width': ['width', _toInt],
    'height': ['height', _toInt],
    'value': ['value', _toString],
  },
  'android': {
    'displayed': ['visible', _toBoolean],
    'enabled': ['enabled', _toBoolean],
    'checked': ['value', _toBoolean],
    // 'bounds': using parser
    'text': ['text', _toString],
  },
};

export const PAGE_TAG_MAP: { [format in PageSrcFormat]: Record<string,string> } = {
  'universal': {
    'ROOT': 'UI',
    'App': 'App',
  },
  'ios': {
    'ROOT': 'AppiumAUT',  
    'App': 'XCUIElementTypeApplication',
  },
  'android': {
    'ROOT': 'hierarchy',
    'App': 'android.widget.FrameLayout',
  },
};

const ACCESSIBLE_TAGS = {
  'android.view.View': ['text', 'resource-id'],
  'android.widget.TextView': [],
  'android.widget.Button': [],
  'android.widget.CheckBox': [],
  'android.widget.RadioButton': [],
  'android.widget.ImageButton': [],
  'android.widget.EditText': [],
  'android.widget.ImageView': [],
};
const ACCESSIBLE_TAGS_KEYS = Object.keys(ACCESSIBLE_TAGS);

function _isAccessible(tagName: string, attributes: QAPageNodeAttribute) {
  if (ACCESSIBLE_TAGS_KEYS.indexOf(tagName) < 0) {
    return false;
  }
  if (!attributes.visible) { return false; }

  if (tagName === 'android.view.View') {
    for (const prop of (ACCESSIBLE_TAGS['android.view.View'] as Array<QAPageNodeAttrName>)) {
      if (!attributes[prop]) { return false; }
    }
  }

  return true;
}

function _isControllableTag(tag: string) {
  const PAGE_TAGS = {
    'universal': {
      'UI': 'ROOT',
      'App': 'App',
      'Window': 'Window',

      'View': 'View',
      'Scrollable': 'Scrollable', // text="" x="0" y="231" width="1080" height="1626" visible="true"
      'Button': 'Button',
      'CheckBox': 'CheckBox',
      'SwitchInput': 'SwitchInput',
      'Text': 'Text',
      'TextInput': 'TextInput',
      'Element': 'Element',
      'Nav': 'Nav',
      'Image': 'Image',
      'PickerInput': 'PickerInput',
    },
    'ios': {
      'AppiumAUT': 'ROOT',  
      'XCUIElementTypeApplication': 'App', // name="" label="" enabled="true" visible="true" accessible="false" x="0" y="0" width="390" height="844" index="0"
      'XCUIElementTypeWindow': 'Window',   // enabled="true" visible="true" accessible="false" x="0" y="0" width="390" height="844" index="0"
      'XCUIElementTypeOther': 'Element',   // name="" label="" enabled="true" visible="true" accessible="false" x="0" y="0" width="390" height="844" index="0"
      'XCUIElementTypeStaticText': 'Text', // value="" name="" label="" enabled="true" visible="false" accessible="true" x="-252" y="68" width="252" height="22" index="0"
      'XCUIElementTypeButton': 'Button',   // value="" name="" label="" enabled="true" visible="false" accessible="true" x="-268" y="107" width="256" height="56" index="0"
      'XCUIElementTypeScrollView': 'ScrollView,HorizontalScroll', // enabled="true" visible="true" accessible="false" x="0" y="111" width="390" height="733" index="0"
      'XCUIElementTypeTextField': 'TextField', // value="" name="" label="" enabled="true" visible="true" accessible="true" x="48" y="183" width="334" height="56" index="0"
      'XCUIElementTypeSecureTextField': 'SecureTextField', // value="" name="" label="" enabled="true" visible="true" accessible="true" x="8" y="408" width="334" height="65" index="0"
      'XCUIElementTypeNavigationBar': 'Nav',
      'XCUIElementTypeImage': 'Image',     // enabled="true" visible="true" accessible="false" x="8" y="115" width="183" height="187" index="0"
    },
    'android': {
      'hierarchy': 'ROOT',
      'android.widget.FrameLayout': 'App',
      'android.widget.LinearLayout': 'View',
      'android.view.View': 'View',
      'android.view.ViewGroup': 'View',
      'androidx.appcompat.widget.LinearLayoutCompat': 'View',
      'android.widget.ImageButton': 'ImageButton',
      'android.widget.ImageView': 'Image',
      'android.widget.TextView': 'Text', // text="" resource-id="" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[42,457][944,520]" displayed="true"
      'android.widget.Button': 'Button',   // text="" content-desc="" resource-id="" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[26,95][131,200]" displayed="true"
      'android.widget.CheckBox': 'CheckBox', // text="" content-desc="" checkable="true" checked="true" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[0,420][1080,557]" displayed="true"
      'android.widget.RadioButton': 'Radio', // text="" content-desc="" checkable="true" checked="true" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[944,394][1038,489]" displayed="true"
      'android.widget.ScrollView': 'ScrollView', // text="" checkable="false" checked="false" clickable="false" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="true" selected="false" bounds="[0,231][1080,1857]" displayed="true"
      'android.widget.HorizontalScrollView': 'HorizontalScroll', // text="" checkable="false" checked="false" clickable="false" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="true" selected="false" bounds="[0,373][1080,1024]" displayed="true"
      'android.widget.EditText': 'TextField', // text="" resource-id="" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="true" password="false" scrollable="false" selected="false" bounds="[126,420][1059,567]" displayed="true" hint=""
    },
  };
  
  // @ts-ignore
  if (PAGE_TAGS[_pageSrcFormat][tag]) {
    return true
  }
  console.log('>>> Uncontrolled tag:', tag);
  return false;
}

export function parsePageSrc(pageSrc: string, options: PageParserOptions = {}): QAPageNode {
  _pageDoc = new DOMParser().parseFromString(pageSrc);

  // get the first child element node in the doc. some drivers write their xml differently so we
  // first try to find an element as a direct descendend of the doc, then look for one in
  // documentElement
  const firstChild = _childNodesOf(_pageDoc)[0] || _childNodesOf(_pageDoc.documentElement)[0];
  if (!firstChild) {
    return {} as QAPageNode;
  }
  // page src format
  _pageSrcFormat = _getSrcFormat(firstChild)!;
  if (!_pageSrcFormat) {
    return {} as QAPageNode;
  }

  return _translateRecursively(firstChild, options);
}

function _getSrcFormat(root: Element) {
  for (const f of PAGE_SRC_FORMAT) {
    if (PAGE_TAG_MAP[f]['ROOT'] === root.tagName) {
      return f;
    }
  }
  return undefined;
}

function _translateRecursively (xmlNode: Element, options: PageParserOptions = {}, parentPath = '', index?: number): QAPageNode {
  const { attributes, tagName } = xmlNode;

  // print unknown tags
  // _isControllableTag(tagName);

  // attributes
  const nodeAttrs = {} as QAPageNodeAttribute;
  for (let attrIdx = 0; attrIdx < attributes.length; attrIdx += 1) {
    const attr = attributes.item(attrIdx);
    if (attr) {
      const name = attr.name;
      const caster = PROP_MAP[_pageSrcFormat][name];
      if (caster) {
        nodeAttrs[caster[0]] = caster[1](attr.value)
      } else {
        // @ts-ignore
        nodeAttrs[name] = attr.value;
      }
    }
  }
  if (_pageSrcFormat === 'android') {
    // android has no 'accessible' attribute.
    nodeAttrs['accessible'] = _isAccessible(tagName, nodeAttrs);
    if (nodeAttrs['bounds']) {
      // '[left,top],[right,bottom]'
      const vals = nodeAttrs['bounds'].split('[');
      if (vals.length >= 3) {
        const lt = vals[1].split(',').map(e => parseInt(e));
        const rb = vals[2].split(',').map(e => parseInt(e));
        if (lt.length >= 2 && rb.length >= 2) {
          nodeAttrs.x = lt[0];
          nodeAttrs.y = lt[1];
          nodeAttrs.width = rb[0] - lt[0];
          nodeAttrs.height = rb[1] - lt[1];
        }
      }
      if (!('x' in nodeAttrs)) {
        nodeAttrs.x = nodeAttrs.y = nodeAttrs.width = nodeAttrs.height = 0;
      }
    }
  }
  // 'label' is legacy prop but use it with 'text'
  const path = index === undefined ? '' : `${!parentPath ? '' : `${parentPath}.`}${index}`;
  const { xpath, title } = options;

  return {
    tagName: tagName,
    attributes: nodeAttrs,
    path,
    children: _childNodesOf(xmlNode).map((childNode, childIndex) =>
      _translateRecursively(childNode, options, path, childIndex)
    ),
    ...(xpath ? {xpath: getOptimalXPath(_pageDoc!, xmlNode, UNIQUE_XPATH_ATTRIBUTES)} : {}),
    ...(title ? {title: _getTitle(tagName, nodeAttrs)} : {}),
  };
};

function _getTitle(tagName: string, attributes: QAPageNodeAttribute) {
  const { name, text } = attributes;
  const moreTitle = text ? ` [text=${text}]` : name ? ` [name=${name}]` : '';
  return `${tagName}${moreTitle.length > 20 ? (moreTitle.substring(0, 20) + '...') : moreTitle}`;
}

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

export function isValidRootNode(rootNode: QAPageNode) {
  if (!_pageSrcFormat || !PAGE_TAG_MAP[_pageSrcFormat]['ROOT']) { return false; }
  return rootNode && rootNode.tagName === PAGE_TAG_MAP[_pageSrcFormat]['ROOT'] && rootNode.children && rootNode.children.length;
}

export function findPageNodePlatform(rootNode: QAPageNode) {
  if (isValidRootNode(rootNode)) {
    if (_pageSrcFormat === 'universal') {
      // check the first child of the rootNode
      // ios: UI > App
      // android: UI > View
      const tagName = rootNode.children[0].tagName;
      if (tagName === PAGE_TAG_MAP[_pageSrcFormat]['App']) {
        return 'ios';
      } else {
        return 'android';
      }
    } else {
      return _pageSrcFormat; // ios | android
    }
  }
  return 'unknown';
}

export function findPageWindowSize(rootNode: QAPageNode): { width: number, height: number } | undefined {
  if (isValidRootNode(rootNode)) {
    if ('width' in rootNode.attributes && 'height' in rootNode.attributes) {
      // android(universal) has width and height in the root node
      return {
        width: rootNode.attributes.width!,
        height: rootNode.attributes.height!,
      };
    }
    const tagName = rootNode.children[0].tagName;
    if (tagName === PAGE_TAG_MAP[_pageSrcFormat]['App'] && rootNode.children[0].attributes.width && rootNode.children[0].attributes.height) {
      // ios(its universal) has width and height in the 'App' node
      // props from 'App' tag
      return {
        width: rootNode.children[0].attributes.width,
        height: rootNode.children[0].attributes.height,
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

type FilterPageNodeOptions = {
  hasText?: boolean,
  hasValue?: boolean,
  hasAxId?: boolean,
  attributes?: {
    [Attr in QAPageNodeAttrName]?: QAPageNodeAttribute[Attr] extends (string|undefined) ? (string | RegExp) : QAPageNodeAttribute[Attr]
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

export function getLocators(attributes: QAPageNodeAttribute) {
  const res = [] as Array<QAPageNodeSelector>;
  for (const [attr, strategy] of STRATEGY_MAPPINGS) {
    const locator = attributes[attr] as string;
    if (locator && isUniqueAttribute(attr, locator)) {
      res.push({
        strategy,
        locator,
      });
    }
  }
  return res;
}
