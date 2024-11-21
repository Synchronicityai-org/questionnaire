import React, { useState, useEffect } from 'react';
import Header from './components/header';
import Task from './components/task';

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');

  // function to create a new task
  const createNewTask = (taskName) => {
    return {
      id: Date.now().toString(),
      task: taskName,
      completed: false,
    };
  };

  // get the task
  const getTasks = (data) => {
    setTaskName(data);
  };

  // Fetch tasks from the server
  async function fetchTasks() {
    try {
      const response = await fetch('http://localhost:3000/tasks');
      const data = await response.json();
      setTasks(data); 
    } catch (error) {
      console.error('Error:', error);
    }
  }
  useEffect(() => {
    fetchTasks();
  }, []);

  // fetch tasks every time when a new task is added 
  useEffect(() => {
      postData(taskName);
  }, [taskName]);
  async function postData(taskName) {
    try {
      if (taskName) {
      const newTask = createNewTask(taskName);
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      if (response.ok) {
        const data = await response.json();
        await fetchTasks();
        // setTasks((prevTasks) => [...prevTasks, data]);
        console.log('Task added successfully');
      } else {
        console.error('Failed to add task');
      }
    }} catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div>
      <Header getData={getTasks} />
      <Task tasks={tasks} fetchTasks={fetchTasks}/>
    </div>
  );
}

export default App;
