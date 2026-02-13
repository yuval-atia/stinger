// ── LCS-based line diff ──────────────────────────────────────────────────────

function lcsTable(a, b) {
  const m = a.length;
  const n = b.length;
  // Use flat arrays for performance
  const prev = new Uint16Array(n + 1);
  const curr = new Uint16Array(n + 1);
  const table = [new Uint16Array(prev)];

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    table.push(new Uint16Array(curr));
    prev.set(curr);
    curr.fill(0);
  }

  return table;
}

function backtrack(table, a, b) {
  const result = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'equal', value: a[i - 1], lineA: i, lineB: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
      result.unshift({ type: 'add', value: b[j - 1], lineB: j });
      j--;
    } else {
      result.unshift({ type: 'remove', value: a[i - 1], lineA: i });
      i--;
    }
  }

  return result;
}

export function computeDiff(textA, textB) {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  const table = lcsTable(linesA, linesB);
  const diff = backtrack(table, linesA, linesB);

  let added = 0;
  let removed = 0;
  let unchanged = 0;

  for (const entry of diff) {
    if (entry.type === 'add') added++;
    else if (entry.type === 'remove') removed++;
    else unchanged++;
  }

  return { diff, stats: { added, removed, unchanged } };
}
