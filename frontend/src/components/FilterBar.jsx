import SearchInput from './SearchInput';
import ProjectFilter from './ProjectFilter';
import PriorityFilter from './PriorityFilter';
import StatusFilter from './StatusFilter';
import ClearFiltersButton from './ClearFiltersButton';

function FilterBar({ filters, projects, onChange, onClear }) {
  const isCleared =
    filters.project_id === null &&
    filters.status === null &&
    filters.priority === null &&
    filters.search === '';

  return (
    <div className="filter-bar">
      <SearchInput value={filters.search} onChange={(v) => onChange('search', v)} />
      <ProjectFilter
        value={filters.project_id}
        projects={projects}
        onChange={(v) => onChange('project_id', v)}
      />
      <PriorityFilter value={filters.priority} onChange={(v) => onChange('priority', v)} />
      <StatusFilter value={filters.status} onChange={(v) => onChange('status', v)} />
      <ClearFiltersButton onClick={onClear} disabled={isCleared} />
    </div>
  );
}

export default FilterBar;
