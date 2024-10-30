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
        //create the task
        const taskItem = document.createElement('li');
        const taskCheck = document.createElement('input');
        taskCheck.type = "checkbox";
        const wholetask = document.createElement('div');
        wholetask.classList.add('wholetask');
        taskCheck.classList.add('tickmark');
    
        // Set task text
        taskItem.textContent = `${task.task}`;
        taskItem.classList.add('task');
    
        // Assemble the task elements
        wholetask.appendChild(taskCheck);
        wholetask.appendChild(taskItem);
        tasksList.appendChild(wholetask);
    
        // Create subtask button and container
        const subTaskContainer = document.createElement('div');
        subTaskContainer.classList.add('subtaskContainer');
        wholetask.insertAdjacentElement('afterend', subTaskContainer);
    
        // Create input field and add button
        const inputField = document.createElement('input');
        inputField.type = "text";
        inputField.placeholder = "Enter task";
    
        const addButton = document.createElement('button');
        addButton.textContent = "Add";
        addButton.type = "submit";
    
        const form = document.createElement('form');
        form.appendChild(inputField);
        form.appendChild(addButton);
        subTaskContainer.appendChild(form);
    
        // Create and append the initial plus button
        let subtaskButton = svgPlus();
        wholetask.appendChild(subtaskButton);
    
        // Toggle functionality
        subtaskButton.addEventListener('click', toggleSubtask);
    
       const toggleSubtask = ()=>{
            if (subTaskContainer.style.display === 'none') {
                // Show the subtask container
                subTaskContainer.style.display = 'block';
                subtaskButton.remove(); 
                subtaskButton = svgCancel(); 
                wholetask.appendChild(subtaskButton);
    
                // Remove previous event listener
                subtaskButton.removeEventListener('click', toggleSubtask);
                subtaskButton.addEventListener('click', hideSubtask);
            }
        }
    
        const hideSubtask = ()=>{
            // Hide the subtask container
            subTaskContainer.style.display = 'none';
            subtaskButton.remove(); 
            subtaskButton = svgPlus();
            wholetask.appendChild(subtaskButton); 
    
            // Remove previous event listener 
            subtaskButton.removeEventListener('click', hideSubtask);
            subtaskButton.addEventListener('click', toggleSubtask);
        }
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
        fetchTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};

const svgPlus = ()=>{
    const svgns = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgns, 'svg');
    svg.setAttribute('width', '25');
    svg.setAttribute('height', '25');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('class', 'bi bi-plus');
    svg.setAttribute('viewBox', '0 0 16 16');

    const path = document.createElementNS(svgns, 'path');
    path.setAttribute('d', 'M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4');

    svg.appendChild(path);
    return svg;
}
const svgCancel = ()=>{
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "25");
    svg.setAttribute("height", "25");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("class", "bi bi-x");
    svg.setAttribute("viewBox", "0 0 16 16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708");

    svg.appendChild(path);
    return svg;
}