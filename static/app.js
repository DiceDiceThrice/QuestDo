// State Management
let currentTab = 'quests';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    refreshAll();
});

async function refreshAll() {
    await fetchStats();
    await fetchTasks();
    await fetchBadges();
}

// Tab Switching
function switchTab(tab) {
    currentTab = tab;
    const questsSection = document.getElementById('quests-section');
    const trophySection = document.getElementById('trophy-section');
    const tabQuests = document.getElementById('tab-quests');
    const tabTrophy = document.getElementById('tab-trophy');

    if (tab === 'quests') {
        questsSection.classList.remove('hidden');
        trophySection.classList.add('hidden');
        tabQuests.classList.add('active');
        tabTrophy.classList.remove('active');
        fetchTasks();
    } else {
        questsSection.classList.add('hidden');
        trophySection.classList.remove('hidden');
        tabQuests.classList.remove('active');
        tabTrophy.classList.add('active');
        fetchBadges();
    }
}

// Fetch Functions
async function fetchStats() {
    const res = await fetch('/api/stats');
    const data = await res.json();
    
    document.getElementById('level-text').innerText = `Level ${data.level}`;
    const xpPercent = data.xp % 100;
    document.getElementById('xp-fill').style.width = `${xpPercent}%`;
    document.getElementById('xp-text').innerText = `${xpPercent} / 100 XP to next level`;
}

async function fetchTasks() {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.is_completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" ${task.is_completed ? 'checked disabled' : ''} onchange="completeTask(${task.id})">
            <span>${task.title}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                <span class="material-icons">delete</span>
            </button>
        `;
        list.appendChild(li);
    });
}

async function fetchBadges() {
    const res = await fetch('/api/badges');
    const badges = await res.json();
    
    const grid = document.getElementById('badge-grid');
    grid.innerHTML = '';
    
    badges.forEach(badge => {
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
async function addTask() {
    const input = document.getElementById('task-input');
    const title = input.value.trim();
    if (!title) return;

    await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });

    input.value = '';
    fetchTasks();
}

async function handleEnter(e) {
    if (e.key === 'Enter') addTask();
}

async function completeTask(id) {
    await fetch(`/api/tasks/${id}/complete`, { method: 'PUT' });
    showToast();
    refreshAll();
}

async function deleteTask(id) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
}

// UI Utilities
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
