//post the data to db.json
    // postData : async (taskName)=>{
    //     try {
    //         if (taskName) {
    //         const newTask = get().createNewTask(taskName);
    //         const response = await fetch('http://localhost:3000/tasks', {
    //           method: 'POST',
    //           headers: {
    //             'Content-Type': 'application/json',
    //           },
    //           body: JSON.stringify(newTask),
    //         });
    //         if (response.ok) {
    //           const data = await response.json();
    //           await get().fetchTasks();
    //           console.log('Task added successfully');
    //         } else {
    //           console.error('Failed to add task');
    //         }
    //       }} catch (error) {
    //         console.error('Error:', error);
    //       }
    // },
    // Updates a task status to completed or not completed
    // updatedTasks: async (id,updateTask)=>{
    //     try {
    //         const response = await fetch(`http://localhost:3000/tasks/${id}`, {
    //           method: 'PUT',
    //           headers: {
    //             'Content-Type': 'application/json',
    //           },
    //           body: JSON.stringify(updateTask),
    //         });
    //         if (response.ok) {
    //           const data = await response.json();
    //           await get().fetchTasks();
    //           console.log('Task updated successfully');
    //         } else {
    //           console.error('Failed to update task');
    //         }
    //       } catch (error) {
    //         console.error('Error:', error);
    //       }
    // },
     //clear the completed tasks
    // clearCompleted: async ()=>{
    //     try{
    //         const response = await fetch('http://localhost:3000/tasks/');
    //         const tasks = await response.json();
    //         const completedTasks = tasks.filter(task => task.completed);
    
    //         for(let task of completedTasks){
    //             await fetch(`http://localhost:3000/tasks/${task.id}`,{
    //                 method: 'DELETE'
    //             });
    //         }
    //         await get().fetchTasks();
    //     }
    //     catch(error){
    //         console.error('Error', error);
    //     }
    // }