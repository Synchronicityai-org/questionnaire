import React, { useEffect, useState } from 'react';


function Task({ tasks, fetchTasks }) {
  const [filter, setFilter] = useState('All');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
  });
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
        await fetchTasks();
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
        await fetchTasks();
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
    setFilter(filter);
  };

  return (
    <div className='flex items-center flex-col'>
      {filteredTasks.map((task) => (
        <div key={task.id} className='bg-very-dark-desaturated-blue text-very-light-gray mb-1 w-[500px] flex items-center p-2.5 rounded-md'>
          <input 
            type="checkbox" 
            className={`appearance-none w-5 h-5 rounded-full border border-very-light-grayish-blue mr-2 cursor-pointer ${task.completed ? `bg-check-combined bg-no-repeat bg-center` : ''}`}

            checked={task.completed}
            onChange={() => handleData(task)}
          />
          <li className={`list-none ${task.completed ? 'line-through': ''}`}>{task.task}</li>
        </div>
      ))}
      <div className='bg-very-dark-desaturated-blue w-[500px] p-2 flex items-center justify-between rounded-md text-very-light-gray'>
        <span>{filteredTasks.length} Items left</span>
        <div className='space-x-2'>
          <button onClick={() => handleTasks('All')} className='hover:bg-dark-grayish-blue rounded-md p-2'>All</button>
          <button onClick={() => handleTasks('Active')} className='hover:bg-dark-grayish-blue rounded-md p-2'>Active</button>
          <button onClick={() => handleTasks('Completed')} className='hover:bg-dark-grayish-blue rounded-md p-2'>Completed</button>
        </div>
        <button onClick={clearCompleted} className='hover:bg-dark-grayish-blue rounded-md p-2'>Clear Completed</button>
      </div>
    </div>
  );
}

export default Task;
