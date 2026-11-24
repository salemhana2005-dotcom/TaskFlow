
"use strict";

(function (root) {

    function addTask(tasks, title, priority = "Medium", id = Date.now()) {
        if (!title || !title.trim()) return tasks;

        return [
            ...tasks,
            {
                id,
                title: title.trim(),
                priority,
                completed: false
            }
        ];
    }

    function toggleTask(tasks, id) {
        return tasks.map(task =>
            task.id === id
                ? { ...task, completed: !task.completed }
                : task
        );
    }

    function deleteTask(tasks, id) {
        return tasks.filter(task => task.id !== id);
    }

    function updateTask(tasks, id, newTitle) {
        if (!newTitle || !newTitle.trim()) return tasks;

        return tasks.map(task =>
            task.id === id
                ? { ...task, title: newTitle.trim() }
                : task
        );
    }

    const TaskManager = {
        addTask,
        toggleTask,
        deleteTask,
        updateTask
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = TaskManager;
    }

    root.TaskManager = TaskManager;

})(globalThis);
