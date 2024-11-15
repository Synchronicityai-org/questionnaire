// get the form
const form = document.getElementById('myForm');
// listen for the submit event
form.addEventListener('submit', async event => {
    event.preventDefault();
    
    const data = new FormData(form);//get the data from form
    const newTask = {
        id: Date.now().toString(), 
        task: '', 
        subtasks: [],
        date: '',
        completed: false
    };
    for (const [key,value] of data.entries()) {
        newTask.task = value;
    }
    //post the data with json server
     await postData(newTask);
});
// fetch the tasks from the db.json
const fetchTasks = async (status)=>{
    await fetch('http://localhost:3000/tasks')
    .then(response => response.json())
    .then(data =>{
        displayTasks(data,status);
    })
    .catch(error =>{
        console.error(error);
    })
}
fetchTasks('false');
//create the list and append to the task container
const displayTasks = (tasks,value)=>{
    const tasksList = document.getElementById('tasksContainer');
    tasksList.innerHTML = '';
    tasks.forEach(task => {
        let status = value === 'false' ? !task.completed : task.completed;
        if(status){
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

        taskCheck.addEventListener('click', () => {
            let status = true;
            deleteTask(task.id, status);
        });
    
        // Create subtask button and container
        const subTaskContainer = document.createElement('div');
        subTaskContainer.classList.add('subtaskContainer');
        wholetask.insertAdjacentElement('afterend', subTaskContainer);

        // create subtasks and append
        task.subtasks.forEach(subtask =>{
            const subtaskItem = document.createElement('li');
            const subtaskCheck = document.createElement('input');
            subtaskCheck.type = "checkbox";
            const wholesubtask = document.createElement('div');
            wholesubtask.classList.add('wholetask');
            subtaskCheck.classList.add('tickmark');
            wholesubtask.appendChild(subtaskCheck);
            wholesubtask.appendChild(subtaskItem);
            subTaskContainer.appendChild(wholesubtask);
            subtaskItem.textContent = `${subtask.subtask}`;
            subtaskItem.classList.add('task');
            subtaskCheck.addEventListener('click',()=>{
                deletesubTask(task.id,subtask.id);
            })
        })
        
    
        // Create input field and add button
        const inputField = document.createElement('input');
        inputField.type = "text";
        inputField.placeholder = "Enter task";
    
        const addButton = document.createElement('button');
        addButton.textContent = "Add";
        addButton.type = "submit";
    
        const form = document.createElement('form');
        form.classList.add('subForm');
        form.appendChild(inputField);
        form.appendChild(addButton);
        subTaskContainer.appendChild(form);

        //create calendar form
        const calendarInput = document.createElement('input');
        calendarInput.type = 'date';
        calendarInput.id = 'calendarInput';
        calendarInput.value = `${task.date}`;
        wholetask.appendChild(calendarInput);
        let dueDate ='';
        calendarInput.addEventListener('change',async ()=>{
            dueDate = calendarInput.value;
            dueDateUpdate(task.id,dueDate);
        })
        
        // Create and append the initial plus button
        let subtaskButton = svgPlus();
        wholetask.appendChild(subtaskButton);
    
        // Toggle functionality
        subtaskButton.addEventListener('click', toggleSubtask);

    function toggleSubtask() {
        if (subTaskContainer.style.display === 'none' || subTaskContainer.style.display === '') {
            // Show the subtask container
            subTaskContainer.style.display = 'flex';
            subtaskButton.remove(); 
            subtaskButton = svgCancel(); 
            wholetask.appendChild(subtaskButton); 

            // Remove previous event listener if it exists
            subtaskButton.removeEventListener('click', toggleSubtask);
            subtaskButton.addEventListener('click', hideSubtask);
        }
    }

    function hideSubtask() {
        // Hide the subtask container
        subTaskContainer.style.display = 'none';
        subtaskButton.remove(); 
        subtaskButton = svgPlus(); 
        wholetask.appendChild(subtaskButton);

        // Remove previous event listener if it exists
        subtaskButton.removeEventListener('click', hideSubtask);
        subtaskButton.addEventListener('click', toggleSubtask);
    }
        form.addEventListener('submit', async (event)=>{
            event.preventDefault();
            const subtaskValue = inputField.value;
            task.subtasks.push({ id: Date.now().toString(), subtask: subtaskValue });
            await postsubData(task);
        });
        }
       
    });
    const taskHeading = document.getElementById('taskListHeading');
    let isTrue = tasks.find(task => task.completed === false)
    let heading = isTrue ? 'List of Tasks' : 'No tasks to display';
    taskHeading.innerHTML = heading;
}
const postData = async (newTask)=>{
    await fetch('http://localhost:3000/tasks',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask)
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
    const deleteTask = async (taskId,status) => {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const task = await response.json();
        task.completed = status;
        const updateResponse = await fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });

        if (!updateResponse.ok) {
            throw new Error(`Error updating task: ${updateResponse.statusText}`);
        }
        await fetchTasks(status); 
    } catch (error) {
        console.error('Error:', error);
    }
};
const deletesubTask = async (taskId, subtaskId) => {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`);
        if (!response.ok) {
            throw new Error(`Error fetching task: ${response.statusText}`);
        }

        const task = await response.json();

        // Check if the subtask exists
        const subtaskIndex = task.subtasks.findIndex(sub => sub.id === subtaskId);
        if (subtaskIndex === -1) {
            throw new Error('Subtask not found');
        }

        // Remove the subtask from the array
        task.subtasks.splice(subtaskIndex, 1);

        // Update the task with the modified subtasks
        const updateResponse = await fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });

        if (!updateResponse.ok) {
            throw new Error(`Error updating task: ${updateResponse.statusText}`);
        }

        console.log('Subtask deleted:', subtaskId);
        await fetchTasks(); 
        alert(`Subtask ${subtaskId} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting subtask:', error);
        alert('Failed to delete subtask: ' + error.message);
    }
};

const postsubData = async(updatedTask)=>{
    await fetch(`http://localhost:3000/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then((data) => {
        console.log('Task updated successfully:', data);
        fetchTasks();
    })
    .catch(error => {
        console.error('Error updating task:', error);
    });
}

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

//search functionality
const searchForm = document.getElementById('searchForm');
searchForm.addEventListener('submit',async (event)=>{
    event.preventDefault();
    const searchData = new FormData(searchForm);
    let searchTask = '';
    for(let [key,value] of searchData.entries()){
        searchTask = value;
    }
    await search(searchTask);
});
const search = async (searchTask)=>{
    await fetch('http://localhost:3000/tasks')
    .then(response => response.json())
    .then(data =>{
        task = data.filter(item => item.task === searchTask)
        displayTasks(task);
    })
    .catch(error =>{
        console.error(error);
    })
}
const dueDateUpdate = async (taskId, dueDate)=>{
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`);
        if (!response.ok) {
            throw new Error(`Error fetching task: ${response.statusText}`);
        }
        const task = await response.json();
        task.date = dueDate;

        // Update the task with the modified due date
        const updateResponse = await fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });

        if (!updateResponse.ok) {
            throw new Error(`Error updating task: ${updateResponse.statusText}`);
        }
        await fetchTasks(); 
    } catch (error) {
        console.error('Error:', error);
    }
};
//function to display completed tasks
    const completedTaksId = document.getElementById('completed');
    completedTaksId.addEventListener('click' ,()=>{
        completedTaksId.className = 'dotted';
        activetasks.className = 'none';
        let value = 'true';
        fetchTasks(value);
    });
    const activetasks = document.getElementById('active');
    activetasks.addEventListener('click',()=>{
        activetasks.className = 'dotted';
        completedTaksId.className = 'none';
        let value = 'false';
        fetchTasks(value);
    })