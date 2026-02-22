import { ComponentType, ReactNode } from 'react';

/** Theme mode for the JSON viewer */
export type Theme = 'light' | 'dark' | 'auto';

/** Edit operation emitted by the `onEdit` callback */
export interface EditOperation {
  type: 'edit' | 'delete' | 'add';
  path: (string | number)[];
  /** The new value (present for 'edit' and 'add') */
  value?: unknown;
  /** The key name when adding a new key to an object */
  key?: string;
}

/** Copy event info emitted by the `onCopy` callback */
export interface CopyInfo {
  /** What was copied */
  type: 'path' | 'value' | 'minified' | 'keys';
  /** Path segments to the copied node */
  path: (string | number)[];
  /** The string that was written to the clipboard */
  value: string;
}

/** Configuration for the diff overlay */
export interface DiffConfig {
  /** The data to diff against */
  data: unknown;
  /** Which side this viewer represents. Defaults to `'left'`. */
  side?: 'left' | 'right';
}

/** Props for the `JsonViewer` component */
export interface JsonViewerProps {
  /** The JSON data to display */
  data: unknown;
  /** Allow inline editing of values. Defaults to `false`. */
  editable?: boolean;
  /** Show the search bar. Defaults to `true`. */
  searchable?: boolean;
  /** Diff configuration to highlight differences against another JSON value */
  diff?: DiffConfig;
  /** Number of nesting levels to expand initially. Defaults to `1`. */
  defaultExpandDepth?: number;
  /** Fixed height (px number or CSS string) — enables scrollable container */
  height?: number | string;
  /** Node count above which the tree virtualises rendering. Defaults to `500`. */
  virtualizeThreshold?: number;
  /** Additional CSS class names for the wrapper element */
  className?: string;
  /**
   * Color theme.
   * - `'light'` — force light mode
   * - `'dark'`  — force dark mode
   * - `'auto'`  — inherit from an ancestor `.dark` class (default)
   */
  theme?: Theme;
  /** Called when the user edits, deletes, or adds a node */
  onEdit?: (operation: EditOperation) => void;
  /** Called when the user clicks a breadcrumb path */
  onSelect?: (path: (string | number)[], value: unknown) => void;
  /** Called when the user copies a path, value, minified JSON, or keys */
  onCopy?: (info: CopyInfo) => void;
  /** Called instead of the built-in toast when a notification is triggered (e.g. "Copied!") */
  onNotify?: (message: string) => void;
  /** Controlled expanded paths (set of dot-joined path strings) */
  expandedPaths?: Set<string>;
  /** Callback when expanded paths change (controlled mode) */
  onExpandedPathsChange?: (paths: Set<string>) => void;
  /** Controlled pinned paths */
  pinnedPaths?: Set<string>;
  /** Callback when pinned paths change (controlled mode) */
  onPinnedPathsChange?: (paths: Set<string>) => void;
}

/** Options for the `useJsonTree` hook */
export interface UseJsonTreeOptions {
  /** Number of nesting levels to expand initially. Defaults to `0`. */
  defaultExpandDepth?: number;
  /** Controlled expanded paths */
  expandedPaths?: Set<string>;
  /** Callback when expanded paths change */
  onExpandedPathsChange?: (paths: Set<string>) => void;
  /** Controlled pinned paths */
  pinnedPaths?: Set<string>;
  /** Callback when pinned paths change */
  onPinnedPathsChange?: (paths: Set<string>) => void;
}

/** Search state returned by `useJsonTree` */
export interface SearchState {
  /** Current search input value */
  query: string;
  /** Update the search input (debounces activation) */
  setQuery: (value: string) => void;
  /** The active (committed) search query */
  activeQuery: string;
  /** Total number of matches */
  matches: number;
  /** Zero-based index of the currently highlighted match */
  currentMatch: number;
  /** Navigate to the next match */
  next: () => void;
  /** Navigate to the previous match */
  prev: () => void;
  /** Commit the search immediately */
  submit: () => void;
  /** Whether filter mode is active (hides non-matching nodes) */
  filterMode: boolean;
  /** Toggle filter mode on/off */
  toggleFilter: () => void;
  /** Internal callback for TreeView to report match count changes */
  onMatchCountChange: (count: number, expandedPaths?: Set<string>) => void;
}

/** A flattened tree node used for virtualisation */
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

/** Return value of the `useJsonTree` hook */
export interface UseJsonTreeReturn {
  /** Effective expanded paths (including pinned ancestors) */
  expandedPaths: Set<string>;
  /** Expand all nodes up to the given depth */
  expandToDepth: (depth: number) => void;
  /** Expand every node */
  expandAll: () => void;
  /** Collapse every node */
  collapseAll: () => void;
  /** Toggle a single path's expanded state */
  togglePath: (pathStr: string, isExpanded: boolean) => void;
  /** Currently pinned paths */
  pinnedPaths: Set<string>;
  /** Toggle pin state for a path */
  togglePin: (pathStr: string) => void;
  /** Remove all pins */
  clearPins: () => void;
  /** Search state and actions */
  search: SearchState;
  /** Flattened visible nodes (for custom rendering or virtualisation) */
  flatNodes: FlatNode[];
  /** Map from path string to flat node index */
  pathIndex: Map<string, number>;
}

/**
 * A full-featured JSON tree viewer React component with virtual scrolling,
 * search, diff, inline editing, and pinning.
 */
export declare const JsonViewer: ComponentType<JsonViewerProps>;
export default JsonViewer;

/**
 * Hook that manages tree expand/collapse, pinning, and search state.
 * Use this for headless control or to build a custom tree UI.
 */
export declare function useJsonTree(data: unknown, options?: UseJsonTreeOptions): UseJsonTreeReturn;

/**
 * Low-level tree rendering component. Use `JsonViewer` for the full experience,
 * or `TreeView` directly if you need custom search/expand wiring.
 */
export declare const TreeView: ComponentType<{
  data: unknown;
  searchQuery?: string;
  onValueEdit?: (path: (string | number)[], newValue: unknown) => void;
  currentMatchIndex?: number;
  onMatchCountChange?: (count: number, expandedPaths?: Set<string>) => void;
  controlledExpandedPaths?: Set<string>;
  onTogglePath?: (pathStr: string, isExpanded: boolean) => void;
  filterMode?: boolean;
  onBreadcrumbPath?: (path: (string | number)[]) => void;
  pinnedPaths?: Set<string>;
  onTogglePin?: (pathStr: string) => void;
  diffMap?: Map<string, unknown>;
  side?: 'left' | 'right';
  onDeleteNode?: (path: (string | number)[]) => void;
  onAddKey?: (parentPath: (string | number)[], key: string, value: unknown) => void;
  onAddArrayItem?: (parentPath: (string | number)[]) => void;
  containerRef?: React.RefObject<HTMLElement>;
  virtualizeThreshold?: number;
}>;

/**
 * Context provider for internal tree notifications.
 * Wrap your tree in this if you use `TreeView` directly.
 */
export declare const TreeProvider: ComponentType<{
  onNotify?: (message: string) => void;
  onCopy?: (info: CopyInfo) => void;
  children: ReactNode;
}>;
