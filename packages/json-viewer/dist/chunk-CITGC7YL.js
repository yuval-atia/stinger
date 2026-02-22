import { getDiffType, pathHasDiff, charDiff } from './chunk-3QC7PK4F.js';
import { buildPath, copyToClipboard, isImageUrl, detectDateFormat, detectNestedJson, isUrl, formatDateInfo, flattenTree, buildPathIndex, getValueType, getPreview } from './chunk-7OZTLRJC.js';
import { lazy, createContext, memo, useState, useRef, useEffect, useCallback, useContext, Suspense, useMemo } from 'react';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { createPortal } from 'react-dom';

function CopyButton({ onClick, tooltip, children, size = "md" }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const sizeClasses = {
    sm: "sjt-w-5 sjt-h-5 sjt-text-xs",
    md: "sjt-w-6 sjt-h-6 sjt-text-sm",
    lg: "sjt-w-8 sjt-h-8 sjt-text-base"
  };
  const handleMouseEnter = () => {
    if (buttonRef.current && tooltip) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top - 4,
        left: rect.left + rect.width / 2
      });
      setShowTooltip(true);
    }
  };
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        ref: buttonRef,
        onClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        className: `${sizeClasses[size]} sjt-flex sjt-items-center sjt-justify-center sjt-rounded sjt-transition-colors`,
        style: {
          color: "var(--sjt-text-secondary)"
        },
        onMouseOver: (e) => {
          e.currentTarget.style.backgroundColor = "var(--sjt-bg-secondary)";
          e.currentTarget.style.color = "var(--sjt-text-primary)";
        },
        onMouseOut: (e) => {
          e.currentTarget.style.backgroundColor = "";
          e.currentTarget.style.color = "var(--sjt-text-secondary)";
        },
        children
      }
    ),
    showTooltip && tooltip && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "sjt-fixed -sjt-translate-x-1/2 -sjt-translate-y-full sjt-px-2 sjt-py-1 sjt-text-xs sjt-rounded sjt-whitespace-nowrap sjt-pointer-events-none sjt-z-[9999]",
        style: {
          top: tooltipPos.top,
          left: tooltipPos.left,
          backgroundColor: "var(--sjt-text-primary)",
          color: "var(--sjt-bg-primary)"
        },
        children: [
          tooltip,
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "sjt-absolute sjt-top-full sjt-left-1/2 -sjt-translate-x-1/2",
              style: { borderWidth: "4px", borderStyle: "solid", borderColor: "var(--sjt-text-primary) transparent transparent transparent" }
            }
          )
        ]
      }
    )
  ] });
}
var CopyButton_default = CopyButton;
var ImagePreview = ({ url, children }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageState, setImageState] = useState("idle");
  const [errorType, setErrorType] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);
  const iconRef = useRef(null);
  const updatePosition = useCallback(() => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: Math.min(rect.right, window.innerWidth - 220)
      });
    }
  }, []);
  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setShowPreview(true);
      if (imageState === "idle") {
        setImageState("loading");
      }
    }, 300);
  }, [imageState, updatePosition]);
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowPreview(false);
  }, []);
  const handleImageLoad = useCallback(() => {
    setImageState("loaded");
  }, []);
  const handleImageError = useCallback(() => {
    const isCrossOrigin = !url.startsWith("data:") && !url.startsWith(window.location.origin);
    if (isCrossOrigin) {
      setErrorType("cors");
    } else {
      setErrorType("load");
    }
    setImageState("error");
  }, [url]);
  useEffect(() => {
    if (showPreview) {
      const handleScroll = () => updatePosition();
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [showPreview, updatePosition]);
  const renderPreviewContent = () => {
    if (imageState === "loading") {
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "sjt-flex sjt-items-center sjt-justify-center sjt-text-xs",
          style: { width: "8rem", height: "5rem", color: "var(--sjt-text-secondary)" },
          children: "Loading..."
        }
      );
    }
    if (imageState === "error") {
      return /* @__PURE__ */ jsxs("div", { className: "sjt-flex sjt-flex-col sjt-items-center sjt-justify-center sjt-p-2 sjt-text-xs sjt-text-center", style: { width: "10rem" }, children: [
        /* @__PURE__ */ jsx("span", { style: { color: "#f87171" }, className: "sjt-mb-1", children: "Failed to load image" }),
        /* @__PURE__ */ jsx("span", { style: { color: "var(--sjt-text-secondary)" }, children: errorType === "cors" ? "CORS policy blocked the request" : "Image could not be loaded" })
      ] });
    }
    return null;
  };
  const previewPopup = showPreview && createPortal(
    /* @__PURE__ */ jsx("div", { className: "sjt", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "sjt-fixed sjt-z-[9999] sjt-p-1 sjt-rounded-lg sjt-shadow-lg",
        style: {
          top: position.top,
          left: position.left,
          transform: "translateY(-100%)",
          minWidth: "80px",
          backgroundColor: "var(--sjt-bg-secondary)",
          border: "1px solid var(--sjt-border-color)"
        },
        children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: url,
              alt: "Preview",
              loading: "lazy",
              onLoad: handleImageLoad,
              onError: handleImageError,
              className: `sjt-rounded ${imageState === "loaded" ? "sjt-block" : "sjt-hidden"}`,
              style: { maxWidth: "200px", maxHeight: "150px", objectFit: "contain" }
            }
          ),
          imageState !== "loaded" && renderPreviewContent()
        ]
      }
    ) }),
    document.body
  );
  return /* @__PURE__ */ jsxs("span", { className: "sjt-inline-flex sjt-items-center sjt-gap-1", children: [
    /* @__PURE__ */ jsx("span", { className: "sjt-truncate", style: { maxWidth: "300px" }, children }),
    /* @__PURE__ */ jsx(
      "span",
      {
        ref: iconRef,
        className: "sjt-text-xs sjt-cursor-pointer sjt-flex-shrink-0",
        style: { color: "var(--sjt-text-secondary)", opacity: 0.6 },
        title: "Image URL - hover to preview",
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        children: "\u{1F5BC}\uFE0F"
      }
    ),
    previewPopup
  ] });
};
var ImagePreview_default = ImagePreview;
var DatePreview = ({ dateInfo, children }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);
  const formattedInfo = formatDateInfo(dateInfo);
  const updatePosition = useCallback(() => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: Math.min(rect.right, window.innerWidth - 280)
      });
    }
  }, []);
  const handleMouseEnter = useCallback(() => {
    updatePosition();
    setShowPreview(true);
  }, [updatePosition]);
  const handleMouseLeave = useCallback(() => {
    setShowPreview(false);
  }, []);
  useEffect(() => {
    if (showPreview) {
      const handleScroll = () => updatePosition();
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [showPreview, updatePosition]);
  const previewPopup = showPreview && createPortal(
    /* @__PURE__ */ jsx("div", { className: "sjt", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "sjt-fixed sjt-z-[9999] sjt-p-3 sjt-rounded-lg sjt-shadow-lg sjt-text-sm",
        style: {
          top: position.top,
          left: position.left,
          transform: "translateY(-100%)",
          minWidth: "200px",
          backgroundColor: "var(--sjt-bg-secondary)",
          border: "1px solid var(--sjt-border-color)"
        },
        children: /* @__PURE__ */ jsxs("div", { className: "sjt-space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "sjt-text-xs", style: { color: "var(--sjt-text-secondary)", marginBottom: "2px" }, children: "Format Type" }),
            /* @__PURE__ */ jsx("div", { className: "sjt-font-medium", style: { color: "var(--sjt-text-primary)" }, children: formattedInfo.type })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "sjt-text-xs", style: { color: "var(--sjt-text-secondary)", marginBottom: "2px" }, children: "Local Time" }),
            /* @__PURE__ */ jsx("div", { style: { color: "var(--sjt-text-primary)" }, children: formattedInfo.formatted })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "sjt-text-xs", style: { color: "var(--sjt-text-secondary)", marginBottom: "2px" }, children: "ISO 8601" }),
            /* @__PURE__ */ jsx("div", { className: "sjt-font-mono sjt-text-xs", style: { color: "var(--sjt-text-primary)" }, children: formattedInfo.iso })
          ] })
        ] })
      }
    ) }),
    document.body
  );
  return /* @__PURE__ */ jsxs("span", { className: "sjt-inline-flex sjt-items-center sjt-gap-1", children: [
    children,
    /* @__PURE__ */ jsx(
      "span",
      {
        ref: iconRef,
        className: "sjt-text-xs sjt-cursor-pointer sjt-flex-shrink-0",
        style: { color: "var(--sjt-text-secondary)", opacity: 0.6 },
        title: "Date/timestamp - hover for details",
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        children: "\u{1F4C5}"
      }
    ),
    previewPopup
  ] });
};
var DatePreview_default = DatePreview;
var Modal = ({ isOpen, onClose, title, children }) => {
  const handleEscape = useCallback((e) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, handleEscape]);
  if (!isOpen) return null;
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: "sjt", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "sjt-fixed sjt-inset-0 sjt-z-[9999] sjt-flex sjt-items-center sjt-justify-center sjt-p-4",
        style: { backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" },
        onClick: handleBackdropClick,
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "sjt-rounded-lg sjt-shadow-2xl sjt-w-full sjt-flex sjt-flex-col",
            style: {
              backgroundColor: "var(--sjt-bg-primary)",
              border: "1px solid var(--sjt-border-color)",
              maxWidth: "56rem",
              maxHeight: "80vh"
            },
            children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "sjt-flex sjt-items-center sjt-justify-between sjt-px-4 sjt-py-3",
                  style: { borderBottom: "1px solid var(--sjt-border-color)" },
                  children: [
                    /* @__PURE__ */ jsx(
                      "h2",
                      {
                        className: "sjt-text-lg sjt-font-semibold",
                        style: { color: "var(--sjt-text-primary)" },
                        children: title
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: onClose,
                        className: "sjt-p-1 sjt-rounded sjt-transition-colors",
                        style: { color: "var(--sjt-text-secondary)" },
                        onMouseOver: (e) => {
                          e.currentTarget.style.backgroundColor = "var(--sjt-bg-secondary)";
                          e.currentTarget.style.color = "var(--sjt-text-primary)";
                        },
                        onMouseOut: (e) => {
                          e.currentTarget.style.backgroundColor = "";
                          e.currentTarget.style.color = "var(--sjt-text-secondary)";
                        },
                        "aria-label": "Close modal",
                        children: /* @__PURE__ */ jsx("svg", { className: "sjt-w-5 sjt-h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "sjt-flex-1 sjt-overflow-auto sjt-p-4", children })
            ]
          }
        )
      }
    ) }),
    document.body
  );
};
var Modal_default = Modal;
var LazyTreeView = lazy(() => import('./TreeView-YPMDJ6MJ.js'));
var NestedJsonPreview = ({ nestedJson, children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState(/* @__PURE__ */ new Set());
  const handleOpen = useCallback(() => {
    setIsModalOpen(true);
    setExpandedPaths(/* @__PURE__ */ new Set());
  }, []);
  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  const handleTogglePath = useCallback((pathStr, isExpanded) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.add(pathStr);
      } else {
        next.delete(pathStr);
      }
      return next;
    });
  }, []);
  const title = nestedJson.isArray ? `Nested JSON Array (${nestedJson.parsed.length} items)` : `Nested JSON Object (${Object.keys(nestedJson.parsed).length} keys)`;
  return /* @__PURE__ */ jsxs("span", { className: "sjt-inline-flex sjt-items-center sjt-gap-1", children: [
    /* @__PURE__ */ jsx("span", { className: "sjt-truncate", style: { maxWidth: "300px" }, children }),
    /* @__PURE__ */ jsx(
      "span",
      {
        onClick: handleOpen,
        className: "sjt-text-xs sjt-cursor-pointer sjt-flex-shrink-0",
        style: { color: "var(--sjt-text-secondary)", opacity: 0.6 },
        title: "Click to open parsed JSON in modal",
        children: "\u{1F4E6}"
      }
    ),
    /* @__PURE__ */ jsx(Modal_default, { isOpen: isModalOpen, onClose: handleClose, title, children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "sjt-rounded-lg sjt-p-4",
        style: {
          backgroundColor: "var(--sjt-bg-secondary)",
          border: "1px solid var(--sjt-border-color)"
        },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "sjt-text-xs sjt-mb-3 sjt-pb-2",
              style: {
                color: "var(--sjt-text-secondary)",
                borderBottom: "1px solid var(--sjt-border-color)"
              },
              children: "This string value contains embedded JSON. Below is the parsed content:"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "sjt-font-mono sjt-text-sm", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { style: { color: "var(--sjt-text-secondary)" }, children: "Loading..." }), children: /* @__PURE__ */ jsx(
            LazyTreeView,
            {
              data: nestedJson.parsed,
              searchQuery: "",
              controlledExpandedPaths: expandedPaths,
              onTogglePath: handleTogglePath
            }
          ) }) })
        ]
      }
    ) })
  ] });
};
var NestedJsonPreview_default = NestedJsonPreview;
var UrlLink = ({ url, children }) => {
  const handleClick = useCallback(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);
  return /* @__PURE__ */ jsxs("span", { children: [
    children,
    /* @__PURE__ */ jsx(
      "span",
      {
        onClick: handleClick,
        className: "sjt-text-xs sjt-cursor-pointer sjt-ml-1",
        style: { color: "var(--sjt-text-secondary)", opacity: 0.6 },
        title: "Click to open URL in new tab",
        children: "\u{1F517}"
      }
    )
  ] });
};
var UrlLink_default = UrlLink;
function InternalToast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: "sjt", children: /* @__PURE__ */ jsx("div", { className: "sjt-fixed sjt-top-4 sjt-right-4 sjt-z-[9999] sjt-flex sjt-flex-col sjt-gap-2", children: toasts.map((toast) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "sjt-flex sjt-items-center sjt-gap-2 sjt-px-3 sjt-py-2 sjt-rounded-lg sjt-shadow-lg sjt-animate-toast-in",
        style: {
          backgroundColor: "var(--sjt-bg-primary, #ffffff)",
          border: "1px solid var(--sjt-border-color, #e5e7eb)"
        },
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "sjt-w-5 sjt-h-5 sjt-flex sjt-items-center sjt-justify-center sjt-rounded-full sjt-text-white sjt-text-xs",
              style: { backgroundColor: "var(--sjt-success-color, #22c55e)" },
              children: "\u2713"
            }
          ),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "sjt-text-sm",
              style: { color: "var(--sjt-text-primary, #1f2937)" },
              children: toast.message
            }
          )
        ]
      },
      toast.id
    )) }) }),
    document.body
  );
}
var InternalToast_default = InternalToast;
var TreeContext = createContext(null);
function TreeProvider({ onNotify, onCopy, children }) {
  const [toasts, setToasts] = useState([]);
  const showNotification = useCallback((message) => {
    if (onNotify) {
      onNotify(message);
      return;
    }
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2e3);
  }, [onNotify]);
  const handleCopy = useCallback((info) => {
    if (onCopy) {
      onCopy(info);
    }
  }, [onCopy]);
  return /* @__PURE__ */ jsxs(TreeContext.Provider, { value: { showNotification, onCopy: handleCopy }, children: [
    children,
    !onNotify && /* @__PURE__ */ jsx(InternalToast_default, { toasts })
  ] });
}
function useTreeContext() {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTreeContext must be used within a TreeProvider");
  }
  return context;
}
function TreeNode({
  keyName,
  value,
  path,
  searchQuery,
  matches,
  expandedPaths,
  controlledExpandedPaths,
  currentMatchPath,
  onValueEdit,
  onTogglePath,
  diffMap,
  side,
  isRoot = false,
  filterMode = false,
  onBreadcrumbPath,
  pinnedPaths,
  onTogglePin,
  showPinHint,
  currentDiffPath,
  jsonpathMatches,
  onDeleteNode,
  onAddKey,
  onAddArrayItem
}) {
  const nodeRef = useRef(null);
  const pathStr = path.join(".");
  const isCurrentMatch = currentMatchPath === pathStr;
  const isCurrentDiffMatch = currentDiffPath === pathStr;
  const isJsonPathMatch = jsonpathMatches == null ? void 0 : jsonpathMatches.has(pathStr);
  const { showNotification, onCopy } = useTreeContext();
  const isPinned = pinnedPaths == null ? void 0 : pinnedPaths.has(pathStr);
  const isExpanded = isRoot || ((expandedPaths == null ? void 0 : expandedPaths.has(pathStr)) ?? false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const copyMenuRef = useRef(null);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  useEffect(() => {
    if (isCurrentMatch && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isCurrentMatch]);
  useEffect(() => {
    if (isCurrentDiffMatch && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isCurrentDiffMatch]);
  useEffect(() => {
    if (!copyMenuOpen) return;
    const handler = (e) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target)) {
        setCopyMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [copyMenuOpen]);
  const valueType = getValueType(value);
  const isExpandable = valueType === "object" || valueType === "array";
  const isMatch = matches == null ? void 0 : matches.has(pathStr);
  const diffType = diffMap ? getDiffType(diffMap, path) : null;
  const hasDiffInChildren = diffMap && isExpandable ? pathHasDiff(diffMap, path) : false;
  const handleToggle = useCallback(() => {
    if (!isRoot && onTogglePath) {
      onTogglePath(pathStr, !isExpanded);
    }
    if (onBreadcrumbPath && path.length > 0) {
      onBreadcrumbPath(path);
    }
  }, [isRoot, onTogglePath, pathStr, isExpanded, onBreadcrumbPath, path]);
  const handleCopyPath = useCallback(async () => {
    const pathString = buildPath(path);
    await copyToClipboard(pathString);
    showNotification("Path copied");
    onCopy({ type: "path", path, value: pathString });
  }, [path, showNotification, onCopy]);
  const handleCopyValue = useCallback(async () => {
    const valueString = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    await copyToClipboard(valueString);
    showNotification("Value copied");
    onCopy({ type: "value", path, value: valueString });
    setCopyMenuOpen(false);
  }, [value, path, showNotification, onCopy]);
  const handleCopyMinified = useCallback(async () => {
    const valueString = JSON.stringify(value);
    await copyToClipboard(valueString);
    showNotification("Minified JSON copied");
    onCopy({ type: "minified", path, value: valueString });
    setCopyMenuOpen(false);
  }, [value, path, showNotification, onCopy]);
  const handleCopyKeys = useCallback(async () => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const keysString = JSON.stringify(Object.keys(value));
      await copyToClipboard(keysString);
      showNotification("Keys copied");
      onCopy({ type: "keys", path, value: keysString });
    }
    setCopyMenuOpen(false);
  }, [value, path, showNotification, onCopy]);
  const handleStartEdit = useCallback(() => {
    if (!onValueEdit) return;
    if (isExpandable) return;
    setEditValue(typeof value === "string" ? value : JSON.stringify(value));
    setIsEditing(true);
  }, [value, isExpandable, onValueEdit]);
  const handleSaveEdit = useCallback(() => {
    if (!onValueEdit) return;
    let newValue = editValue;
    try {
      const parsed = JSON.parse(editValue);
      const parsedType = typeof parsed;
      if (parsedType === "number" || parsedType === "boolean" || parsed === null) {
        newValue = parsed;
      }
    } catch {
    }
    onValueEdit(path, newValue);
    setIsEditing(false);
  }, [editValue, path, onValueEdit]);
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === "Escape") {
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit]
  );
  const diffEntry = diffMap ? diffMap.get(pathStr) : null;
  const getDiffClass = () => {
    if (!diffType) return "";
    switch (diffType) {
      case "added":
        return "diff-added";
      case "removed":
        return "diff-removed";
      case "changed":
        return "diff-changed";
      case "moved":
        return "diff-moved";
      default:
        return "";
    }
  };
  const renderValue = () => {
    if (isEditing) {
      const isLargeValue = editValue.length > 50 || editValue.includes("\n");
      if (isLargeValue) {
        const lineCount = Math.min(10, Math.max(3, editValue.split("\n").length));
        return /* @__PURE__ */ jsx(
          "textarea",
          {
            value: editValue,
            onChange: (e) => setEditValue(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Escape") {
                handleCancelEdit();
              } else if (e.key === "Enter" && e.metaKey) {
                e.preventDefault();
                handleSaveEdit();
              }
            },
            onBlur: (e) => {
              e.stopPropagation();
              handleSaveEdit();
            },
            autoFocus: true,
            rows: lineCount,
            className: "sjt-rounded sjt-px-2 sjt-py-1 sjt-text-sm sjt-w-full sjt-max-w-md sjt-font-mono",
            style: {
              backgroundColor: "var(--sjt-bg-secondary)",
              border: "1px solid var(--sjt-accent-color)",
              resize: "vertical",
              outline: "none"
            },
            placeholder: "Cmd+Enter to save, Esc to cancel"
          }
        );
      }
      return /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: editValue,
          onChange: (e) => setEditValue(e.target.value),
          onKeyDown: handleKeyDown,
          onBlur: (e) => {
            e.stopPropagation();
            handleSaveEdit();
          },
          autoFocus: true,
          className: "sjt-rounded sjt-text-sm",
          style: {
            backgroundColor: "var(--sjt-bg-secondary)",
            border: "1px solid var(--sjt-accent-color)",
            padding: "2px 4px",
            minWidth: "100px",
            width: `${Math.max(100, Math.min(400, editValue.length * 8))}px`,
            outline: "none"
          }
        }
      );
    }
    const highlightText = (text) => {
      if (!searchQuery || !isMatch) return text;
      const query = searchQuery.toLowerCase();
      const lowerText = text.toLowerCase();
      const index = lowerText.indexOf(query);
      if (index === -1) return text;
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        text.substring(0, index),
        /* @__PURE__ */ jsx("span", { className: "highlight-match", children: text.substring(index, index + query.length) }),
        text.substring(index + query.length)
      ] });
    };
    switch (valueType) {
      case "string": {
        let stringContent;
        if (diffType === "changed" && diffEntry && typeof diffEntry.leftValue === "string" && typeof diffEntry.rightValue === "string") {
          const segments = charDiff(diffEntry.leftValue, diffEntry.rightValue);
          if (segments && side) {
            stringContent = /* @__PURE__ */ jsxs("span", { className: "json-string sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: [
              '"',
              segments.map((seg, idx) => {
                if (seg.type === "equal") return /* @__PURE__ */ jsx("span", { children: seg.value }, idx);
                if (side === "left" && seg.type === "remove") return /* @__PURE__ */ jsx("span", { className: "char-diff-remove", children: seg.value }, idx);
                if (side === "right" && seg.type === "add") return /* @__PURE__ */ jsx("span", { className: "char-diff-add", children: seg.value }, idx);
                return null;
              }),
              '"'
            ] });
          } else {
            stringContent = /* @__PURE__ */ jsxs("span", { className: "json-string sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: [
              '"',
              highlightText(value),
              '"'
            ] });
          }
        } else {
          stringContent = /* @__PURE__ */ jsxs("span", { className: "json-string sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: [
            '"',
            highlightText(value),
            '"'
          ] });
        }
        if (isImageUrl(value)) {
          return /* @__PURE__ */ jsx(ImagePreview_default, { url: value, children: stringContent });
        }
        const dateInfo = detectDateFormat(value);
        if (dateInfo) {
          return /* @__PURE__ */ jsx(DatePreview_default, { dateInfo, children: stringContent });
        }
        const nestedJson = detectNestedJson(value);
        if (nestedJson) {
          return /* @__PURE__ */ jsx(NestedJsonPreview_default, { nestedJson, children: stringContent });
        }
        if (isUrl(value)) {
          return /* @__PURE__ */ jsx(UrlLink_default, { url: value, children: stringContent });
        }
        return stringContent;
      }
      case "number":
        return /* @__PURE__ */ jsx("span", { className: "json-number sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: highlightText(String(value)) });
      case "boolean":
        return /* @__PURE__ */ jsx("span", { className: "json-boolean sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: highlightText(String(value)) });
      case "null":
        return /* @__PURE__ */ jsx("span", { className: "json-null sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: highlightText("null") });
      case "array":
        return /* @__PURE__ */ jsx("span", { className: "sjt-cursor-pointer", style: { color: "var(--sjt-text-secondary)" }, onClick: handleToggle, children: getPreview(value) });
      case "object":
        return /* @__PURE__ */ jsx("span", { className: "sjt-cursor-pointer", style: { color: "var(--sjt-text-secondary)" }, onClick: handleToggle, children: getPreview(value) });
      default:
        return /* @__PURE__ */ jsx("span", { children: String(value) });
    }
  };
  const handleNodeClick = useCallback(() => {
    if (onBreadcrumbPath && path.length > 0) {
      onBreadcrumbPath(path);
    }
  }, [onBreadcrumbPath, path]);
  const childHasMatch = useCallback((childPath) => {
    if (!matches) return false;
    const childPathStr = childPath.join(".");
    for (const matchPath of matches) {
      if (matchPath === childPathStr || matchPath.startsWith(childPathStr + ".")) {
        return true;
      }
    }
    return false;
  }, [matches]);
  const renderChildren = () => {
    if (!isExpandable || !isExpanded) return null;
    const entries = valueType === "array" ? value.map((v, i) => [i, v]) : Object.entries(value);
    if (entries.length === 0) {
      return /* @__PURE__ */ jsx("div", { className: "sjt-pl-4 sjt-text-xs sjt-italic", style: { color: "var(--sjt-text-secondary)" }, children: valueType === "array" ? "empty array" : "empty object" });
    }
    const filteredEntries = filterMode && searchQuery && (matches == null ? void 0 : matches.size) > 0 ? entries.filter(([key]) => {
      const childPath = [...path, key];
      return childHasMatch(childPath);
    }) : entries;
    if (filterMode && filteredEntries.length === 0) {
      return null;
    }
    return /* @__PURE__ */ jsx("div", { className: "sjt-pl-4", style: { borderLeft: "1px solid var(--sjt-border-color)" }, children: filteredEntries.map(([key, val]) => /* @__PURE__ */ jsx(
      TreeNode,
      {
        keyName: key,
        value: val,
        path: [...path, key],
        searchQuery,
        matches,
        expandedPaths,
        controlledExpandedPaths,
        currentMatchPath,
        onValueEdit,
        onTogglePath,
        diffMap,
        side,
        filterMode,
        onBreadcrumbPath,
        pinnedPaths,
        onTogglePin,
        showPinHint,
        currentDiffPath,
        jsonpathMatches,
        onDeleteNode,
        onAddKey,
        onAddArrayItem
      },
      key
    )) });
  };
  return /* @__PURE__ */ jsxs("div", { className: `tree-node ${getDiffClass()}`, ref: nodeRef, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `sjt-flex sjt-items-center sjt-gap-1 sjt-py-0.5 sjt-group sjt-rounded sjt-px-1 -sjt-mx-1 ${isCurrentMatch ? "search-current-match" : isMatch ? "search-other-match" : ""} ${isCurrentDiffMatch ? "diff-current-match" : ""} ${isJsonPathMatch ? "jsonpath-match" : ""} ${hasDiffInChildren && !diffType ? "has-diff-children" : ""} ${isExpandable ? "sjt-cursor-pointer" : ""} ${isPinned ? "pinned-node" : ""}`,
        style: { "--hover-bg": "var(--sjt-bg-secondary)" },
        onMouseOver: (e) => {
          if (e.currentTarget === e.target || e.currentTarget.contains(e.target)) e.currentTarget.style.backgroundColor = e.currentTarget.style.backgroundColor || "var(--sjt-bg-secondary)";
        },
        onMouseOut: (e) => {
          if (!e.currentTarget.classList.contains("search-current-match") && !e.currentTarget.classList.contains("search-other-match") && !e.currentTarget.classList.contains("diff-current-match") && !e.currentTarget.classList.contains("pinned-node")) e.currentTarget.style.backgroundColor = "";
        },
        onClick: isExpandable ? handleToggle : handleNodeClick,
        "data-pinned-path": isPinned ? pathStr : void 0,
        children: [
          isExpandable ? /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleToggle,
              className: "sjt-w-4 sjt-h-4 sjt-flex sjt-items-center sjt-justify-center sjt-flex-shrink-0",
              style: { color: "var(--sjt-text-secondary)" },
              children: isExpanded ? "\u25BC" : "\u25B6"
            }
          ) : /* @__PURE__ */ jsx("span", { className: "sjt-w-4 sjt-flex-shrink-0" }),
          keyName !== null && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "json-key sjt-cursor-pointer",
                onClick: isExpandable ? handleToggle : void 0,
                title: isExpandable ? "Click to expand/collapse" : void 0,
                children: typeof keyName === "number" ? `[${keyName}]` : keyName
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: isExpandable ? "sjt-cursor-pointer" : "",
                style: { color: "var(--sjt-text-secondary)" },
                onClick: isExpandable ? handleToggle : void 0,
                children: ":"
              }
            )
          ] }),
          diffType === "moved" && diffEntry && /* @__PURE__ */ jsx("span", { className: "sjt-text-[10px] sjt-px-1 sjt-py-0.5 sjt-rounded sjt-whitespace-nowrap", style: { backgroundColor: "var(--sjt-diff-move)", color: "var(--sjt-diff-move-text)" }, children: diffEntry.side === "left" ? `moved to [${diffEntry.toIndex}]` : `moved from [${diffEntry.fromIndex}]` }),
          /* @__PURE__ */ jsx("span", { className: "sjt-flex-1", onClick: isExpandable ? void 0 : (e) => e.stopPropagation(), children: renderValue() }),
          /* @__PURE__ */ jsxs("div", { className: "sjt-flex-shrink-0 sjt-flex sjt-items-center sjt-gap-1", onClick: (e) => e.stopPropagation(), children: [
            !isRoot && onTogglePin && /* @__PURE__ */ jsxs("span", { className: `sjt-transition-opacity sjt-relative ${isPinned ? "" : showPinHint && path.length === 1 && isExpandable ? "sjt-opacity-40" : "sjt-opacity-0 group-hover:sjt-opacity-100"}`, children: [
              /* @__PURE__ */ jsx(CopyButton_default, { onClick: () => onTogglePin(pathStr), tooltip: isPinned ? "Unpin node" : "Pin node", size: "sm", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-4 sjt-h-4 sjt-translate-y-0.5", children: /* @__PURE__ */ jsx("path", { d: "M10.97 2.22a.75.75 0 0 1 1.06 0l1.75 1.75a.75.75 0 0 1-.177 1.206l-2.12 1.061a1.5 1.5 0 0 0-.653.737l-.706 1.765a.75.75 0 0 1-1.239.263L7.25 7.363 4.03 10.584a.75.75 0 0 1-1.06-1.061L6.189 6.3 4.555 4.665a.75.75 0 0 1 .263-1.238l1.765-.706a1.5 1.5 0 0 0 .737-.653l1.06-2.12a.75.75 0 0 1 1.207-.178l.382.383Z" }) }) }),
              showPinHint && path.length === 1 && isExpandable && !isPinned && /* @__PURE__ */ jsx("span", { className: "sjt-absolute -sjt-top-0.5 -sjt-right-0.5 sjt-w-1.5 sjt-h-1.5 sjt-rounded-full sjt-animate-pulse", style: { backgroundColor: "var(--sjt-accent-color)" } })
            ] }),
            !isRoot && /* @__PURE__ */ jsx("span", { className: "sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity", children: /* @__PURE__ */ jsx(CopyButton_default, { onClick: handleCopyPath, tooltip: "Copy path", size: "sm", children: "\u{1F4CB}" }) }),
            isExpandable ? /* @__PURE__ */ jsxs("span", { className: "sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity sjt-relative", ref: copyMenuRef, children: [
              /* @__PURE__ */ jsx(
                CopyButton_default,
                {
                  onClick: () => setCopyMenuOpen((p) => !p),
                  tooltip: valueType === "object" ? `Copy object (${Object.keys(value).length} keys)` : `Copy array (${value.length} items)`,
                  size: "sm",
                  children: "\u{1F4C4}"
                }
              ),
              copyMenuOpen && /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "sjt-absolute sjt-top-full sjt-right-0 sjt-mt-1 sjt-z-50 sjt-rounded-lg sjt-shadow-lg sjt-py-1",
                  style: {
                    width: "8rem",
                    backgroundColor: "var(--sjt-bg-primary)",
                    border: "1px solid var(--sjt-border-color)"
                  },
                  children: [
                    /* @__PURE__ */ jsx("button", { onClick: handleCopyValue, className: "sjt-w-full sjt-text-left sjt-px-3 sjt-py-1.5 sjt-text-xs sjt-transition-colors", style: { color: "var(--sjt-text-primary)" }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "var(--sjt-bg-secondary)", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "", children: "Copy JSON" }),
                    /* @__PURE__ */ jsx("button", { onClick: handleCopyMinified, className: "sjt-w-full sjt-text-left sjt-px-3 sjt-py-1.5 sjt-text-xs sjt-transition-colors", style: { color: "var(--sjt-text-primary)" }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "var(--sjt-bg-secondary)", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "", children: "Copy minified" }),
                    valueType === "object" && /* @__PURE__ */ jsx("button", { onClick: handleCopyKeys, className: "sjt-w-full sjt-text-left sjt-px-3 sjt-py-1.5 sjt-text-xs sjt-transition-colors", style: { color: "var(--sjt-text-primary)" }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "var(--sjt-bg-secondary)", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "", children: "Copy keys" })
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsx("span", { className: "sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity", children: /* @__PURE__ */ jsx(CopyButton_default, { onClick: handleCopyValue, tooltip: "Copy value", size: "sm", children: "\u{1F4C4}" }) }),
            isExpandable && onDeleteNode && /* @__PURE__ */ jsx("span", { className: "sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity", children: /* @__PURE__ */ jsx(
              CopyButton_default,
              {
                onClick: () => {
                  if (valueType === "array") {
                    onAddArrayItem(path);
                  } else {
                    setIsAddingKey(true);
                    setNewKeyName("");
                    setNewKeyValue("");
                  }
                },
                tooltip: valueType === "array" ? "Add item" : "Add key",
                size: "sm",
                children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-3.5 sjt-h-3.5", children: /* @__PURE__ */ jsx("path", { d: "M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" }) })
              }
            ) }),
            !isRoot && onDeleteNode && /* @__PURE__ */ jsx("span", { className: "sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity", children: /* @__PURE__ */ jsx(CopyButton_default, { onClick: () => onDeleteNode(path), tooltip: "Delete node", size: "sm", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-3.5 sjt-h-3.5", style: { color: "var(--sjt-error-color)" }, children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z", clipRule: "evenodd" }) }) }) })
          ] })
        ]
      }
    ),
    renderChildren(),
    isAddingKey && isExpanded && valueType === "object" && /* @__PURE__ */ jsxs("div", { className: "sjt-pl-8 sjt-py-1 sjt-flex sjt-items-center sjt-gap-1", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: newKeyName,
          onChange: (e) => setNewKeyName(e.target.value),
          placeholder: "key",
          autoFocus: true,
          className: "sjt-rounded sjt-font-mono",
          style: {
            width: "6rem",
            padding: "2px 6px",
            fontSize: "0.75rem",
            backgroundColor: "var(--sjt-bg-secondary)",
            border: "1px solid var(--sjt-accent-color)",
            color: "var(--sjt-text-primary)",
            outline: "none"
          },
          onKeyDown: (e) => {
            if (e.key === "Enter" && newKeyName.trim()) {
              let val = newKeyValue.trim();
              try {
                val = JSON.parse(val);
              } catch {
              }
              onAddKey(path, newKeyName.trim(), val || null);
              setIsAddingKey(false);
            } else if (e.key === "Escape") {
              setIsAddingKey(false);
            }
          }
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "sjt-text-xs", style: { color: "var(--sjt-text-secondary)" }, children: ":" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: newKeyValue,
          onChange: (e) => setNewKeyValue(e.target.value),
          placeholder: "value",
          className: "sjt-rounded sjt-font-mono",
          style: {
            width: "6rem",
            padding: "2px 6px",
            fontSize: "0.75rem",
            backgroundColor: "var(--sjt-bg-secondary)",
            border: "1px solid var(--sjt-border-color)",
            color: "var(--sjt-text-primary)",
            outline: "none"
          },
          onKeyDown: (e) => {
            if (e.key === "Enter" && newKeyName.trim()) {
              let val = newKeyValue.trim();
              try {
                val = JSON.parse(val);
              } catch {
              }
              onAddKey(path, newKeyName.trim(), val || null);
              setIsAddingKey(false);
            } else if (e.key === "Escape") {
              setIsAddingKey(false);
            }
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            if (newKeyName.trim()) {
              let val = newKeyValue.trim();
              try {
                val = JSON.parse(val);
              } catch {
              }
              onAddKey(path, newKeyName.trim(), val || null);
            }
            setIsAddingKey(false);
          },
          className: "sjt-text-xs sjt-rounded sjt-text-white",
          style: { padding: "2px 6px", backgroundColor: "var(--sjt-accent-color)" },
          children: "Add"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsAddingKey(false),
          className: "sjt-text-xs sjt-rounded",
          style: { padding: "2px 6px", backgroundColor: "var(--sjt-bg-secondary)", color: "var(--sjt-text-secondary)" },
          children: "Cancel"
        }
      )
    ] })
  ] });
}
var TreeNode_default = TreeNode;
var ROW_HEIGHT = 28;
function FlatTreeNode({
  node,
  style,
  searchQuery,
  matches,
  currentMatchPath,
  onValueEdit,
  onTogglePath,
  diffMap,
  side,
  pinnedPaths,
  onTogglePin,
  showPinHint,
  currentDiffPath,
  jsonpathMatches,
  onDeleteNode,
  onAddKey,
  onAddArrayItem,
  onBreadcrumbPath
}) {
  const {
    path,
    pathStr,
    keyName,
    value,
    depth,
    valueType,
    isExpandable,
    isExpanded,
    childCount,
    isRoot,
    preview
  } = node;
  const { showNotification, onCopy } = useTreeContext();
  const isCurrentMatch = currentMatchPath === pathStr;
  const isCurrentDiffMatch = currentDiffPath === pathStr;
  const isJsonPathMatch = jsonpathMatches == null ? void 0 : jsonpathMatches.has(pathStr);
  const isPinned = pinnedPaths == null ? void 0 : pinnedPaths.has(pathStr);
  const isMatch = matches == null ? void 0 : matches.has(pathStr);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const copyMenuRef = useRef(null);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  useEffect(() => {
    if (!copyMenuOpen) return;
    const handler = (e) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target)) {
        setCopyMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [copyMenuOpen]);
  const diffType = diffMap ? getDiffType(diffMap, path) : null;
  const hasDiffInChildren = diffMap && isExpandable ? pathHasDiff(diffMap, path) : false;
  const diffEntry = diffMap ? diffMap.get(pathStr) : null;
  const handleToggle = useCallback(() => {
    if (!isRoot && onTogglePath) {
      onTogglePath(pathStr, !isExpanded);
    }
    if (onBreadcrumbPath && path.length > 0) {
      onBreadcrumbPath(path);
    }
  }, [isRoot, onTogglePath, pathStr, isExpanded, onBreadcrumbPath, path]);
  const handleCopyPath = useCallback(async () => {
    const pathString = buildPath(path);
    await copyToClipboard(pathString);
    showNotification("Path copied");
    onCopy({ type: "path", path, value: pathString });
  }, [path, showNotification, onCopy]);
  const handleCopyValue = useCallback(async () => {
    const valueString = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    await copyToClipboard(valueString);
    showNotification("Value copied");
    onCopy({ type: "value", path, value: valueString });
    setCopyMenuOpen(false);
  }, [value, path, showNotification, onCopy]);
  const handleCopyMinified = useCallback(async () => {
    const valueString = JSON.stringify(value);
    await copyToClipboard(valueString);
    showNotification("Minified JSON copied");
    onCopy({ type: "minified", path, value: valueString });
    setCopyMenuOpen(false);
  }, [value, path, showNotification, onCopy]);
  const handleCopyKeys = useCallback(async () => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const keysString = JSON.stringify(Object.keys(value));
      await copyToClipboard(keysString);
      showNotification("Keys copied");
      onCopy({ type: "keys", path, value: keysString });
    }
    setCopyMenuOpen(false);
  }, [value, path, showNotification, onCopy]);
  const handleStartEdit = useCallback(() => {
    if (!onValueEdit || isExpandable) return;
    setEditValue(typeof value === "string" ? value : JSON.stringify(value));
    setIsEditing(true);
  }, [value, isExpandable, onValueEdit]);
  const handleSaveEdit = useCallback(() => {
    if (!onValueEdit) return;
    let newValue = editValue;
    try {
      const parsed = JSON.parse(editValue);
      const parsedType = typeof parsed;
      if (parsedType === "number" || parsedType === "boolean" || parsed === null) {
        newValue = parsed;
      }
    } catch {
    }
    onValueEdit(path, newValue);
    setIsEditing(false);
  }, [editValue, path, onValueEdit]);
  const handleCancelEdit = useCallback(() => setIsEditing(false), []);
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);
  const handleNodeClick = useCallback(() => {
    if (onBreadcrumbPath && path.length > 0) onBreadcrumbPath(path);
  }, [onBreadcrumbPath, path]);
  const getDiffClass = () => {
    if (!diffType) return "";
    switch (diffType) {
      case "added":
        return "diff-added";
      case "removed":
        return "diff-removed";
      case "changed":
        return "diff-changed";
      case "moved":
        return "diff-moved";
      default:
        return "";
    }
  };
  const highlightText = (text) => {
    if (!searchQuery || !isMatch) return text;
    const query = searchQuery.toLowerCase();
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(query);
    if (index === -1) return text;
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      text.substring(0, index),
      /* @__PURE__ */ jsx("span", { className: "highlight-match", children: text.substring(index, index + query.length) }),
      text.substring(index + query.length)
    ] });
  };
  const renderValue = () => {
    if (isEditing) {
      return /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: editValue,
          onChange: (e) => setEditValue(e.target.value),
          onKeyDown: handleKeyDown,
          onBlur: () => handleSaveEdit(),
          autoFocus: true,
          className: "sjt-rounded sjt-text-sm",
          style: {
            backgroundColor: "var(--sjt-bg-secondary)",
            border: "1px solid var(--sjt-accent-color)",
            padding: "2px 4px",
            minWidth: "100px",
            width: `${Math.max(100, Math.min(400, editValue.length * 8))}px`,
            outline: "none"
          }
        }
      );
    }
    switch (valueType) {
      case "string": {
        let stringContent;
        if (diffType === "changed" && diffEntry && typeof diffEntry.leftValue === "string" && typeof diffEntry.rightValue === "string") {
          const segments = charDiff(diffEntry.leftValue, diffEntry.rightValue);
          if (segments && side) {
            stringContent = /* @__PURE__ */ jsxs("span", { className: "json-string sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: [
              '"',
              segments.map((seg, idx) => {
                if (seg.type === "equal") return /* @__PURE__ */ jsx("span", { children: seg.value }, idx);
                if (side === "left" && seg.type === "remove") return /* @__PURE__ */ jsx("span", { className: "char-diff-remove", children: seg.value }, idx);
                if (side === "right" && seg.type === "add") return /* @__PURE__ */ jsx("span", { className: "char-diff-add", children: seg.value }, idx);
                return null;
              }),
              '"'
            ] });
          } else {
            stringContent = /* @__PURE__ */ jsxs("span", { className: "json-string sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: [
              '"',
              highlightText(value),
              '"'
            ] });
          }
        } else {
          stringContent = /* @__PURE__ */ jsxs("span", { className: "json-string sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: [
            '"',
            highlightText(value),
            '"'
          ] });
        }
        if (isImageUrl(value)) return /* @__PURE__ */ jsx(ImagePreview_default, { url: value, children: stringContent });
        const dateInfo = detectDateFormat(value);
        if (dateInfo) return /* @__PURE__ */ jsx(DatePreview_default, { dateInfo, children: stringContent });
        const nestedJson = detectNestedJson(value);
        if (nestedJson) return /* @__PURE__ */ jsx(NestedJsonPreview_default, { nestedJson, children: stringContent });
        if (isUrl(value)) return /* @__PURE__ */ jsx(UrlLink_default, { url: value, children: stringContent });
        return stringContent;
      }
      case "number":
        return /* @__PURE__ */ jsx("span", { className: "json-number sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: highlightText(String(value)) });
      case "boolean":
        return /* @__PURE__ */ jsx("span", { className: "json-boolean sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: highlightText(String(value)) });
      case "null":
        return /* @__PURE__ */ jsx("span", { className: "json-null sjt-cursor-pointer", onDoubleClick: handleStartEdit, children: highlightText("null") });
      case "array":
      case "object":
        return /* @__PURE__ */ jsx("span", { className: "sjt-cursor-pointer", style: { color: "var(--sjt-text-secondary)" }, onClick: handleToggle, children: preview });
      default:
        return /* @__PURE__ */ jsx("span", { children: String(value) });
    }
  };
  const showEmptyHint = isExpandable && isExpanded && childCount === 0;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `tree-node ${getDiffClass()}`,
        style,
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: `sjt-flex sjt-items-center sjt-gap-1 sjt-py-0.5 sjt-group sjt-rounded sjt-px-1 ${isCurrentMatch ? "search-current-match" : isMatch ? "search-other-match" : ""} ${isCurrentDiffMatch ? "diff-current-match" : ""} ${isJsonPathMatch ? "jsonpath-match" : ""} ${hasDiffInChildren && !diffType ? "has-diff-children" : ""} ${isExpandable ? "sjt-cursor-pointer" : ""} ${isPinned ? "pinned-node" : ""}`,
            onClick: isExpandable ? handleToggle : handleNodeClick,
            "data-pinned-path": isPinned ? pathStr : void 0,
            style: { paddingLeft: `${depth * 16 + 4}px`, height: `${ROW_HEIGHT}px` },
            children: [
              isExpandable ? /* @__PURE__ */ jsx("button", { onClick: handleToggle, className: "sjt-w-4 sjt-h-4 sjt-flex sjt-items-center sjt-justify-center sjt-flex-shrink-0", style: { color: "var(--sjt-text-secondary)" }, children: isExpanded ? "\u25BC" : "\u25B6" }) : /* @__PURE__ */ jsx("span", { className: "sjt-w-4 sjt-flex-shrink-0" }),
              keyName !== null && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "json-key sjt-cursor-pointer", onClick: isExpandable ? handleToggle : void 0, children: typeof keyName === "number" ? `[${keyName}]` : keyName }),
                /* @__PURE__ */ jsx("span", { className: isExpandable ? "sjt-cursor-pointer" : "", style: { color: "var(--sjt-text-secondary)" }, onClick: isExpandable ? handleToggle : void 0, children: ":" })
              ] }),
              diffType === "moved" && diffEntry && /* @__PURE__ */ jsx("span", { className: "sjt-text-[10px] sjt-px-1 sjt-py-0.5 sjt-rounded sjt-whitespace-nowrap", style: { backgroundColor: "var(--sjt-diff-move)", color: "var(--sjt-diff-move-text)" }, children: diffEntry.side === "left" ? `moved to [${diffEntry.toIndex}]` : `moved from [${diffEntry.fromIndex}]` }),
              /* @__PURE__ */ jsxs("span", { className: "sjt-flex-1 sjt-truncate", onClick: isExpandable ? void 0 : (e) => e.stopPropagation(), children: [
                renderValue(),
                showEmptyHint && /* @__PURE__ */ jsx("span", { className: "sjt-text-xs sjt-italic sjt-ml-1", style: { color: "var(--sjt-text-secondary)" }, children: valueType === "array" ? "empty array" : "empty object" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "sjt-flex-shrink-0 sjt-flex sjt-items-center sjt-gap-1", onClick: (e) => e.stopPropagation(), children: [
                !isRoot && onTogglePin && /* @__PURE__ */ jsxs("span", { className: `sjt-transition-opacity sjt-relative ${isPinned ? "" : showPinHint && path.length === 1 && isExpandable ? "sjt-opacity-40" : "sjt-opacity-0 group-hover:sjt-opacity-100"}`, children: [
                  /* @__PURE__ */ jsx(CopyButton_default, { onClick: () => onTogglePin(pathStr), tooltip: isPinned ? "Unpin node" : "Pin node", size: "sm", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-4 sjt-h-4 sjt-translate-y-0.5", children: /* @__PURE__ */ jsx("path", { d: "M10.97 2.22a.75.75 0 0 1 1.06 0l1.75 1.75a.75.75 0 0 1-.177 1.206l-2.12 1.061a1.5 1.5 0 0 0-.653.737l-.706 1.765a.75.75 0 0 1-1.239.263L7.25 7.363 4.03 10.584a.75.75 0 0 1-1.06-1.061L6.189 6.3 4.555 4.665a.75.75 0 0 1 .263-1.238l1.765-.706a1.5 1.5 0 0 0 .737-.653l1.06-2.12a.75.75 0 0 1 1.207-.178l.382.383Z" }) }) }),
                  showPinHint && path.length === 1 && isExpandable && !isPinned && /* @__PURE__ */ jsx("span", { className: "sjt-absolute -sjt-top-0.5 -sjt-right-0.5 sjt-w-1.5 sjt-h-1.5 sjt-rounded-full sjt-animate-pulse", style: { backgroundColor: "var(--sjt-accent-color)" } })
                ] }),
                !isRoot && /* @__PURE__ */ jsx("span", { className: "sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity", children: /* @__PURE__ */ jsx(CopyButton_default, { onClick: handleCopyPath, tooltip: "Copy path", size: "sm", children: "\u{1F4CB}" }) }),
                isExpandable ? /* @__PURE__ */ jsxs("span", { className: "sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity sjt-relative", ref: copyMenuRef, children: [
                  /* @__PURE__ */ jsx(CopyButton_default, { onClick: () => setCopyMenuOpen((p) => !p), tooltip: valueType === "object" ? `Copy object (${childCount} keys)` : `Copy array (${childCount} items)`, size: "sm", children: "\u{1F4C4}" }),
                  copyMenuOpen && /* @__PURE__ */ jsxs("div", { className: "sjt-absolute sjt-top-full sjt-right-0 sjt-mt-1 sjt-z-50 sjt-rounded-lg sjt-shadow-lg sjt-py-1", style: { width: "8rem", backgroundColor: "var(--sjt-bg-primary)", border: "1px solid var(--sjt-border-color)" }, children: [
                    /* @__PURE__ */ jsx("button", { onClick: handleCopyValue, className: "sjt-w-full sjt-text-left sjt-px-3 sjt-py-1.5 sjt-text-xs sjt-transition-colors", style: { color: "var(--sjt-text-primary)" }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "var(--sjt-bg-secondary)", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "", children: "Copy JSON" }),
                    /* @__PURE__ */ jsx("button", { onClick: handleCopyMinified, className: "sjt-w-full sjt-text-left sjt-px-3 sjt-py-1.5 sjt-text-xs sjt-transition-colors", style: { color: "var(--sjt-text-primary)" }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "var(--sjt-bg-secondary)", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "", children: "Copy minified" }),
                    valueType === "object" && /* @__PURE__ */ jsx("button", { onClick: handleCopyKeys, className: "sjt-w-full sjt-text-left sjt-px-3 sjt-py-1.5 sjt-text-xs sjt-transition-colors", style: { color: "var(--sjt-text-primary)" }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = "var(--sjt-bg-secondary)", onMouseOut: (e) => e.currentTarget.style.backgroundColor = "", children: "Copy keys" })
                  ] })
                ] }) : /* @__PURE__ */ jsx("span", { className: "sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity", children: /* @__PURE__ */ jsx(CopyButton_default, { onClick: handleCopyValue, tooltip: "Copy value", size: "sm", children: "\u{1F4C4}" }) }),
                isExpandable && onDeleteNode && /* @__PURE__ */ jsx("span", { className: "sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity", children: /* @__PURE__ */ jsx(
                  CopyButton_default,
                  {
                    onClick: () => {
                      if (valueType === "array") onAddArrayItem(path);
                      else {
                        setIsAddingKey(true);
                        setNewKeyName("");
                        setNewKeyValue("");
                      }
                    },
                    tooltip: valueType === "array" ? "Add item" : "Add key",
                    size: "sm",
                    children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-3.5 sjt-h-3.5", children: /* @__PURE__ */ jsx("path", { d: "M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" }) })
                  }
                ) }),
                !isRoot && onDeleteNode && /* @__PURE__ */ jsx("span", { className: "sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity", children: /* @__PURE__ */ jsx(CopyButton_default, { onClick: () => onDeleteNode(path), tooltip: "Delete node", size: "sm", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-3.5 sjt-h-3.5", style: { color: "var(--sjt-error-color)" }, children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z", clipRule: "evenodd" }) }) }) })
              ] })
            ]
          }
        )
      }
    ),
    isAddingKey && isExpanded && valueType === "object" && /* @__PURE__ */ jsx(
      "div",
      {
        style: { ...style, top: parseFloat(style.top) + ROW_HEIGHT, height: ROW_HEIGHT },
        className: "sjt-flex sjt-items-center sjt-gap-1",
        children: /* @__PURE__ */ jsxs("div", { style: { paddingLeft: `${(depth + 1) * 16 + 4}px` }, className: "sjt-flex sjt-items-center sjt-gap-1", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: newKeyName,
              onChange: (e) => setNewKeyName(e.target.value),
              placeholder: "key",
              autoFocus: true,
              className: "sjt-rounded sjt-font-mono",
              style: { width: "6rem", padding: "2px 6px", fontSize: "0.75rem", backgroundColor: "var(--sjt-bg-secondary)", border: "1px solid var(--sjt-accent-color)", color: "var(--sjt-text-primary)", outline: "none" },
              onKeyDown: (e) => {
                if (e.key === "Enter" && newKeyName.trim()) {
                  let val = newKeyValue.trim();
                  try {
                    val = JSON.parse(val);
                  } catch {
                  }
                  onAddKey(path, newKeyName.trim(), val || null);
                  setIsAddingKey(false);
                } else if (e.key === "Escape") setIsAddingKey(false);
              }
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "sjt-text-xs", style: { color: "var(--sjt-text-secondary)" }, children: ":" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: newKeyValue,
              onChange: (e) => setNewKeyValue(e.target.value),
              placeholder: "value",
              className: "sjt-rounded sjt-font-mono",
              style: { width: "6rem", padding: "2px 6px", fontSize: "0.75rem", backgroundColor: "var(--sjt-bg-secondary)", border: "1px solid var(--sjt-border-color)", color: "var(--sjt-text-primary)", outline: "none" },
              onKeyDown: (e) => {
                if (e.key === "Enter" && newKeyName.trim()) {
                  let val = newKeyValue.trim();
                  try {
                    val = JSON.parse(val);
                  } catch {
                  }
                  onAddKey(path, newKeyName.trim(), val || null);
                  setIsAddingKey(false);
                } else if (e.key === "Escape") setIsAddingKey(false);
              }
            }
          ),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            if (newKeyName.trim()) {
              let val = newKeyValue.trim();
              try {
                val = JSON.parse(val);
              } catch {
              }
              onAddKey(path, newKeyName.trim(), val || null);
            }
            setIsAddingKey(false);
          }, className: "sjt-text-xs sjt-rounded sjt-text-white", style: { padding: "2px 6px", backgroundColor: "var(--sjt-accent-color)" }, children: "Add" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setIsAddingKey(false), className: "sjt-text-xs sjt-rounded", style: { padding: "2px 6px", backgroundColor: "var(--sjt-bg-secondary)", color: "var(--sjt-text-secondary)" }, children: "Cancel" })
        ] })
      }
    )
  ] });
}
var FlatTreeNode_default = memo(FlatTreeNode, (prev, next) => {
  var _a, _b, _c, _d, _e, _f;
  if (prev.node !== next.node) return false;
  if (prev.style.top !== next.style.top) return false;
  if (prev.searchQuery !== next.searchQuery) return false;
  if (prev.currentMatchPath !== next.currentMatchPath) return false;
  if (prev.currentDiffPath !== next.currentDiffPath) return false;
  const pathStr = prev.node.pathStr;
  if (((_a = prev.matches) == null ? void 0 : _a.has(pathStr)) !== ((_b = next.matches) == null ? void 0 : _b.has(pathStr))) return false;
  if (((_c = prev.pinnedPaths) == null ? void 0 : _c.has(pathStr)) !== ((_d = next.pinnedPaths) == null ? void 0 : _d.has(pathStr))) return false;
  if (((_e = prev.jsonpathMatches) == null ? void 0 : _e.has(pathStr)) !== ((_f = next.jsonpathMatches) == null ? void 0 : _f.has(pathStr))) return false;
  if (prev.showPinHint !== next.showPinHint) return false;
  if (prev.side !== next.side) return false;
  if (prev.diffMap !== next.diffMap) return false;
  if (prev.onDeleteNode !== next.onDeleteNode) return false;
  return true;
});
var ROW_HEIGHT2 = 28;
var OVERSCAN = 10;
function VirtualizedTree({
  flatNodes,
  pathIndex,
  containerRef,
  searchQuery,
  matches,
  currentMatchPath,
  onValueEdit,
  onTogglePath,
  diffMap,
  side,
  pinnedPaths,
  onTogglePin,
  showPinHint,
  currentDiffPath,
  jsonpathMatches,
  onDeleteNode,
  onAddKey,
  onAddArrayItem,
  onBreadcrumbPath,
  scrollToPath
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const innerRef = useRef(null);
  useEffect(() => {
    const el = containerRef == null ? void 0 : containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    setContainerHeight(el.clientHeight);
    return () => observer.disconnect();
  }, [containerRef]);
  useEffect(() => {
    const el = containerRef == null ? void 0 : containerRef.current;
    if (!el) return;
    const onScroll = () => {
      setScrollTop(el.scrollTop);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef]);
  useEffect(() => {
    if (!scrollToPath || !pathIndex || !(containerRef == null ? void 0 : containerRef.current)) return;
    const idx = pathIndex.get(scrollToPath);
    if (idx !== void 0) {
      const targetTop = idx * ROW_HEIGHT2;
      containerRef.current.scrollTo({
        top: targetTop - containerHeight / 2 + ROW_HEIGHT2 / 2,
        behavior: "smooth"
      });
    }
  }, [scrollToPath, pathIndex, containerRef, containerHeight]);
  useEffect(() => {
    if (!currentMatchPath || !pathIndex || !(containerRef == null ? void 0 : containerRef.current)) return;
    const idx = pathIndex.get(currentMatchPath);
    if (idx !== void 0) {
      const targetTop = idx * ROW_HEIGHT2;
      const currentScroll = containerRef.current.scrollTop;
      if (targetTop < currentScroll || targetTop > currentScroll + containerHeight - ROW_HEIGHT2) {
        containerRef.current.scrollTo({
          top: targetTop - containerHeight / 2 + ROW_HEIGHT2 / 2,
          behavior: "smooth"
        });
      }
    }
  }, [currentMatchPath, pathIndex, containerRef, containerHeight]);
  useEffect(() => {
    if (!currentDiffPath || !pathIndex || !(containerRef == null ? void 0 : containerRef.current)) return;
    const idx = pathIndex.get(currentDiffPath);
    if (idx !== void 0) {
      const targetTop = idx * ROW_HEIGHT2;
      const currentScroll = containerRef.current.scrollTop;
      if (targetTop < currentScroll || targetTop > currentScroll + containerHeight - ROW_HEIGHT2) {
        containerRef.current.scrollTo({
          top: targetTop - containerHeight / 2 + ROW_HEIGHT2 / 2,
          behavior: "smooth"
        });
      }
    }
  }, [currentDiffPath, pathIndex, containerRef, containerHeight]);
  const totalHeight = flatNodes.length * ROW_HEIGHT2;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT2) - OVERSCAN);
  const endIndex = Math.min(
    flatNodes.length,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT2) + OVERSCAN
  );
  const visibleNodes = useMemo(() => {
    return flatNodes.slice(startIndex, endIndex);
  }, [flatNodes, startIndex, endIndex]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: innerRef,
      style: { height: `${totalHeight}px`, position: "relative" },
      className: "tree-view sjt-font-mono sjt-text-sm",
      children: visibleNodes.map((node, i) => {
        const index = startIndex + i;
        return /* @__PURE__ */ jsx(
          FlatTreeNode_default,
          {
            node,
            style: {
              position: "absolute",
              top: `${index * ROW_HEIGHT2}px`,
              left: 0,
              right: 0,
              height: `${ROW_HEIGHT2}px`
            },
            searchQuery,
            matches,
            currentMatchPath,
            onValueEdit,
            onTogglePath,
            diffMap,
            side,
            pinnedPaths,
            onTogglePin,
            showPinHint,
            currentDiffPath,
            jsonpathMatches,
            onDeleteNode,
            onAddKey,
            onAddArrayItem,
            onBreadcrumbPath
          },
          node.pathStr || "root"
        );
      })
    }
  );
}
var VirtualizedTree_default = VirtualizedTree;
var VIRTUALIZE_THRESHOLD = 500;
function TreeView({ data, searchQuery, onValueEdit, diffMap, side, currentMatchIndex, onMatchCountChange, controlledExpandedPaths, onTogglePath, filterMode, onBreadcrumbPath, pinnedPaths, onTogglePin, showPinHint, currentDiffPath, jsonpathMatches, onDeleteNode, onAddKey, onAddArrayItem, containerRef, scrollToPath, virtualizeThreshold }) {
  const threshold = virtualizeThreshold ?? VIRTUALIZE_THRESHOLD;
  const { matches, expandedPaths, matchList } = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) {
      return { matches: /* @__PURE__ */ new Set(), expandedPaths: /* @__PURE__ */ new Set(), matchList: [] };
    }
    const matchPaths = /* @__PURE__ */ new Set();
    const pathsToExpand = /* @__PURE__ */ new Set();
    const orderedMatches = [];
    searchInValue(data, [], searchQuery.toLowerCase(), matchPaths, pathsToExpand, orderedMatches);
    return { matches: matchPaths, expandedPaths: pathsToExpand, matchList: orderedMatches };
  }, [data, searchQuery]);
  useEffect(() => {
    onMatchCountChange == null ? void 0 : onMatchCountChange(matchList.length, expandedPaths);
  }, [matchList.length, expandedPaths, onMatchCountChange]);
  const mergedExpandedPaths = useMemo(() => {
    const merged = new Set(expandedPaths);
    if (controlledExpandedPaths) {
      for (const path of controlledExpandedPaths) {
        merged.add(path);
      }
    }
    return merged;
  }, [expandedPaths, controlledExpandedPaths]);
  const currentMatchPath = matchList[currentMatchIndex] || null;
  const flatNodes = useMemo(() => {
    return flattenTree(data, mergedExpandedPaths, {
      matches,
      filterMode,
      searchQuery,
      diffMap,
      side
    });
  }, [data, mergedExpandedPaths, matches, filterMode, searchQuery, diffMap, side]);
  const pathIndex = useMemo(() => buildPathIndex(flatNodes), [flatNodes]);
  const useVirtual = flatNodes.length > threshold;
  if (useVirtual && containerRef) {
    return /* @__PURE__ */ jsx(
      VirtualizedTree_default,
      {
        flatNodes,
        pathIndex,
        containerRef,
        searchQuery,
        matches,
        currentMatchPath,
        onValueEdit,
        onTogglePath,
        diffMap,
        side,
        pinnedPaths,
        onTogglePin,
        showPinHint,
        currentDiffPath,
        jsonpathMatches,
        onDeleteNode,
        onAddKey,
        onAddArrayItem,
        onBreadcrumbPath,
        scrollToPath
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { className: "tree-view sjt-font-mono sjt-text-sm", children: /* @__PURE__ */ jsx(
    TreeNode_default,
    {
      keyName: null,
      value: data,
      path: [],
      searchQuery,
      matches,
      expandedPaths: mergedExpandedPaths,
      controlledExpandedPaths,
      currentMatchPath,
      onValueEdit,
      onTogglePath,
      diffMap,
      side,
      isRoot: true,
      filterMode,
      onBreadcrumbPath,
      pinnedPaths,
      onTogglePin,
      showPinHint,
      currentDiffPath,
      jsonpathMatches,
      onDeleteNode,
      onAddKey,
      onAddArrayItem
    }
  ) });
}
function searchInValue(value, path, query, matchPaths, pathsToExpand, orderedMatches) {
  const pathStr = path.join(".");
  if (value === null) {
    if ("null".includes(query)) {
      matchPaths.add(pathStr);
      orderedMatches.push(pathStr);
      addParentPaths(path, pathsToExpand);
    }
    return;
  }
  if (typeof value === "string") {
    if (value.toLowerCase().includes(query)) {
      matchPaths.add(pathStr);
      orderedMatches.push(pathStr);
      addParentPaths(path, pathsToExpand);
    }
    return;
  }
  if (typeof value === "number") {
    if (String(value).includes(query)) {
      matchPaths.add(pathStr);
      orderedMatches.push(pathStr);
      addParentPaths(path, pathsToExpand);
    }
    return;
  }
  if (typeof value === "boolean") {
    if (String(value).includes(query)) {
      matchPaths.add(pathStr);
      orderedMatches.push(pathStr);
      addParentPaths(path, pathsToExpand);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      searchInValue(item, [...path, index], query, matchPaths, pathsToExpand, orderedMatches);
    });
    return;
  }
  if (typeof value === "object") {
    Object.entries(value).forEach(([key, val]) => {
      const keyPath = [...path, key];
      if (key.toLowerCase().includes(query)) {
        const keyPathStr = keyPath.join(".");
        matchPaths.add(keyPathStr);
        orderedMatches.push(keyPathStr);
        addParentPaths(keyPath, pathsToExpand);
      }
      searchInValue(val, keyPath, query, matchPaths, pathsToExpand, orderedMatches);
    });
  }
}
function addParentPaths(path, pathsToExpand) {
  for (let i = 0; i <= path.length; i++) {
    const parentPath = path.slice(0, i).join(".");
    pathsToExpand.add(parentPath);
  }
}
var TreeView_default = TreeView;

export { TreeProvider, TreeView_default };
