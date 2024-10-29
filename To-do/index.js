const jsonData = {};
// get the form
const form = document.getElementById('myForm');
// listen for the submit event
form.addEventListener('submit', async event => {
    event.preventDefault();
    
    const data = new FormData(form);//get the data from form
    
    for (const [key,value] of data.entries()) {
        jsonData[key] = value; // copy the tasks into object
        jsonData.completed = false;
    }
    //post the data with json server
    await postData(jsonData);
});
// fetch the tasks from the db.json
const fetchTasks = async ()=>{
    await fetch('http://localhost:3000/tasks')
    .then(response => response.json())
    .then(data =>{
        displayTasks(data);
    })
    .catch(error =>{
        console.error(error);
    })
}
fetchTasks();
//create the list and append to the task container
const displayTasks = (tasks)=>{
    const tasksList = document.getElementById('tasksContainer');
    tasksList.innerHTML = '';
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        const taskCheck = document.createElement('input');
        taskCheck.type = "checkbox";
        const wholetask = document.createElement('div');
        wholetask.classList.add('wholetask');
        taskCheck.classList.add('tickmark');
        taskItem.textContent = `${task.task}`;
        taskItem.classList.add('task');
        wholetask.appendChild(taskCheck);
        wholetask.appendChild(taskItem);
        tasksList.appendChild(wholetask);
        taskCheck.addEventListener('click', (event)=>{
            event.target.style.backgroundColor = 'black';
            toggletask(task.id);
        } );
    });
    const taskHeading = document.getElementById('taskListHeading');
    let heading = tasks.length >0 ? 'List of Tasks' : 'No tasks to display';
    taskHeading.innerHTML = heading;
}
const postData = async (jsonData)=>{
    await fetch('http://localhost:3000/tasks',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json())
    .then((data)=>{
        console.log('success',data);
    })
    .catch(error=>{
        console.error(error);
    })
    }

//update the tasks
const toggletask = async (taskId) => {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log('Task deleted:', taskId);
        // Optionally, refetch tasks to update the UI
        fetchTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};