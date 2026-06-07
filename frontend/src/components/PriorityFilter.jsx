import { PRIORITIES } from '../constants/enums';

function PriorityFilter({ value, onChange }) {
  function handleChange(e) {
    const raw = e.target.value;
    onChange(raw === "" ? null : raw);
  }

  return (
    <select
      className="priority-filter"
      value={value === null ? "" : value}
      onChange={handleChange}
    >
      <option value="">All Priorities</option>
      {PRIORITIES.map((priority) => (
        <option key={priority} value={priority}>
          {priority}
        </option>
      ))}
    </select>
  );
}

export default PriorityFilter;
