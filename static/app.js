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
    completedHistory: [],
    badges: DEFAULT_BADGES
};

if (!state.completedHistory) state.completedHistory = [];

state.badges = DEFAULT_BADGES.map((b, i) => ({...b, is_unlocked: (state.badges[i] ? state.badges[i].is_unlocked : false)}));

document.addEventListener('DOMContentLoaded', () => {
    renderAll();
});

function saveState() { localStorage.setItem('questDoState', JSON.stringify(state)); }

function renderAll() {
    renderStats();
    renderTasks();
    renderBadges();
    renderHistory();
}

function switchTab(tab) {
    const sections = {
        'quests': document.getElementById('quests-section'),
        'history': document.getElementById('history-section'),
        'trophy': document.getElementById('trophy-section')
    };
    const buttons = {
        'quests': document.getElementById('tab-quests'),
        'history': document.getElementById('tab-history'),
        'trophy': document.getElementById('tab-trophy')
    };

    Object.values(sections).forEach(s => s.classList.add('hidden'));
    Object.values(buttons).forEach(b => { b.classList.remove('active'); b.classList.add('opacity-60'); });

    sections[tab].classList.remove('hidden');
    buttons[tab].classList.add('active');
    buttons[tab].classList.remove('opacity-60');

    if (tab === 'trophy') setTimeout(renderBadges, 50);
    if (tab === 'history') renderHistory();
}

function renderStats() {
    document.getElementById('level-text').innerText = `Rank ${state.level}`;
    const xpPercent = state.xp % 100;
    document.getElementById('xp-fill').style.width = `${xpPercent}%`;
    document.getElementById('xp-text').innerText = `${xpPercent} / 100`;

    const completedCount = state.completedHistory.length;
    let currentTitle = "Unproven Recruit";
    
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
            <button onclick="deleteTask(${index})" class="text-wood/40 hover:text-crimson transition-all"><span class="material-icons">close</span></button>
        `;
        list.appendChild(li);
    });
}

function renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (state.completedHistory.length === 0) {
        list.innerHTML = `<div class="text-center py-10 italic text-wood/40">No deeds have been recorded yet.</div>`;
        return;
    }

    [...state.completedHistory].reverse().forEach(item => {
        const entry = document.createElement('div');
        entry.className = "flex items-center gap-3 p-3 border-l-4 border-gold bg-wood/5 rounded-r";
        entry.innerHTML = `
            <span class="material-icons text-gold text-sm">verified</span>
            <div class="flex-1">
                <p class="text-wood font-bold text-sm">${item.title}</p>
                <p class="text-[9px] text-wood/40 uppercase font-bold">${item.date}</p>
            </div>
            <span class="text-[10px] font-black text-green-800">+10 XP</span>
        `;
        list.appendChild(entry);
    });
}

function renderBadges() {
    const container = document.getElementById('nodes-container');
    if (!container) return;
    container.innerHTML = '';

    const completedCount = state.completedHistory.length;
    let knightPos = { bottom: 40, left: 10 };

    state.badges.forEach((badge, index) => {
        const isUnlocked = completedCount >= badge.requirement;
        const bottom = 120 + (index * 120);
        const left = (index % 2 === 0) ? 65 : 25;

        if (isUnlocked) knightPos = { bottom: bottom + 10, left: left };

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
    
    const task = state.tasks[index];
    task.is_completed = true;
    state.xp += 10;
    state.level = Math.floor(state.xp / 100) + 1;

    state.completedHistory.push({
        title: task.title,
        date: new Date().toLocaleString()
    });

    showToast();
    saveState();
    renderAll();
}

function checkAllTasks() {
    let tasksUpdated = false;
    state.tasks.forEach(task => {
        if (!task.is_completed) {
            task.is_completed = true;
            state.xp += 10;
            state.completedHistory.push({
                title: task.title,
                date: new Date().toLocaleString()
            });
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
    if (confirm("Are you sure you want to clear the active Bounty Board? Your progress and history will be preserved.")) {
        state.tasks = []; // Only clear active tasks, preserving history and XP
        saveState();
        renderAll();
    }
}

function deleteTask(index) {
    state.tasks.splice(index, 1);
    saveState();
    renderAll();
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
