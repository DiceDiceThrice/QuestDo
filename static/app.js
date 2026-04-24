// Advanced State Management
const DEFAULT_BADGES = [
    { id: 1, name: "The Squire's Start", description: "Earned a basic tunic.", requirement: 1, color: "#8B4513" },
    { id: 2, name: "Light Skirmisher", description: "Secured leather armor.", requirement: 5, color: "#cd7f32" },
    { id: 3, name: "Rugged Vanguard", description: "Iron-plate mail.", requirement: 10, color: "#708090" },
    { id: 4, name: "Radiant Sentinel", description: "Shining steel.", requirement: 15, color: "#B0C4DE" },
    { id: 5, name: "Immortal Paladin", description: "Legendary gold aegis.", requirement: 25, color: "#d4af37" }
];

let state = JSON.parse(localStorage.getItem('questDoState')) || {
    xp: 0,
    level: 1,
    tasks: [],
    badges: DEFAULT_BADGES
};

// Sync metadata
state.badges = DEFAULT_BADGES.map((b, i) => ({...b, is_unlocked: (state.badges[i] ? state.badges[i].is_unlocked : false)}));

document.addEventListener('DOMContentLoaded', () => {
    renderAll();
});

function saveState() { localStorage.setItem('questDoState', JSON.stringify(state)); }

function renderAll() {
    renderStats();
    renderTasks();
    renderBadges();
}

function switchTab(tab) {
    const qSection = document.getElementById('quests-section');
    const tSection = document.getElementById('trophy-section');
    const qBtn = document.getElementById('tab-quests');
    const tBtn = document.getElementById('tab-trophy');

    if (tab === 'quests') {
        qSection.classList.remove('hidden');
        tSection.classList.add('hidden');
        qBtn.classList.add('active'); qBtn.classList.remove('opacity-60');
        tBtn.classList.remove('active'); tBtn.classList.add('opacity-60');
    } else {
        qSection.classList.add('hidden');
        tSection.classList.remove('hidden');
        tBtn.classList.add('active'); tBtn.classList.remove('opacity-60');
        qBtn.classList.remove('active'); qBtn.classList.add('opacity-60');
        setTimeout(renderBadges, 50);
    }
}

function renderStats() {
    const xpPercent = state.xp % 100;
    document.getElementById('xp-fill').style.width = `${xpPercent}%`;
    document.getElementById('xp-text').innerText = `${xpPercent} / 100`;

    // Dynamic Rank Title
    const completedCount = state.tasks.filter(t => t.is_completed).length;
    let currentTitle = "Unproven Recruit";
    
    // Find the highest unlocked milestone name
    for (let i = state.badges.length - 1; i >= 0; i--) {
        if (completedCount >= state.badges[i].requirement) {
            currentTitle = state.badges[i].name;
            break;
        }
    }
    const rankTitleEl = document.getElementById('rank-title');
    if (rankTitleEl) rankTitleEl.innerText = currentTitle;
}

function renderTasks() {
    const list = document.getElementById('task-list');
    if (!list) return;
    list.innerHTML = '';
    if (state.tasks.length === 0) {
        list.innerHTML = `<div class="text-center py-10 italic font-bold text-wood opacity-40">No active decrees.</div>`;
        return;
    }
    state.tasks.forEach((task, index) => {
        const li = document.createElement('div');
        li.className = `bounty-card flex items-center gap-4 p-5 rounded-xl shadow-lg ${task.is_completed ? 'opacity-50' : ''}`;
        li.innerHTML = `
            <input type="checkbox" ${task.is_completed ? 'checked disabled' : ''} onchange="completeTask(${index})" class="seal-checkbox">
            <span class="flex-1 text-xl font-bold text-wood rpg-body ${task.is_completed ? 'line-through text-wood/40' : ''}">${task.title}</span>
            <button onclick="deleteTask(${index})" class="text-wood/40 hover:text-crimson"><span class="material-icons">close</span></button>
        `;
        list.appendChild(li);
    });
}

function renderBadges() {
    const container = document.getElementById('nodes-container');
    if (!container) return;
    container.innerHTML = '';

    const completedCount = state.tasks.filter(t => t.is_completed).length;
    let knightPos = { bottom: 40, left: 10 };
    let knightColor = "#8B4513";

    state.badges.forEach((badge, index) => {
        const isUnlocked = completedCount >= badge.requirement;
        const bottom = 120 + (index * 120);
        const left = (index % 2 === 0) ? 65 : 25;

        if (isUnlocked) {
            knightPos = { bottom: bottom + 10, left: left };
            knightColor = badge.color;
        }

        const node = document.createElement('div');
        node.className = `milestone-node ${isUnlocked ? 'unlocked' : 'locked'}`;
        node.style.bottom = `${bottom}px`;
        node.style.left = `${left}%`;
        
        node.innerHTML = `
            <div class="flag-pole"><div class="flag-cloth"></div></div>
            <div class="node-info">
                <h4 class="font-black uppercase">${badge.name}</h4>
                <p>${isUnlocked ? 'CONQUERED' : badge.requirement + ' QUESTS'}</p>
            </div>
        `;
        container.appendChild(node);
    });

    const knight = document.getElementById('knight');
    if (knight) {
        knight.style.bottom = `${knightPos.bottom}px`;
        knight.style.left = `${knightPos.left}%`;
        const graphic = knight.querySelector('.knight-graphic');
        if (graphic) {
            graphic.style.backgroundImage = "url('knight.png')";
            graphic.style.display = 'block';
        }
    }
}

function addTask() {
    const input = document.getElementById('task-input');
    const title = input.value.trim();
    if (!title) return;
    state.tasks.unshift({ title, is_completed: false });
    input.value = '';
    saveState();
    renderTasks();
}

function handleEnter(e) { if (e.key === 'Enter') addTask(); }

function completeTask(index) {
    if (state.tasks[index].is_completed) return;
    state.tasks[index].is_completed = true;
    state.xp += 10;
    state.level = Math.floor(state.xp / 100) + 1;
    showToast();
    saveState();
    renderAll();
}

// New Multi-Action Functions
function checkAllTasks() {
    let tasksUpdated = false;
    state.tasks.forEach(task => {
        if (!task.is_completed) {
            task.is_completed = true;
            state.xp += 10;
            tasksUpdated = true;
        }
    });
    
    if (tasksUpdated) {
        state.level = Math.floor(state.xp / 100) + 1;
        saveState();
        renderAll();
        showToast("All Bounties Conquered!");
    }
}

function removeAllTasks() {
    if (confirm("Are you sure you want to clear the Bounty Board? This will reset your progress and rank.")) {
        state.tasks = [];
        state.xp = 0;
        state.level = 1;
        saveState();
        renderAll();
    }
}

function deleteTask(index) {
    state.tasks.splice(index, 1);
    saveState();
    renderTasks();
    renderBadges();
    renderStats();
}

function showToast(message = "QUEST CONQUERED!") {
    const toast = document.getElementById('toast');
    const toastTitle = toast.querySelector('h3');
    if (toastTitle) toastTitle.innerText = message;
    
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -80px)';
    }, 4000);
}
