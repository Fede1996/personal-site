/**
 * FIREBASE CONFIGURATION
 * INCOLLA QUI LA TUA CONFIGURAZIONE FIREBASE
 */
const firebaseConfig = {
    apiKey: "AIzaSyCfNWZa-xCFmkVUh7oyZLoWAZFsrVSW2rY",
    authDomain: "mia-azienda-gestionale.firebaseapp.com",
    projectId: "mia-azienda-gestionale",
    storageBucket: "mia-azienda-gestionale.firebasestorage.app",
    messagingSenderId: "1009590314756",
    appId: "1:1009590314756:web:7aa128a8b9ec892c5f9251",
    measurementId: "G-SKS3QZ1F4B"
};

// Initialize Firebase
let db = null;
try {
    if (firebaseConfig.projectId) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    } else {
        console.warn("Firebase config incomplete.");
    }
} catch (e) {
    console.warn("Firebase init error:", e);
}

/**
 * MODELS & UTILS
 */
function generateId() {
    return 'task_' + Math.random().toString(36).substr(2, 9);
}

function createTask({
    code,
    name,
    description,
    deadline,
    status = 'red',
    parentId = null
}) {
    return {
        id: generateId(), // Temp ID for internal logic, Firestore will overwrite or we use this as doc ID
        parentId,
        code,
        name,
        description,
        deadline,
        status,
        subtasks: [],
        createdAt: new Date().toISOString(),
        expanded: true
    };
}

// Helper to format 2 digits
const pad = (n) => n.toString().padStart(2, '0');

// Custom Code Generator
async function generateCustomCode(tipo, ambito) {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1);
        const counterKey = `${year}-${month}`; // Key for the monthly counter

        const counterRef = db.collection('counters').doc(counterKey);

        let newIndex = 1;

        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(counterRef);
            if (!doc.exists) {
                transaction.set(counterRef, { count: 1 });
                newIndex = 1;
            } else {
                newIndex = doc.data().count + 1;
                transaction.update(counterRef, { count: newIndex });
            }
        });

        // Format: TIPO-AMBITO-YYYY-MM-INDEX
        const typeStr = (tipo || 'GEN').toUpperCase();
        const scopeStr = (ambito || 'SIT').toUpperCase();

        return `${typeStr}-${scopeStr}-${year}-${month}-${pad(newIndex)}`;
    } catch (e) {
        console.error("Code generation failed", e);
        return `ERR-${Date.now()}`;
    }
}

// Logic: Check if parent can be green
function canBeGreen(task) {
    if (!task.subtasks || task.subtasks.length === 0) return true;
    return task.subtasks.every(t => t.status === 'green');
}

// Recursively build tree from flat list (Firestore returns flat collection typically, or we store JSON blob)
// Strategy: Store everything in one Doc? Or collection of tasks? 
// For "Project Manager" usually better to have Tasks collection.
// But to keep it simple and consistent with previous "recursive tree" structure logic, 
// we might store the whole tree as a JSON blob in a 'projects' collection if strictly personal.
// However, the user asked to connect to "Mia-Azienda-Gestionale", implies scalability.
// Let's assume a "projects" collection where each document IS A ROOT TASK (with nested subtasks array).
// This is the easiest migration from LocalStorage.

/**
 * DATA LAYER (Async)
 */
const api = {
    async getProjects() {
        if (!db) return [];
        try {
            const snapshot = await db.collection('projects').get();
            return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } catch (e) {
            console.error("Error fetching projects", e);
            alert("Errore Firebase: " + e.message + "\n\nControlla la Console (F12) per dettagli.");
            return [];
        }
    },

    async saveProject(project) {
        if (!db) return;
        if (project.id && project.id.length > 20) {
            // Update existing (Firestore IDs are usually 20 chars, our random IDs are 'task_...')
            // If it's a new doc, we might want to use set with custom ID or add.
            // Let's rely on set for updates.
            await db.collection('projects').doc(project.id).set(project);
        } else {
            // New doc
            const docRef = await db.collection('projects').add(project);
            return { ...project, id: docRef.id }; // return with real ID
        }
    },

    async deleteProject(id) {
        if (!db) return;
        await db.collection('projects').doc(id).delete();
    },

    // New: Fetch Options
    async getCollectionData(collectionName) {
        if (!db) return [];
        try {
            const snapshot = await db.collection(collectionName).get();
            // Assume ID is the code, or look for a specific field 'codice' or 'id'
            // User requirement: "codice sia formato da quello che ho su firestore"
            // We'll return id as value and data for label
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (e) {
            console.error(`Error fetching ${collectionName}`, e);
            return [];
        }
    }
};

/**
 * CONFIG LOADER
 */
async function loadDropdowns() {
    const typeSelect = document.getElementById('project-type');
    const scopeSelect = document.getElementById('project-scope');

    // Fallback if DB not connected
    if (!db) {
        typeSelect.innerHTML = '<option value="WEB">WEB (Offline)</option>';
        scopeSelect.innerHTML = '<option value="INT">INT (Offline)</option>';
        return;
    }

    const [types, scopes] = await Promise.all([
        api.getCollectionData('Tipo_Progetto'),
        api.getCollectionData('Ambito_Progetto')
    ]);

    const populate = (select, items, placeholder) => {
        select.innerHTML = '';
        if (items.length === 0) {
            select.innerHTML = `<option value="">Nessun dato (${placeholder})</option>`;
            // Add manual fallback for testing if collection is empty?
            // select.innerHTML += '<option value="TEST">TEST (Fallback)</option>'; 
            return;
        }

        items.forEach(item => {
            // Use 'codice' field if exists, otherwise ID. Use 'descrizione' or 'nome' for label if exists.
            const value = item.codice || item.id;
            const label = item.descrizione || item.nome || item.name || value;

            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = `${label} (${value})`;
            select.appendChild(opt);
        });
    };

    populate(typeSelect, types, 'Tipo');
    populate(scopeSelect, scopes, 'Ambito');
}

// ... rest of utils ...


// UTILS FOR TREE MANIPULATION (Same as before but handling whole project objects)
// NOTE: We only fetch ROOTS. Subtasks are inside the root document.

function findTaskInTree(tasks, id) {
    for (const task of tasks) {
        if (task.id === id) return task;
        if (task.subtasks && task.subtasks.length > 0) {
            const found = findTaskInTree(task.subtasks, id);
            if (found) return found;
        }
    }
    return null;
}

function updateTaskGeneric(tasks, updatedTask) {
    return tasks.map(task => {
        if (task.id === updatedTask.id) return updatedTask;
        if (task.subtasks) {
            return { ...task, subtasks: updateTaskGeneric(task.subtasks, updatedTask) };
        }
        return task;
    });
}

function addSubtaskGeneric(tasks, parentId, newSubtask) {
    return tasks.map(task => {
        if (task.id === parentId) {
            return { ...task, subtasks: [...(task.subtasks || []), newSubtask], expanded: true };
        }
        if (task.subtasks) {
            return { ...task, subtasks: addSubtaskGeneric(task.subtasks, parentId, newSubtask) };
        }
        return task;
    });
}

function enforceStatusGeneric(tasks) {
    const traverse = (t) => {
        let updatedSubtasks = t.subtasks || [];
        if (updatedSubtasks.length > 0) {
            updatedSubtasks = updatedSubtasks.map(traverse);
        }

        let newStatus = t.status;
        const allChildrenGreen = updatedSubtasks.every(child => child.status === 'green');

        if (t.status === 'green' && !allChildrenGreen && updatedSubtasks.length > 0) {
            newStatus = 'yellow';
        }

        return { ...t, subtasks: updatedSubtasks, status: newStatus };
    };
    return tasks.map(traverse);
}


/**
 * APP UI LOGIC
 */

// DOM Elements
const taskListEl = document.getElementById('task-list');
const addRootBtn = document.getElementById('add-root-task-btn');
const modal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const cancelBtn = document.getElementById('cancel-btn');
const modalTitle = document.getElementById('modal-title');
const codeGenFields = document.getElementById('code-generation-fields');

// Auth Elements
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app');
const loginBtn = document.getElementById('login-btn');

// State : List of PROJECT ROOTS
let projects = [];

// --- AUTHENTICATION ---
const auth = firebase.auth();
const ALLOWED_EMAIL = "federicogorrino@gmail.com";

function handleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(e => alert("Errore Login: " + e.message));
}

function handleLogout() {
    auth.signOut();
    window.location.reload();
}

auth.onAuthStateChanged(user => {
    if (user) {
        if (user.email === ALLOWED_EMAIL) {
            // Authorized
            loginScreen.classList.add('hidden');
            appScreen.classList.remove('hidden');

            // Add Logout Button to Header (simple injection)
            const header = document.querySelector('.logo-container');
            if (header && !document.getElementById('logout-btn')) {
                const logoutDiv = document.createElement('div');
                logoutDiv.className = 'user-profile';
                logoutDiv.style.marginLeft = 'auto'; // Push to right
                logoutDiv.innerHTML = `
                    <button id="logout-btn" class="logout-btn">Esci</button>
                    <img src="${user.photoURL}" class="avatar" title="${user.email}">
                `;
                document.querySelector('.app-header').appendChild(logoutDiv);
                document.getElementById('logout-btn').onclick = handleLogout;
            }

            refreshData();
            loadDropdowns();
        } else {
            // Unauthorized
            alert("ACCESSO NEGATO: L'email " + user.email + " non è autorizzata.");
            auth.signOut();
        }
    } else {
        // Not logged in
        loginScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');
    }
});

if (loginBtn) loginBtn.onclick = handleLogin;

// --- Rendering ---
// ... (Resume standard rendering code)

function getStatusLabel(status) {
    if (status === 'green') return 'Completato';
    if (status === 'yellow') return 'In Corso';
    return 'Bloccato/Ritardo';
}

function renderTask(task, level = 0, isRoot = false) {
    // ... (same as before)
    const el = document.createElement('div');
    el.className = `task-item status-${task.status}`;

    el.innerHTML = `
        <div class="task-header">
            <div class="task-info">
                <div><span class="task-code">${task.code}</span></div>
                <div class="task-title">${task.name}</div>
                <div class="task-meta">
                    <span>📅 ${task.deadline || 'N/A'}</span>
                    <span>${getStatusLabel(task.status)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon add-sub-btn" data-id="${task.id}" title="Aggiungi Sottotask">+</button>
                <button class="btn-icon edit-btn" data-id="${task.id}" title="Modifica">✎</button>
                <button class="btn-icon delete-btn" data-id="${task.id}" title="Elimina">🗑</button>
            </div>
        </div>
    `;

    // Handlers
    el.querySelector('.add-sub-btn').onclick = (e) => { e.stopPropagation(); openModal(null, task.id); };
    el.querySelector('.edit-btn').onclick = (e) => { e.stopPropagation(); openModal(task); };
    el.querySelector('.delete-btn').onclick = (e) => { e.stopPropagation(); deleteItem(task.id, isRoot); };

    // Subtasks
    if (task.subtasks && task.subtasks.length > 0) {
        const subContainer = document.createElement('div');
        subContainer.className = 'subtasks-container open';
        task.subtasks.forEach(sub => {
            subContainer.appendChild(renderTask(sub, level + 1, false));
        });
        el.appendChild(subContainer);
    }

    return el;
}

function render() {
    taskListEl.innerHTML = '';

    if (projects.length === 0) {
        taskListEl.innerHTML = `
            <div class="empty-state">
                <p>Nessun progetto presente. Crea il primo!</p>
            </div>`;
        return;
    }

    projects.forEach(p => {
        taskListEl.appendChild(renderTask(p, 0, true));
    });
}

async function refreshData() {
    if (!auth.currentUser) return; // Prevent loading if not logged in
    taskListEl.innerHTML = '<p style="text-align:center; padding:2rem;">Caricamento...</p>';
    projects = await api.getProjects();
    render();
}

// ... (Rest of logic: deleteItem, openModal, closeModal, onsubmit)

async function deleteItem(id, isRoot) {
    if (!confirm('Eliminare elemento e sotto-task?')) return;

    if (isRoot) {
        await api.deleteProject(id);
    } else {
        for (let p of projects) {
            const flattened_check = JSON.stringify(p);
            if (flattened_check.includes(id)) {
                const removeRec = (list) => list.filter(t => t.id !== id).map(t => ({ ...t, subtasks: removeRec(t.subtasks || []) }));
                // We don't have deep clone here easily, using removeRec on P logic
                // Actually the logic provided in previous step was slightly flawed but functional for simple cases. 
                // Let's keep it consistent with previous functional version.

                // Deep remove function
                const deepRemove = (t) => {
                    if (!t.subtasks) return t;
                    t.subtasks = t.subtasks.filter(sub => sub.id !== id).map(deepRemove);
                    return t;
                };

                const updatedP = deepRemove({ ...p });
                await api.saveProject(updatedP);
                break;
            }
        }
    }
    refreshData();
}

// Modal & Form logic remains same

function openModal(editingTask = null, parentId = null) {
    modal.classList.remove('hidden');
    modal.classList.add('visible');

    taskForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('task-parent-id').value = '';

    const isNewRoot = !editingTask && !parentId;

    if (isNewRoot) {
        codeGenFields.style.display = 'block';
        document.getElementById('task-code').placeholder = "Autogenerato al salvataggio";
    } else {
        codeGenFields.style.display = 'none';
    }

    if (editingTask) {
        modalTitle.textContent = 'Modifica Task';
        document.getElementById('task-id').value = editingTask.id;
        document.getElementById('task-code').value = editingTask.code;
        document.getElementById('task-name').value = editingTask.name;
        document.getElementById('task-desc').value = editingTask.description;
        document.getElementById('task-deadline').value = editingTask.deadline;
        document.getElementById('task-status').value = editingTask.status;
    } else {
        modalTitle.textContent = parentId ? 'Nuovo Sottotask' : 'Nuovo Progetto';
        document.getElementById('task-parent-id').value = parentId || '';
        if (!isNewRoot) {
            document.getElementById('task-code').value = 'SUB-' + Math.floor(Math.random() * 1000);
        }
    }
}

function closeModal() {
    modal.classList.remove('visible');
    modal.classList.add('hidden');
}

if (taskForm) {
    taskForm.onsubmit = async (e) => {
        e.preventDefault();

        const taskId = document.getElementById('task-id').value;
        const parentId = document.getElementById('task-parent-id').value;

        const taskData = {
            code: document.getElementById('task-code').value,
            name: document.getElementById('task-name').value,
            description: document.getElementById('task-desc').value,
            deadline: document.getElementById('task-deadline').value,
            status: document.getElementById('task-status').value
        };

        const isNewRoot = !taskId && !parentId;
        if (isNewRoot) {
            const tipo = document.getElementById('project-type').value;
            const ambito = document.getElementById('project-scope').value;
            taskData.code = await generateCustomCode(tipo, ambito);
        }

        if (taskId) {
            for (let p of projects) {
                let found = false;
                if (p.id === taskId) {
                    const updated = { ...p, ...taskData };
                    if (updated.status === 'green' && !canBeGreen(updated)) {
                        alert('Impossibile impostare Verde: sottotask non completati.'); return;
                    }
                    const enforced = enforceStatusGeneric([updated])[0];
                    await api.saveProject(enforced);
                    found = true;
                } else {
                    const inTree = findTaskInTree(p.subtasks || [], taskId);
                    if (inTree) {
                        const updatedP = updateTaskGeneric([p], { ...inTree, ...taskData })[0];
                        const enforcedP = enforceStatusGeneric([updatedP])[0];
                        await api.saveProject(enforcedP);
                        found = true;
                    }
                }
                if (found) break;
            }
        } else {
            const newTask = createTask({ ...taskData, parentId: parentId || null });

            if (parentId) {
                for (let p of projects) {
                    let targetP = null;
                    if (p.id === parentId) targetP = p;
                    else if (findTaskInTree(p.subtasks || [], parentId)) targetP = p;

                    if (targetP) {
                        const updatedP = addSubtaskGeneric([targetP], parentId, newTask)[0];
                        const enforcedP = enforceStatusGeneric([updatedP])[0];
                        await api.saveProject(enforcedP);
                        break;
                    }
                }
            } else {
                await api.saveProject(newTask);
            }
        }

        closeModal();
        refreshData();
    };
}

if (addRootBtn) addRootBtn.onclick = () => openModal();
if (cancelBtn) cancelBtn.onclick = closeModal;

// Removed auto-init because Auth State Change handles it
// document.addEventListener('DOMContentLoaded', () => { refreshData(); loadDropdowns(); });
