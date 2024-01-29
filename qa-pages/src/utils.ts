export function shortenNodePath(str: string) {
  const input = str.split('.');
  let cnt = 0;
  let last = '';
  const len = input.length;
  const res: string[] = [];
  for (let i = 0; i < len; i ++) {
    const cur = input[i];
    if (last !== cur) {
      if (last) {
        res.push(cnt > 1 ? `${last}_${cnt}` : last);
      }
      last = cur;
      cnt = 1;
    } else {
      cnt++;
    }
  }
  if (last) {
    res.push(cnt > 1 ? `${last}_${cnt}` : last);
  }
  return res.join('.');
}

export function lengthenNodePath(str: string) {
  const input = str.split('.');
  const res: string[] = [];
  const len = input.length;
  for (let i = 0; i < len; i ++) {
    const val = input[i].split('_');
    if (val.length === 1) {
      res.push(val[0]);
    } else {
      let cnt = parseInt(val[1]);
      while (cnt-- > 0) {
        res.push(val[0]);
      }
    }
  }
  return res.join('.');
}