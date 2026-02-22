// --- Path utilities ---

/**
 * Build a human-readable path string from an array of segments.
 * @example buildPath(['data', 'users', 0, 'name']) // "data.users[0].name"
 */
export declare function buildPath(segments: (string | number)[]): string;

/**
 * Copy text to the clipboard. Falls back to `document.execCommand` in older browsers.
 */
export declare function copyToClipboard(text: string): Promise<{ success: boolean; error?: string }>;

/**
 * Retrieve the value at the given path segments inside an object.
 */
export declare function getValueAtPath(obj: unknown, segments: (string | number)[]): unknown;

/**
 * Return a new object with `value` set at the given path (immutable).
 */
export declare function setValueAtPath(obj: unknown, segments: (string | number)[], value: unknown): unknown;

/**
 * Return a new object with the node at the given path removed (immutable).
 */
export declare function deleteAtPath(obj: unknown, segments: (string | number)[]): unknown;

/**
 * Return a new object with a key/value pair added to the object at `parentPath` (immutable).
 */
export declare function addKeyToObject(obj: unknown, parentPath: (string | number)[], key: string, value: unknown): unknown;

/**
 * Return a new object with `value` appended to the array at `parentPath` (immutable).
 */
export declare function appendToArray(obj: unknown, parentPath: (string | number)[], value: unknown): unknown;

// --- JSON parser helpers ---

/** Possible return values of `getValueType` */
export type ValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array' | 'undefined';

/**
 * Get the display type of a JSON value.
 */
export declare function getValueType(value: unknown): ValueType;

/**
 * Get a short preview string for a value (e.g. `"Array(3)"`, `"Object(5)"`).
 */
export declare function getPreview(value: unknown, maxLength?: number): string;

// --- Flatten tree ---

/** A flattened tree node */
export interface FlatNode {
  path: (string | number)[];
  pathStr: string;
  keyName: string | number | null;
  value: unknown;
  depth: number;
  valueType: string;
  isExpandable: boolean;
  isExpanded: boolean;
  childCount: number;
  isRoot: boolean;
  preview: string | null;
}

/** Options for `flattenTree` */
export interface FlattenOptions {
  searchQuery?: string;
  matches?: Set<string>;
  filterMode?: boolean;
  diffMap?: Map<string, unknown>;
  side?: 'left' | 'right';
}

/**
 * Flatten a JSON tree into an array of visible nodes.
 * Only children of expanded nodes are included.
 */
export declare function flattenTree(data: unknown, expandedPaths: Set<string>, options?: FlattenOptions): FlatNode[];

/**
 * Build a path-string → index map for O(1) node lookup.
 */
export declare function buildPathIndex(flatNodes: FlatNode[]): Map<string, number>;

// --- Detectors ---

/**
 * Check whether a string looks like an image URL or data-URI.
 */
export declare function isImageUrl(str: string): boolean;

/** Information about a detected date */
export interface DateInfo {
  /** Human-readable format label (e.g. "ISO 8601", "Unix Timestamp (seconds)") */
  type: string;
  /** The parsed `Date` object */
  date: Date;
  /** The original string that was detected */
  original: string;
}

/** Formatted date information */
export interface FormattedDateInfo {
  /** Locale-formatted date string */
  formatted: string;
  /** Format label */
  type: string;
  /** ISO 8601 string */
  iso: string;
}

/**
 * Detect whether a string is a date/timestamp in a common format.
 * Returns date info or `null`.
 */
export declare function detectDateFormat(str: string): DateInfo | null;

/**
 * Format a `DateInfo` into a human-friendly representation.
 */
export declare function formatDateInfo(dateInfo: DateInfo): FormattedDateInfo | null;

/** Information about detected nested JSON */
export interface NestedJsonInfo {
  /** The parsed value */
  parsed: object | unknown[];
  /** Whether the parsed value is an array */
  isArray: boolean;
  /** The original string */
  original: string;
}

/**
 * Detect whether a string contains a JSON object or array.
 * Returns parsed info or `null`.
 */
export declare function detectNestedJson(str: string): NestedJsonInfo | null;

/**
 * Check whether a string is a valid HTTP/HTTPS URL.
 */
export declare function isUrl(str: string): boolean;
