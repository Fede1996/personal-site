/**
 * Generates a unique ID
 */
export function generateId() {
    return 'task_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Creates a new Task object
 */
export function createTask({ 
    code, 
    name, 
    description, 
    deadline, 
    status = 'red',
    parentId = null 
}) {
    return {
        id: generateId(),
        parentId,
        code,
        name,
        description,
        deadline,
        status, // 'green', 'yellow', 'red'
        subtasks: [],
        createdAt: new Date().toISOString(),
        expanded: true // UI State
    };
}

/**
 * Validates status consistency recursively
 * - A parent CANNOT be green if any child is NOT green.
 * - This function doesn't auto-update parents (unless we want strict enforcement),
 *   but returns if the current state is valid according to the rule.
 *   
 *   Proposed logic:
 *   - Use this to check if a user is ALLOWED to set a parent to green.
 *   - Or force parent to non-green if a child changes to non-green.
 */
export function canBeGreen(task) {
    if (!task.subtasks || task.subtasks.length === 0) return true;
    return task.subtasks.every(t => t.status === 'green');
}

/**
 * Recursively find a task by ID
 */
export function findTaskById(tasks, id) {
    for (const task of tasks) {
        if (task.id === id) return task;
        if (task.subtasks.length > 0) {
            const found = findTaskById(task.subtasks, id);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Recursively update a task
 * Returns a NEW array of tasks (immutable-ish pattern for safety)
 */
export function updateTaskInTree(tasks, updatedTask) {
    return tasks.map(task => {
        if (task.id === updatedTask.id) {
            return updatedTask;
        }
        if (task.subtasks.length > 0) {
            return {
                ...task,
                subtasks: updateTaskInTree(task.subtasks, updatedTask)
            };
        }
        return task;
    });
}

/**
 * Add a subtask to a specific parent
 */
export function addSubtaskToTree(tasks, parentId, newSubtask) {
    return tasks.map(task => {
        if (task.id === parentId) {
            return {
                ...task,
                subtasks: [...task.subtasks, newSubtask],
                expanded: true
            };
        }
        if (task.subtasks.length > 0) {
            return {
                ...task,
                subtasks: addSubtaskToTree(task.subtasks, parentId, newSubtask)
            };
        }
        return task;
    });
}

/**
 * Check and enforce the Parent status rule recursively.
 * If a child is NOT green, parent cannot be green.
 * Returns updated tasks tree.
 */
export function enforceStatusRules(tasks) {
    // We need to traverse bottom-up or check after updates.
    // Simpler approach: Recursive map that calculates valid status on the way up?
    // Or just a separate pass.
    
    // Let's do a recursive pass that updates parents based on children.
    // If a parent is Green, but children are mixed -> Force Parent to Yellow or Red?
    // User requirement: "un task non può essere verde se i sotto task non sono tutti verdi"
    // This implies if we change a child to Red, parent must change.
    
    // Strategy:
    // 1. Traverse deep.
    // 2. On return, check children. 
    // 3. If any child is !green && parent is green -> Set parent to 'yellow' (as fallback warning).
    
    const traverse = (t) => {
        let updatedSubtasks = t.subtasks;
        if (t.subtasks.length > 0) {
            updatedSubtasks = t.subtasks.map(traverse);
        }
        
        let newStatus = t.status;
        const allChildrenGreen = updatedSubtasks.every(child => child.status === 'green');
        
        if (t.status === 'green' && !allChildrenGreen && updatedSubtasks.length > 0) {
            // Violation! Demote to yellow
            newStatus = 'yellow'; 
        }

        return {
            ...t,
            subtasks: updatedSubtasks,
            status: newStatus
        };
    };

    return tasks.map(traverse);
}
