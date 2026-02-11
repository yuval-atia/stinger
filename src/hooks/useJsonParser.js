import { useState, useCallback } from 'react';
import { parseJson } from '../utils/jsonParser';
import { parseJsObject } from '../components/Editor/JsObjectParser';

export function useJsonParser() {
  const [inputValue, setInputValue] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [inputType, setInputType] = useState(null); // 'json' | 'js' | null

  const handleInputChange = useCallback((value) => {
    setInputValue(value);

    if (!value.trim()) {
      setParsedData(null);
      setParseError(null);
      setInputType(null);
      return;
    }

    // Try standard JSON first
    let result = parseJson(value);
    let detectedType = 'json';

    // If that fails, try parsing as JS object
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
  }, []);

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
