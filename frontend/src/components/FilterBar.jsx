import SearchInput from './SearchInput';
import PriorityFilter from './PriorityFilter';
import StatusFilter from './StatusFilter';
import ClearFiltersButton from './ClearFiltersButton';
import '../styles/filterbar.css';

function FilterBar({ filters, onChange, onClear }) {
  const isCleared =
    filters.status === null &&
    filters.priority === null &&
    filters.search === '';

  return (
    <div className="filter-bar">
      <SearchInput value={filters.search} onChange={(v) => onChange('search', v)} />
      <PriorityFilter value={filters.priority} onChange={(v) => onChange('priority', v)} />
      <StatusFilter value={filters.status} onChange={(v) => onChange('status', v)} />
      <ClearFiltersButton onClick={onClear} disabled={isCleared} />
    </div>
  );
}

export default FilterBar;
