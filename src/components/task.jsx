import React, { useEffect, useState } from 'react';
import './task.css';

function Task({ tasks }) {
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const numberOfTasks = activeTasks.length;

  useEffect(() => {
    setActiveTasks(tasks.filter(task => !task.completed));
    setFilteredTasks(activeTasks);
    
  }, [tasks]);
  // Updates a task status to completed or not completed
  const updatedTasks = async (id, updateTask) => {
    try {
      const response = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateTask),
      });
      if (response.ok) {
        const data = await response.json();
        // Update filteredTasks based on the response
        setFilteredTasks(prevTasks => 
          prevTasks.map(task => task.id === data.id ? data : task)
        );
        console.log('Task updated successfully');
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const clearCompleted = async()=>{
    try{
        const response = await fetch('http://localhost:3000/tasks/');
        const tasks = await response.json();
        const completedTasks = tasks.filter(task => task.completed);

        for(let task of completedTasks){
            await fetch(`http://localhost:3000/tasks/${task.id}`,{
                method: 'DELETE'
            });
        }
    }
    catch(error){
        console.error('Error', error);
    }
};

  // Handles the checkbox click to toggle task completion
  const handleData = (task) => {
    const updateTask = { ...task, completed: !task.completed };
    updatedTasks(task.id, updateTask);
  };

  // Filters tasks based on the provided filter
  const handleTasks = (filter) => {
    if (filter === 'All') {
      setFilteredTasks(tasks); 
    } else if (filter === 'Active') {
      setFilteredTasks(activeTasks);
    } else if (filter === 'Completed') {
      setFilteredTasks(tasks.filter(task => task.completed));
    }
  };

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
        <span>{numberOfTasks} Items left</span>
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
