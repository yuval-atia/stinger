/**
 * Character-level (or word-level for longer strings) diff between two strings.
 * Returns an array of { type: 'equal'|'add'|'remove', value } segments.
 */
export function charDiff(strA, strB) {
  if (strA === strB) return [{ type: 'equal', value: strA }];
  // Skip diff for very long strings (performance guard)
  if (strA.length > 5000 || strB.length > 5000) return null;

  // For longer strings, use word-level diff
  if (strA.length > 200 || strB.length > 200) {
    return wordDiff(strA, strB);
  }

  return lcs(strA.split(''), strB.split(''));
}

function wordDiff(strA, strB) {
  const tokensA = tokenize(strA);
  const tokensB = tokenize(strB);
  return lcs(tokensA, tokensB);
}

function tokenize(str) {
  // Split into words and whitespace tokens
  const result = [];
  const regex = /(\S+|\s+)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    result.push(match[0]);
  }
  return result;
}

/**
 * LCS-based diff on token arrays.
 * Returns merged segments of { type, value }.
 */
function lcs(tokensA, tokensB) {
  const m = tokensA.length;
  const n = tokensB.length;

  // Build LCS table
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tokensA[i - 1] === tokensB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to get diff
  const segments = [];
  let i = m, j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokensA[i - 1] === tokensB[j - 1]) {
      segments.push({ type: 'equal', value: tokensA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      segments.push({ type: 'add', value: tokensB[j - 1] });
      j--;
    } else {
      segments.push({ type: 'remove', value: tokensA[i - 1] });
      i--;
    }
  }

  segments.reverse();

  // Merge consecutive same-type segments
  const merged = [];
  for (const seg of segments) {
    if (merged.length > 0 && merged[merged.length - 1].type === seg.type) {
      merged[merged.length - 1].value += seg.value;
    } else {
      merged.push({ ...seg });
    }
  }

  return merged;
}
