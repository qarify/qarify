import type {
  QAConfig, QAPageNode, QAPageNodeAttribute, 
} from '@qarify/types';
import jsonpatch from 'fast-json-patch';
import { filterPageNode, type FilterPageNodeOptions } from '@qarify/pages';

import { readPageLayout, savePageLayout, } from '../nodejs/artifacts-utils.js';

/**
 * calculate y-axis overlap ratio over min height among two nodes.
 * @param a 
 * @param b 
 * @returns >= 1 means two nodes are overlapped fully,
 *          > 0 means two nodes are overlapped partially,
 *          <= 0 means two nodes are not overlapped.
 */
function _verticalOverlapRatio(a: QAPageNode, b: QAPageNode) {
  const { y:ay, height:ah } = a.attributes;
  const { y:by, height:bh } = b.attributes;
  return ((ay! + ah!) - by!) / Math.min(ah!, bh!);
}

/**
 * calculate x-axis overlap ratio over mean height of two nodes.
 * @param a 
 * @param b 
 * @returns > 0 means two nodes are overlapped partially,
  *         <= 0 means two nodes are not overlapped.
 */
function _horizontalOverlapRatio(a: QAPageNode, b: QAPageNode) {
  const { x:ax, width:aw, height:ah } = a.attributes;
  const { x:bx, width:bw, height:bh } = b.attributes;
  return ((ax! + aw!) - bx!) / ((ah! + bh!) / 2);
}

type OverlapRatioResult = {
  node: QAPageNode,
  verticalOverlap: number,
  horizontalOverlap: number,
};

type QAPageNodeAttrName = keyof QAPageNodeAttribute;

type OverlapRatioOptions = {
  // line threshold. default is 0.7
  // 0.7 means that it is considered as one line
  // when two nodes are overlapped at least 70%
  lineThreshold?: number,
  // filter attributes
  filterAttributes?: {
    [Attr in QAPageNodeAttrName]?: QAPageNodeAttribute[Attr] extends (string|undefined) ? (string | RegExp) : QAPageNodeAttribute[Attr]
  },
};

/**
 * calculate overlap ratio among rectangles of the children of the specified node.
 * @param node target node
 * @param options 
 * @returns calculation result array
 */
export function calcOverlapRatio(node: QAPageNode, options?: OverlapRatioOptions) {
  const { lineThreshold = 0.7, filterAttributes } = options || {};
  // filter and sort nodes
  const nodes = filterPageNode(node, { leafOnly: true, attributes: filterAttributes })
  .sort((a, b) => {
    const yratio = _verticalOverlapRatio(b, a);
    if (yratio >= lineThreshold) { // same line
      return a.attributes.x! - b.attributes.x!;
    }
    return a.attributes.y! - b.attributes.y!;
  });
  const res: OverlapRatioResult[] = [];

  let curr = nodes[0];
  let next = nodes[0];
  for (let i = 1; i < nodes.length; i++) {
    next = nodes[i];
    res.push({
      verticalOverlap: _verticalOverlapRatio(curr, next),
      horizontalOverlap: _horizontalOverlapRatio(curr, next),
      node: curr,
    });
    curr = next;
  }
  // add last node
  res.push({
    verticalOverlap: 0,
    horizontalOverlap: 0,
    node: next,
  });
  return res;
}

type PageLayoutItem = {
  // tag name
  tag: string;
  // x, y, width, height
  rect: [number, number, number, number],
};

/**
 * find all leaf nodes.
 * @param node 
 * @returns list of tag name and rect of all leaf nodes
 */
export function getPageLayout(node: QAPageNode, filterOptions?: FilterPageNodeOptions) {
  const lineThreshold = 0.7;
  // filter and sort nodes
  const nodes = filterPageNode(node, filterOptions || { leafOnly: true })
  .sort((a, b) => {
    const yratio = _verticalOverlapRatio(b, a);
    if (yratio >= lineThreshold) { // same line
      return a.attributes.x! - b.attributes.x!;
    }
    return a.attributes.y! - b.attributes.y!;
  });
  // add to result
  const res = new Array<PageLayoutItem>(nodes.length);
  for (let i = 0; i < nodes.length; i ++) {
    const node = nodes[i];
    const { attributes } = node;
    res[i] = {
      tag: node.tagName,
      rect: [attributes.x!, attributes.y!, attributes.width!, attributes.height!],
    };
  }
  return res;
}

type ComparePageLayoutOptions = {
  config: QAConfig,
  id: string,
  updateLayout?: boolean,
  doNotSave?: boolean,
};

type ComparePageLayoutDiff = ReturnType<typeof jsonpatch['compare']>[number];
type ComparePageLayoutResult = {
  layout: PageLayoutItem[],
  diff: ComparePageLayoutDiff[],
};

/**
 * compare page layout with the saved one
 * @param node 
 * @param options 
 * @returns 
 */
export async function comparePageLayout(node: QAPageNode, options: ComparePageLayoutOptions) {
  const { config, id, updateLayout, doNotSave } = options;
  let diff = [] as Array<ComparePageLayoutDiff>;

  const layout = getPageLayout(node, {
    leafOnly: true,
    attributes: {
      visible: true,
    },
  });
  const prevLayout = await readPageLayout(config, id);
  if (prevLayout) {
    // console.log('>>> Saved Layout', JSON.parse(prevLayout));
    // console.log('>>> CURR Layout', layout);
    // compare the layouts
    diff = jsonpatch.compare(JSON.parse(prevLayout), layout);
  }
  // save layout
  if (updateLayout || (!prevLayout && !doNotSave)) {
    await savePageLayout(config, id, layout);
  }
  return {
    layout,
    diff,
  };
}

/**
 * get page layout items from the result of comparePageLayout()
 * @param compareResult 
 * @returns 
 */
export function getDiffLayoutItems(compareResult: ComparePageLayoutResult) {
  const { diff, layout } = compareResult;
  const res = new Array<PageLayoutItem>(diff.length);
  for (let i = 0; i < res.length; i ++) {
    // /idx/prop[/idx]
    const vals = diff[i].path.split('/');
    if (vals.length < 3) {
      continue;
    }
    const idx = parseInt(vals[1]);
    res[i] = layout[idx];
  }
  return res;
}