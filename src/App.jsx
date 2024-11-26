import React, {Component, useEffect } from 'react';
import Header from '@components/header';
import Task from '@components/task';
import {useStore} from '@components/store';

function App() {
  const {taskName,tasks, setTaskName, setTasks, fetchTasks, postData} = useStore();
  //fetch tasks initially
  useEffect(() => {
    fetchTasks();
  }, []);

  // fetch tasks every time when a new task is added 
  useEffect(() => {
    if(taskName){
      postData(taskName);
      setTaskName('')
    } 
  }, [taskName]);
  return (
    <div>
      <Header/>
      <Task tasks={tasks} fetchTasks={fetchTasks}/>
    </div>
  );
}
export default App;
