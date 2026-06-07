function ClearFiltersButton({ onClick, disabled }) {
  return (
    <button
      className={`clear-filters-btn${disabled ? ' clear-filters-btn--disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      Clear Filters
    </button>
  );
}

export default ClearFiltersButton;
