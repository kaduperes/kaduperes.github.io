document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const taskList = document.getElementById('task-list');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementsByClassName('close')[0];
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskInput = document.getElementById('edit-task-input');
    const editPrioritySelect = document.getElementById('edit-priority-select');
    const archivedTasksHeader = document.getElementById('archived-tasks-header');
    const archivedTaskList = document.getElementById('archived-task-list');
    const backupButton = document.getElementById('backup-button');
    const restoreButton = document.getElementById('restore-button');
    const restoreInput = document.getElementById('restore-input');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentTaskId = null;

    // Functions
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        archivedTaskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.done ? 'done' : ''}`;
            taskItem.dataset.id = index;
            taskItem.innerHTML = `
                <span class="task-text">${task.text}</span>
                <span class="task-priority">${task.priority}</span>
                ${task.done ? '' : '<button class="edit-button"><i class="fas fa-edit"></i></button>'}
                ${task.done ? '' : '<button class="delete-button"><i class="fas fa-trash"></i></button>'}
                <button class="done-button"><i class="fas ${task.done ? 'fa-undo' : 'fa-check'}"></i></button>
            `;
            if (task.done) {
                archivedTaskList.appendChild(taskItem);
            } else {
                taskList.appendChild(taskItem);
            }
        });
    };

    const addTask = (text, priority) => {
        tasks.push({ text, priority, done: false });
        saveTasks();
        renderTasks();
    };

    const editTask = (id, text, priority) => {
        tasks[id] = { ...tasks[id], text, priority };
        saveTasks();
        renderTasks();
    };

    const deleteTask = (id) => {
        tasks.splice(id, 1);
        saveTasks();
        renderTasks();
    };

    const toggleTaskDone = (id) => {
        tasks[id].done = !tasks[id].done;
        saveTasks();
        renderTasks();
    };

    const backupTasks = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "tasks_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const restoreTasks = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            tasks = JSON.parse(content);
            saveTasks();
            renderTasks();
        };
        reader.readAsText(file);
    };

    // Event Listeners
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const priority = prioritySelect.value;
        if (text) {
            addTask(text, priority);
            taskInput.value = '';
            prioritySelect.value = 'low';
        }
    });

    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.closest('li').dataset.id;

        if (target.classList.contains('edit-button') || target.closest('.edit-button')) {
            currentTaskId = id;
            const task = tasks[id];
            editTaskInput.value = task.text;
            editPrioritySelect.value = task.priority;
            modal.style.display = 'block';
        } else if (target.classList.contains('delete-button') || target.closest('.delete-button')) {
            deleteTask(id);
        } else if (target.classList.contains('done-button') || target.closest('.done-button')) {
            toggleTaskDone(id);
        }
    });

    archivedTaskList.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.closest('li').dataset.id;

        if (target.classList.contains('done-button') || target.closest('.done-button')) {
            toggleTaskDone(id);
        }
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = editTaskInput.value.trim();
        const priority = editPrioritySelect.value;
        if (text) {
            editTask(currentTaskId, text, priority);
            modal.style.display = 'none';
        }
    });

    archivedTasksHeader.addEventListener('click', () => {
        archivedTaskList.classList.toggle('visible');
    });

    backupButton.addEventListener('click', backupTasks);

    restoreButton.addEventListener('click', () => {
        restoreInput.click();
    });

    restoreInput.addEventListener('change', restoreTasks);

    // Initial Render
    renderTasks();
});
