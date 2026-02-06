import { useRef, useImperativeHandle, forwardRef } from 'react';

const JsonInput = forwardRef(function JsonInput({ value, onChange, error, placeholder }, ref) {
  const textareaRef = useRef(null);

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

  return (
    <div className="relative h-full flex flex-col">
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
    </div>
  );
});

export default JsonInput;
