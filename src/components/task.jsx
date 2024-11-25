import './task.css';
import {useStore} from './store';

function Task() {
  const {filter,tasks,handleData,handleTasks, clearCompleted} = useStore();

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
  });

  return (
    <div className='flex items-center flex-col'>
      {filteredTasks.map((task) => (
        <div key={task.id} className='task-list'>
          <input 
            type="checkbox" 
            className={task.completed ? 'check-mark-checked': 'check-mark'} 
            checked={task.completed}
            onChange={() => handleData(task)}
          />
          <li className={task.completed ? 'strike': ''}>{task.task}</li>
        </div>
      ))}
      <div className='footer'>
        <span>{filteredTasks.length} Items left</span>
        <div className='filters'>
          <button onClick={() => handleTasks('All')}>All</button>
          <button onClick={() => handleTasks('Active')}>Active</button>
          <button onClick={() => handleTasks('Completed')}>Completed</button>
        </div>
        <button onClick={clearCompleted}>Clear Completed</button>
      </div>
    </div>
  );
}

export default Task;
