# @stingr/json-viewer

A full-featured JSON tree viewer React component with virtual scrolling, search, inline editing, node pinning, and character-level diffs.

Built for [stingr.dev](https://stingr.dev) — a browser-based developer toolkit.

## Install

```bash
npm install @stingr/json-viewer
```

## Quick Start

```jsx
import { JsonViewer } from '@stingr/json-viewer';
import '@stingr/json-viewer/styles';

function App() {
  const data = {
    name: "Example",
    version: "1.0.0",
    features: ["search", "editing", "diffing"],
    nested: { count: 42, active: true }
  };

  return <JsonViewer data={data} />;
}
```

## Features

- **Virtual scrolling** — handles large JSON (thousands of nodes) smoothly
- **Search** — full-text search with match highlighting, navigation, and filter mode
- **Inline editing** — edit values, add/delete keys directly in the tree
- **Node pinning** — pin important nodes so they stay expanded
- **Character-level diffs** — compare two JSON objects with granular change highlighting
- **Smart detection** — auto-detects dates, URLs, images, and nested JSON strings
- **Dark mode** — built-in light/dark/auto theme support
- **Path copying** — copy JSONPath, values, or minified subtrees to clipboard
- **Keyboard navigation** — arrow key navigation through search matches
- **Zero dependencies** — only requires React 18+ as a peer dependency

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `unknown` | required | The JSON data to display |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color theme |
| `searchable` | `boolean` | `true` | Show the search bar |
| `editable` | `boolean` | `false` | Allow inline editing |
| `defaultExpandDepth` | `number` | `1` | Initial tree expansion depth |
| `height` | `number \| string` | — | Fixed height (enables scroll container) |
| `virtualizeThreshold` | `number` | `500` | Node count before virtualization kicks in |
| `className` | `string` | — | Additional CSS class |
| `diff` | `DiffConfig` | — | Enable diff mode (see below) |
| `onEdit` | `(op: EditOperation) => void` | — | Called on edit/delete/add |
| `onSelect` | `(path, value) => void` | — | Called on breadcrumb click |
| `onCopy` | `(info: CopyInfo) => void` | — | Called on copy actions |
| `onNotify` | `(message: string) => void` | — | Custom notification handler |
| `expandedPaths` | `Set<string>` | — | Controlled expanded paths |
| `onExpandedPathsChange` | `(paths: Set<string>) => void` | — | Expand state callback |
| `pinnedPaths` | `Set<string>` | — | Controlled pinned paths |
| `onPinnedPathsChange` | `(paths: Set<string>) => void` | — | Pin state callback |

## Diff Mode

Compare two JSON objects side by side with character-level highlighting:

```jsx
import { JsonViewer } from '@stingr/json-viewer';
import { diffJson, createDiffMap } from '@stingr/json-viewer/diff';
import '@stingr/json-viewer/styles';

const left = { name: "Alice", age: 30, role: "dev" };
const right = { name: "Alice", age: 31, role: "lead" };

function DiffView() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <JsonViewer data={left} diff={{ data: right, side: 'left' }} />
      <JsonViewer data={right} diff={{ data: left, side: 'right' }} />
    </div>
  );
}
```

### Diff Utilities

```js
import { diffJson, createDiffMap, charDiff } from '@stingr/json-viewer/diff';

const diffs = diffJson(oldData, newData);
const diffMap = createDiffMap(diffs);
// diffMap is a Map<string, DiffResult> keyed by path
```

| Function | Description |
|----------|-------------|
| `diffJson(left, right)` | Deep compare two values, returns `DiffResult[]` |
| `createDiffMap(diffs)` | Convert diff array to `Map` for O(1) path lookup |
| `pathHasDiff(diffMap, path)` | Check if a path or its descendants have diffs |
| `getDiffType(diffMap, path)` | Get the diff type at a specific path |
| `charDiff(strA, strB)` | Character-level string diff |

## useJsonTree Hook

For advanced use cases, use the `useJsonTree` hook to manage tree state yourself:

```jsx
import { TreeView, useJsonTree, TreeProvider } from '@stingr/json-viewer';
import '@stingr/json-viewer/styles';

function CustomViewer({ data }) {
  const tree = useJsonTree(data, { defaultExpandDepth: 2 });

  return (
    <TreeProvider>
      <div>
        <button onClick={tree.expandAll}>Expand All</button>
        <button onClick={tree.collapseAll}>Collapse All</button>
        <span>{tree.search.matches} matches</span>
      </div>
      <TreeView
        data={data}
        searchQuery={tree.search.activeQuery}
        controlledExpandedPaths={tree.expandedPaths}
        onTogglePath={tree.togglePath}
        pinnedPaths={tree.pinnedPaths}
        onTogglePin={tree.togglePin}
      />
    </TreeProvider>
  );
}
```

### Hook Return Value

| Property | Description |
|----------|-------------|
| `expandedPaths` | Current expanded paths (includes pinned ancestors) |
| `expandToDepth(n)` | Expand tree to depth n |
| `expandAll()` | Expand all nodes |
| `collapseAll()` | Collapse all (pinned nodes stay open) |
| `togglePath(path, isExpanded)` | Toggle a single node |
| `pinnedPaths` | Current pinned paths |
| `togglePin(path)` | Toggle pin on a node |
| `clearPins()` | Remove all pins |
| `search.query` | Current search input |
| `search.setQuery(value)` | Update search (debounced) |
| `search.activeQuery` | Committed search query |
| `search.matches` | Total match count |
| `search.currentMatch` | Current highlighted match index |
| `search.next()` / `search.prev()` | Navigate matches |
| `search.filterMode` | Whether filter mode is active |
| `search.toggleFilter()` | Toggle filter mode |

## Utility Functions

```js
import {
  buildPath,
  getValueAtPath,
  setValueAtPath,
  deleteAtPath,
  flattenTree,
  isImageUrl,
  detectDateFormat,
  isUrl,
  detectNestedJson,
} from '@stingr/json-viewer/utils';
```

| Function | Description |
|----------|-------------|
| `buildPath(segments)` | Convert path array to readable string (`data.users[0].name`) |
| `getValueAtPath(obj, segments)` | Get value at a path |
| `setValueAtPath(obj, segments, value)` | Immutable set at path |
| `deleteAtPath(obj, segments)` | Immutable delete at path |
| `flattenTree(data, expandedPaths)` | Flatten visible tree nodes |
| `isImageUrl(str)` | Detect image URLs and data URIs |
| `detectDateFormat(str)` | Detect date strings and timestamps |
| `isUrl(str)` | Detect HTTP/HTTPS URLs |
| `detectNestedJson(str)` | Detect JSON strings inside values |

## Styling

The package includes its own CSS. Import it once:

```js
import '@stingr/json-viewer/styles';
```

The component respects a `.dark` class on `<html>` for dark mode, or use the `theme` prop to control it directly.

## Requirements

- React 18+
- react-dom 18+

## License

MIT
