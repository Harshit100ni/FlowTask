function ProjectFilter({ value, projects, onChange }) {
  function handleChange(e) {
    const raw = e.target.value;
    onChange(raw === "" ? null : Number(raw));
  }

  return (
    <select
      className="project-filter"
      value={value === null ? "" : value}
      onChange={handleChange}
    >
      <option value="">All Projects</option>
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  );
}

export default ProjectFilter;
