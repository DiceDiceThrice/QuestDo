// State Management - Initializing from LocalStorage
let state = JSON.parse(localStorage.getItem('questDoState')) || {
    xp: 0,
    level: 1,
    tasks: [],
    badges: [
        { id: 1, name: "First Blood", description: "Complete your first quest!", requirement: 1, is_unlocked: false },
        { id: 2, name: "Novice Adventurer", description: "Complete 5 quests.", requirement: 5, is_unlocked: false },
        { id: 3, name: "Quest Master", description: "Complete 10 quests.", requirement: 10, is_unlocked: false },
        { id: 4, name: "Legendary Hero", description: "Complete 25 quests.", requirement: 25, is_unlocked: false }
    ]
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderAll();
});

function saveState() {
    localStorage.setItem('questDoState', JSON.stringify(state));
}

function renderAll() {
    renderStats();
    renderTasks();
    renderBadges();
}

// Tab Switching
function switchTab(tab) {
    const questsSection = document.getElementById('quests-section');
    const trophySection = document.getElementById('trophy-section');
    const tabQuests = document.getElementById('tab-quests');
    const tabTrophy = document.getElementById('tab-trophy');

    if (tab === 'quests') {
        questsSection.classList.remove('hidden');
        trophySection.classList.add('hidden');
        tabQuests.classList.add('active');
        tabTrophy.classList.remove('active');
    } else {
        questsSection.classList.add('hidden');
        trophySection.classList.remove('hidden');
        tabQuests.classList.remove('active');
        tabTrophy.classList.add('active');
        renderBadges();
    }
}

// Render Functions
function renderStats() {
    document.getElementById('level-text').innerText = `Level ${state.level}`;
    const xpPercent = state.xp % 100;
    document.getElementById('xp-fill').style.width = `${xpPercent}%`;
    document.getElementById('xp-text').innerText = `${xpPercent} / 100 XP to next level`;
}

function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    
    state.tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.is_completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" ${task.is_completed ? 'checked disabled' : ''} onchange="completeTask(${index})">
            <span>${task.title}</span>
            <button class="delete-btn" onclick="deleteTask(${index})">
                <span class="material-icons">delete</span>
            </button>
        `;
        list.appendChild(li);
    });
}

function renderBadges() {
    const grid = document.getElementById('badge-grid');
    grid.innerHTML = '';
    
    const completedCount = state.tasks.filter(t => t.is_completed).length;

    state.badges.forEach(badge => {
        // Check if milestone reached
        if (completedCount >= badge.requirement) {
            badge.is_unlocked = true;
        }

        const div = document.createElement('div');
        div.className = `badge-card ${badge.is_unlocked ? 'unlocked' : ''}`;
        
        div.innerHTML = `
            <span class="material-icons">${badge.is_unlocked ? 'stars' : 'lock'}</span>
            <h4>${badge.name}</h4>
            <p>${badge.description}</p>
        `;
        grid.appendChild(div);
    });
}

// Task Actions
function addTask() {
    const input = document.getElementById('task-input');
    const title = input.value.trim();
    if (!title) return;

    state.tasks.push({
        title: title,
        is_completed: false
    });

    input.value = '';
    saveState();
    renderTasks();
}

function handleEnter(e) {
    if (e.key === 'Enter') addTask();
}

function completeTask(index) {
    if (state.tasks[index].is_completed) return;

    state.tasks[index].is_completed = true;
    state.xp += 10;
    
    // Level Up Logic
    state.level = Math.floor(state.xp / 100) + 1;

    showToast();
    saveState();
    renderAll();
}

function deleteTask(index) {
    state.tasks.splice(index, 1);
    saveState();
    renderTasks();
    renderBadges();
}

// UI Utilities
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
