import { STATUSES } from '../constants/enums';

function StatusFilter({ value, onChange }) {
  function handleChange(e) {
    const raw = e.target.value;
    onChange(raw === "" ? null : raw);
  }

  return (
    <select
      className="status-filter"
      value={value === null ? "" : value}
      onChange={handleChange}
    >
      <option value="">All Statuses</option>
      {STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

export default StatusFilter;
