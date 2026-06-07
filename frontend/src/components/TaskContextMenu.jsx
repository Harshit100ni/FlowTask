import { useEffect, useRef } from 'react';

function TaskContextMenu({ taskId, onDelete, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  function handleDelete(event) {
    event.stopPropagation();
    if (window.confirm('Delete this task?')) {
      onDelete(taskId);
      onClose();
    }
  }

  return (
    <div className="task-context-menu" ref={menuRef}>
      <button
        className="task-context-menu-item task-context-menu-delete"
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
}

export default TaskContextMenu;
