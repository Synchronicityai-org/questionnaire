const jsonData = {};
// get the form
const form = document.getElementById('myForm');
// listen for the submit event
form.addEventListener('submit', async event => {
    event.preventDefault();
    
    const data = new FormData(form);//get the data from form
    
    for (const [key,value] of data.entries()) {
        jsonData[key] = value; // copy the tasks into object
    }
    //post the data with json server
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
});
// fetch the tasks from the db.json
const fetchTasks = async ()=>{
    await fetch('http://localhost:3000/tasks')
    .then(response => response.json())
    .then(data =>{
        displayTasks(data)
    })
    .catch(error =>{
        console.error(error);
    })
}
//create the list and append to the task container
const displayTasks = (tasks)=>{
    const tasksList = document.getElementById('tasksContainer');
    tasksList.innerHTML = '';
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.textContent = `${task.task}`;
        taskItem.classList.add('task');
        tasksList.append(taskItem);
    });
    const taskHeading = document.getElementById('taskListHeading');
    let heading = tasks.length >0 ? 'List of Tasks' : 'No tasks to display';
    taskHeading.innerHTML = heading;
}
fetchTasks();