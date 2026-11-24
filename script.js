
"use strict";

/* =========================================
   1. APPLICATION DATA
========================================= */

const STORAGE_KEY = "taskflow_tasks";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");

const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editTaskId = document.getElementById("editTaskId");
const editTaskInput = document.getElementById("editTaskInput");
const editPriorityInput = document.getElementById("editPriorityInput");

const toast = document.getElementById("toast");

let tasks = loadTasks();


/* =========================================
   2. LOCAL STORAGE
========================================= */

function loadTasks() {
    try {
        const savedTasks = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        return Array.isArray(savedTasks) ? savedTasks : [];

    } catch (error) {
        console.error("Could not load tasks:", error);
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}


/* =========================================
   3. NOTIFICATION
========================================= */

let toastTimeout;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================================
   4. ADD TASK
========================================= */

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = taskInput.value.trim();
    const priority = priorityInput.value;

    if (!title) {
        showToast("Please enter a task description.");
        taskInput.focus();
        return;
    }

    const newTask = {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString() + Math.random().toString(16).slice(2),

        title: title,
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    saveTasks();

    taskForm.reset();
    priorityInput.value = "Medium";

    displayTasks();

    showToast("Task added successfully!");
    taskInput.focus();
});


/* =========================================
   5. DISPLAY TASKS
========================================= */

function displayTasks() {

    const search = searchInput.value
        .trim()
        .toLowerCase();

    const status = statusFilter.value;
    const priority = priorityFilter.value;

    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {

        const matchesSearch = task.title
            .toLowerCase()
            .includes(search);

        const matchesStatus =
            status === "all" ||
            (status === "active" && !task.completed) ||
            (status === "completed" && task.completed);

        const matchesPriority =
            priority === "all" ||
            task.priority === priority;

        return matchesSearch &&
               matchesStatus &&
               matchesPriority;
    });


    // Empty state

    if (filteredTasks.length === 0) {

        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        const icon = document.createElement("div");
        icon.className = "empty-icon";
        icon.textContent = "✦";

        const title = document.createElement("h3");
        title.textContent = tasks.length === 0
            ? "Your workspace is ready"
            : "No tasks found";

        const message = document.createElement("p");
        message.textContent = tasks.length === 0
            ? "Add your first task and start organizing your day."
            : "Try changing your search or filter options.";

        emptyState.append(icon, title, message);
        taskList.appendChild(emptyState);

    } else {

        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    updateStatistics();
}


/* =========================================
   6. CREATE TASK ELEMENT
========================================= */

function createTaskElement(task) {

    const card = document.createElement("article");
    card.className = "task";

    const main = document.createElement("div");
    main.className = "task-main";

    if (task.completed) {
        main.classList.add("done");
    }


    // Complete button

    const checkButton = document.createElement("button");

    checkButton.type = "button";
    checkButton.className = "task-check";

    if (task.completed) {
        checkButton.classList.add("is-completed");
    }

    checkButton.textContent = task.completed ? "✓" : "";

    checkButton.setAttribute(
        "aria-label",
        task.completed ? "Mark as incomplete" : "Mark as completed"
    );

    checkButton.addEventListener("click", function() {
        toggleTask(task.id);
    });


    // Task information

    const info = document.createElement("div");
    info.className = "task-info";

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const priorityBadge = document.createElement("span");

    priorityBadge.className =
        "priority priority-" + task.priority.toLowerCase();

    priorityBadge.textContent = task.priority + " Priority";

    const date = document.createElement("span");
    date.className = "task-date";

    const taskDate = task.createdAt
        ? new Date(task.createdAt)
        : new Date();

    date.textContent = "Created " +
        taskDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });

    meta.append(priorityBadge, date);
    info.append(title, meta);

    main.append(checkButton, info);


    // Action buttons

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-btn";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function() {
        openEditModal(task.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-btn delete";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function() {
        deleteTask(task.id);
    });

    actions.append(editButton, deleteButton);

    card.append(main, actions);

    return card;
}


/* =========================================
   7. COMPLETE / UNDO TASK
========================================= */

function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();
    displayTasks();

    showToast(
        task.completed
            ? "Task completed successfully!"
            : "Task moved back to To Do."
    );
}


/* =========================================
   8. EDIT TASK
========================================= */

function openEditModal(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    editTaskId.value = task.id;
    editTaskInput.value = task.title;
    editPriorityInput.value = task.priority;

    editModal.classList.add("show");

    editTaskInput.focus();
}

function closeEditModal() {
    editModal.classList.remove("show");
}

editForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const id = editTaskId.value;
    const newTitle = editTaskInput.value.trim();
    const newPriority = editPriorityInput.value;

    if (!newTitle) {
        showToast("Task description cannot be empty.");
        return;
    }

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.title = newTitle;
    task.priority = newPriority;

    saveTasks();
    displayTasks();

    closeEditModal();

    showToast("Task updated successfully!");
});

document.getElementById("closeModal")
    .addEventListener("click", closeEditModal);

document.getElementById("cancelEdit")
    .addEventListener("click", closeEditModal);

editModal.addEventListener("click", function(event) {
    if (event.target === editModal) {
        closeEditModal();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeEditModal();
    }
});


/* =========================================
   9. DELETE TASK
========================================= */

function deleteTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    displayTasks();

    showToast("Task deleted successfully!");
}


/* =========================================
   10. SEARCH AND FILTER
========================================= */

searchInput.addEventListener("input", displayTasks);

statusFilter.addEventListener("change", displayTasks);

priorityFilter.addEventListener("change", displayTasks);


/* =========================================
   11. UPDATE STATISTICS
========================================= */

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);


    document.getElementById("total").textContent = total;

    document.getElementById("pending").textContent = pending;

    document.getElementById("completed").textContent = completed;

    document.getElementById("percent").textContent =
        percentage + "%";

    document.getElementById("progressFill").style.width =
        percentage + "%";


    document.getElementById("taskCounter").textContent =
        total + (total === 1 ? " TASK" : " TASKS");

    document.getElementById("progressCount").textContent =
        completed + " of " + total + " tasks completed";


    let message = "Let's get started!";

    if (percentage === 100 && total > 0) {
        message = "Excellent! All tasks completed.";
    } else if (percentage >= 75) {
        message = "Amazing progress! Keep going.";
    } else if (percentage >= 40) {
        message = "Great work! You're making progress.";
    } else if (percentage > 0) {
        message = "Good start! Keep moving forward.";
    }

    document.getElementById("progressMessage").textContent =
        message;
}


/* =========================================
   12. CURRENT DATE
========================================= */

function displayCurrentDate() {

    const today = new Date();

    document.getElementById("currentDate").textContent =
        today.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
}


/* =========================================
   13. INITIALIZE APPLICATION
========================================= */

displayCurrentDate();
displayTasks();
