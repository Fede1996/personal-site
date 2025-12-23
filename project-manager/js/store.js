const STORAGE_KEY = 'pm_tasks_v1';

export const store = {
    getTasks() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    },

    // Optional: Clear all data
    clear() {
        localStorage.removeItem(STORAGE_KEY);
    }
};
