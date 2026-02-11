import { useState, useCallback } from 'react';
import DiffView from '../components/Compare/DiffView';
import { useJsonParser } from '../hooks/useJsonParser';

function JsonComparePage() {
  const left = useJsonParser();
  const right = useJsonParser();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setActiveSearch('');
    }
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setActiveSearch(searchQuery);
      setIsSearching(false);
    }, 50);
  }, [searchQuery]);

  return (
    <DiffView
      leftInput={left.inputValue}
      rightInput={right.inputValue}
      leftData={left.parsedData}
      rightData={right.parsedData}
      leftError={left.parseError}
      rightError={right.parseError}
      onLeftChange={left.handleInputChange}
      onRightChange={right.handleInputChange}
      searchQuery={activeSearch}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      isSearching={isSearching}
    />
  );
}

export default JsonComparePage;
