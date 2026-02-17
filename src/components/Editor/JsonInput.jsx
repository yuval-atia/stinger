import { useState, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';

const JsonInput = forwardRef(function JsonInput({ value, onChange, error, placeholder }, ref) {
  const textareaRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // Expose the textarea ref to parent for scroll detection
  useImperativeHandle(ref, () => textareaRef.current);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handlePaste = (e) => {
    // Let the default paste happen, then process
    setTimeout(() => {
      onChange(textareaRef.current.value);
    }, 0);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(event.target.result);
    };
    reader.readAsText(file);
  }, [onChange]);

  return (
    <div
      className="relative h-full flex flex-col"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        spellCheck={false}
        className={`flex-1 w-full p-4 bg-transparent resize-none focus:outline-none text-sm leading-relaxed font-mono ${
          error ? 'border-l-4 border-[var(--error-color)]' : ''
        }`}
        style={{
          tabSize: 2,
          minHeight: '200px',
        }}
      />
      {error && (
        <div className="flex-shrink-0 px-4 py-2 bg-[var(--error-color)] bg-opacity-10 border-t border-[var(--error-color)]">
          <p className="text-xs text-[var(--error-color)] truncate">
            {error}
          </p>
        </div>
      )}
      {isDragging && (
        <div className="absolute inset-0 bg-[var(--accent-color)] bg-opacity-10 border-2 border-dashed border-[var(--accent-color)] rounded-lg flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 text-[var(--accent-color)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8">
              <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            <span className="text-sm font-medium">Drop file here</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default JsonInput;
