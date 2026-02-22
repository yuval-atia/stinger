/** A single difference between two JSON values */
export interface DiffResult {
  /** The kind of change */
  type: 'added' | 'removed' | 'changed' | 'moved';
  /** Path segments to the changed node */
  path: (string | number)[];
  /** Value on the left side (present for 'removed' and 'changed') */
  leftValue?: unknown;
  /** Value on the right side (present for 'added' and 'changed') */
  rightValue?: unknown;
  /** Type name of the left value */
  leftType?: string;
  /** Type name of the right value */
  rightType?: string;
  /** Original array index (present for 'moved') */
  fromIndex?: number;
  /** New array index (present for 'moved') */
  toIndex?: number;
  /** Which side of a move this entry represents */
  side?: 'left' | 'right';
}

/** Map from dot-joined path string to its `DiffResult` */
export type DiffMap = Map<string, DiffResult>;

/** Options for `diffJson` */
export interface DiffOptions {
  /** Explicit key field for smart array matching (auto-detected if omitted) */
  arrayMatchKey?: string;
}

/** A segment of a character-level diff */
export interface CharDiffSegment {
  type: 'equal' | 'add' | 'remove';
  value: string;
}

/**
 * Deep-compare two JSON values and return an array of differences.
 * Arrays are matched smartly using id-like keys when available.
 */
export declare function diffJson(left: unknown, right: unknown, path?: (string | number)[], options?: DiffOptions): DiffResult[];

/**
 * Convert an array of `DiffResult` into a `Map` keyed by dot-joined path
 * for O(1) lookup.
 */
export declare function createDiffMap(diffs: DiffResult[]): DiffMap;

/**
 * Check whether a path (or any of its descendants) has a diff entry.
 */
export declare function pathHasDiff(diffMap: DiffMap, path: (string | number)[]): boolean;

/**
 * Get the diff type for an exact path, or `null` if no diff exists there.
 */
export declare function getDiffType(diffMap: DiffMap, path: (string | number)[]): DiffResult['type'] | null;

/**
 * Character-level (or word-level for longer strings) diff between two strings.
 * Returns `null` for very long strings (> 5 000 chars) as a performance guard.
 */
export declare function charDiff(strA: string, strB: string): CharDiffSegment[] | null;
