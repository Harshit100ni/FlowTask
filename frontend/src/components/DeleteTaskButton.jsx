function DeleteTaskButton({ deleteTask, onDeleted }) {
  async function handleClick() {
    if (window.confirm('Delete this task?')) {
      await deleteTask();
      onDeleted();
    }
  }

  return (
    <button className="btn-danger" onClick={handleClick}>
      Delete
    </button>
  );
}

export default DeleteTaskButton;
