// Smart To-Do List JavaScript
class TodoList {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.render();
    }

    cacheElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.filterTabs = document.querySelectorAll('.tab');
        this.recButtons = document.querySelectorAll('.rec-btn');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
                this.updateActiveTab(e.target);
            });
        });

        this.recButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.addRecommendedTask(e.target.dataset.task);
            });
        });

        // Event delegation for task actions
        this.taskList.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTask(e.target);
            }
        });

        this.taskList.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                this.deleteTask(e.target);
            }
        });
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            this.showNotification('Please enter a task!', 'warning');
            return;
        }

        const task = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        this.taskInput.value = '';
        this.showNotification('Task added successfully!', 'success');
    }

    addRecommendedTask(text) {
        this.taskInput.value = text;
        this.taskInput.focus();
    }

    toggleTask(checkbox) {
        const taskId = parseInt(checkbox.closest('.task-item').dataset.id);
        const task = this.tasks.find(t => t.id === taskId);
        
        if (task) {
            task.completed = checkbox.checked;
            this.saveTasks();
            this.render();
            this.showNotification(
                task.completed ? 'Task completed!' : 'Task marked as pending',
                'success'
            );
        }
    }

    deleteTask(button) {
        const taskItem = button.closest('.task-item');
        const taskId = parseInt(taskItem.dataset.id);
        
        // Add fade out animation
        taskItem.style.animation = 'fadeOut 0.3s ease';
        
        setTimeout(() => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.render();
            this.showNotification('Task deleted!', 'info');
        }, 300);
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    updateActiveTab(activeTab) {
        this.filterTabs.forEach(tab => tab.classList.remove('active'));
        activeTab.classList.add('active');
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Update stats
        const completedCount = this.tasks.filter(t => t.completed).length;
        this.totalTasks.textContent = `${this.tasks.length} task${this.tasks.length !== 1 ? 's' : ''}`;
        this.completedTasks.textContent = `${completedCount} completed`;

        // Show/hide empty state
        if (filteredTasks.length === 0) {
            this.taskList.style.display = 'none';
            this.emptyState.style.display = 'block';
            this.emptyState.querySelector('h3').textContent = 
                this.tasks.length === 0 ? 'No tasks yet' : 'No tasks in this view';
        } else {
            this.taskList.style.display = 'block';
            this.emptyState.style.display = 'none';
        }

        // Render tasks
        this.taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="delete-btn" aria-label="Delete task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </li>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            zIndex: '1000',
            animation: 'slideInRight 0.3s ease',
            maxWidth: '300px',
            boxShadow: 'var(--shadow-lg)'
        });

        // Set background color based on type
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Utility methods
    clearAllTasks() {
        if (confirm('Are you sure you want to clear all tasks?')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
            this.showNotification('All tasks cleared!', 'info');
        }
    }

    exportTasks() {
        const data = JSON.stringify(this.tasks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'todo-tasks.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.9);
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new TodoList();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                document.getElementById('addBtn').click();
                break;
            case 'a':
                e.preventDefault();
                document.getElementById('taskInput').focus();
                break;
        }
    }
});
