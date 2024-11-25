const task = document.getElementById('task_input'); // listen input and store the value
const newTask = {
    id: Date.now().toString(),
    task: '',
    completed:false
};
task.addEventListener('input',(event)=>{
    newTask.task = event.target.value;
});
task.addEventListener('blur', async()=>{
    if(newTask.task !== ''){
    await postData(newTask);
    }
    else{
        return ;
    }
})
//function to post data into db.json
const postData = async (task)=>{
    try{
      const response = await fetch('http://localhost:3000/tasks',{
            method: 'POST',
            
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task)
        })
        if(!response.ok){
            throw new Error('Network was not ok')
        }
        const data = await response.json();
        console.log('sucess',data);
    }
    catch(error){
        console.error('Error',error);
    }
    await fetchData('false');
}
//function to fetch tasks
const fetchData = async (status) => {
    try {
        const response = await fetch('http://localhost:3000/tasks');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        displayTasks(data, status);
    } catch (error) {
        console.error('Error:', error);
    }
};

fetchData('false');

//function to display tasks
const displayTasks = (tasks,status)=>{
    const taskContainer = document.getElementById('task_container');
    taskContainer.innerHTML = '';
    let filteredTasks = [];
    if(status === 'true'){
       filteredTasks =  tasks.filter(task => task.completed === true)
    }
    else if(status === 'false'){
        filteredTasks = tasks.filter(task => task.completed === false)
    }
    else{
        filteredTasks = tasks;
    }
    
    filteredTasks.forEach(task=> {
        const taskDiv = document.createElement('div');
        const check = document.createElement('input');
        check.type = 'checkbox';
        const taskName = document.createElement('li');
        taskName.innerHTML = task.task;
        taskDiv.classList.add('task-list');
        check.classList.add('check-mark')
        taskDiv.appendChild(check);
        taskDiv.appendChild(taskName);
        taskContainer.appendChild(taskDiv);
        if(task.completed === true){
            check.classList.toggle('check-mark-checked');
            taskName.classList.toggle('strike');
        }
        check.addEventListener('click',async()=>{
            await completedTask(task.id);
        })
    });
    //count the number of active tasks
    let taskCount = 0;
    tasks.forEach(task=>{
    taskCount = task.completed === false ? taskCount+=1: taskCount;
    })
    //create the footer
    const footer = document.createElement('div');
    const numberOfTasks = document.createElement('span');
    numberOfTasks.innerHTML = `${taskCount} Items left`;
    const filters = document.createElement('div');
    const all = document.createElement('button');
    all.innerHTML = 'All';
    all.addEventListener('click',()=>{
        fetchData('null')
    });
    const active = document.createElement('button');
    active.innerHTML = 'Active';
    active.addEventListener('click',()=>{
        fetchData('false')
    });
    const completed = document.createElement('button');
    completed.innerHTML = 'Completed';
    completed.addEventListener('click',()=>{
        fetchData('true')
    });
    const clear = document.createElement('button');
    clear.innerHTML = 'Clear Completed';
    clear.addEventListener('click',()=>{
        clearCompleted();
    })
    filters.appendChild(all);
    filters.appendChild(active);
    filters.appendChild(completed);
    filters.classList.add('filters');
    footer.appendChild(numberOfTasks);
    footer.appendChild(filters);
    footer.appendChild(clear);
    footer.classList.add('footer');
    taskContainer.appendChild(footer);
}

//function to update the completed status
const completedTask = async(taskId)=>{
   try{
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`);
    if(!response.ok){
        throw new Error('Network reesponse was not ok');
    }
    const task = await response.json();
    task.completed = !task.completed;
    const updateResponse = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });
    if(!updateResponse.ok){
        throw new Error(`Error updating the task: ${updateResponse.statusText}`)
    }
    await fetchTasks();
   }
   catch (error){
    console.error('Error',error);
   }
}

//function to clear completed tasks
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
        await fetchData('false');
    }
    catch(error){
        console.error('Error', error);
    }
};