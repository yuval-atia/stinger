import { useState, useCallback, useEffect, useRef } from 'react';
import { parseJson } from '../utils/jsonParser';
import { parseJsObject } from '../components/Editor/JsObjectParser';

export function useJsonParser(storageKey) {
  const initialized = useRef(false);

  const [inputValue, setInputValue] = useState(() => {
    if (storageKey) {
      try { return sessionStorage.getItem(storageKey) || ''; } catch { return ''; }
    }
    return '';
  });
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [inputType, setInputType] = useState(null); // 'json' | 'js' | null

  // Parse the restored value on first mount
  useEffect(() => {
    if (!initialized.current && inputValue) {
      initialized.current = true;
      parse(inputValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function parse(value) {
    if (!value.trim()) {
      setParsedData(null);
      setParseError(null);
      setInputType(null);
      return;
    }

    let result = parseJson(value);
    let detectedType = 'json';

    if (!result.success) {
      const jsResult = parseJsObject(value);
      if (jsResult.success) {
        result = jsResult;
        detectedType = 'js';
      }
    }

    if (result.success) {
      setParsedData(result.data);
      setParseError(null);
      setInputType(detectedType);
    } else {
      setParsedData(null);
      setParseError(result.error);
      setInputType(null);
    }
  }

  const handleInputChange = useCallback((value) => {
    setInputValue(value);
    if (storageKey) {
      try { sessionStorage.setItem(storageKey, value); } catch { /* quota */ }
    }
    parse(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return {
    inputValue,
    setInputValue,
    parsedData,
    setParsedData,
    parseError,
    inputType,
    handleInputChange,
  };
}
