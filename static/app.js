// Advanced State Management
const DEFAULT_BADGES = [
    { id: 1, name: "Slayer of Procrastination", description: "Complete your first bounty!", requirement: 1, icon: "flare" },
    { id: 2, name: "Wandering Knight", description: "Complete 5 bounties.", requirement: 5, icon: "explore" },
    { id: 3, name: "Legendary Hero", description: "Complete 10 bounties.", requirement: 10, icon: "workspace_premium" },
    { id: 4, name: "Immortal Sage", description: "Complete 25 bounties.", requirement: 25, icon: "auto_fix_high" }
];

let state = JSON.parse(localStorage.getItem('questDoState')) || {
    xp: 0,
    level: 1,
    tasks: [],
    badges: DEFAULT_BADGES
};

// Migration
state.badges = state.badges.map((badge, index) => ({
    ...DEFAULT_BADGES[index],
    ...badge
}));

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

// UI: Tab Switching
function switchTab(tab) {
    const questsSection = document.getElementById('quests-section');
    const trophySection = document.getElementById('trophy-section');
    const tabQuests = document.getElementById('tab-quests');
    const tabTrophy = document.getElementById('tab-trophy');

    if (tab === 'quests') {
        questsSection.classList.remove('hidden');
        trophySection.classList.add('hidden');
        tabQuests.classList.add('active');
        tabQuests.classList.remove('opacity-60');
        tabTrophy.classList.remove('active');
        tabTrophy.classList.add('opacity-60');
    } else {
        questsSection.classList.add('hidden');
        trophySection.classList.remove('hidden');
        tabTrophy.classList.add('active');
        tabTrophy.classList.remove('opacity-60');
        tabQuests.classList.remove('active');
        tabQuests.classList.add('opacity-60');
        renderBadges();
    }
}

// UI: Dynamic Stats
function renderStats() {
    document.getElementById('level-text').innerText = `Rank ${state.level}`;
    const xpPercent = state.xp % 100;
    document.getElementById('xp-fill').style.width = `${xpPercent}%`;
    document.getElementById('xp-text').innerText = `${xpPercent} / 100`;
}

// UI: Task List (Bounty notices)
function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    
    if (state.tasks.length === 0) {
        list.innerHTML = `
            <div class="text-center py-10 opacity-40 italic font-bold text-wood">
                <span class="material-icons text-5xl mb-2">history_edu</span>
                <p>The Bounty Board is empty. Scribe a quest to begin.</p>
            </div>
        `;
        return;
    }

    state.tasks.forEach((task, index) => {
        const li = document.createElement('div');
        li.className = `bounty-card flex items-center gap-4 p-5 rounded shadow-lg ${task.is_completed ? 'opacity-50' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" ${task.is_completed ? 'checked disabled' : ''} 
                   onchange="completeTask(${index})" 
                   class="seal-checkbox">
            <span class="flex-1 text-xl font-bold text-wood rpg-body ${task.is_completed ? 'line-through text-wood/40' : ''}">${task.title}</span>
            <button onclick="deleteTask(${index})" class="p-2 text-wood/40 hover:text-crimson transition-all">
                <span class="material-icons">close</span>
            </button>
        `;
        list.appendChild(li);
    });
}

// UI: Trophy Grid (Artifacts)
function renderBadges() {
    const grid = document.getElementById('badge-grid');
    grid.innerHTML = '';
    
    const completedCount = state.tasks.filter(t => t.is_completed).length;

    state.badges.forEach(badge => {
        const isUnlocked = completedCount >= badge.requirement;
        const div = document.createElement('div');
        div.className = `p-6 rounded shadow-2xl text-center parchment-card transition-all duration-500 ${isUnlocked ? 'badge-unlocked' : 'badge-locked scale-95'}`;
        
        div.innerHTML = `
            <div class="w-20 h-20 mx-auto mb-4 bg-wood rounded-full border-4 border-gold flex items-center justify-center shadow-2xl">
                <span class="material-icons text-5xl ${isUnlocked ? 'text-gold' : 'text-wood/40'}">${badge.icon}</span>
            </div>
            <h4 class="rpg-header font-black text-wood leading-tight mb-2">${badge.name}</h4>
            <p class="text-[10px] font-bold text-wood/60 uppercase tracking-tighter leading-tight">${badge.description}</p>
            ${!isUnlocked ? `<div class="mt-4 text-[10px] font-black text-crimson uppercase tracking-widest">${completedCount} / ${badge.requirement} BOUNTIES</div>` : '<div class="mt-4 text-[10px] font-black text-green-700 tracking-widest uppercase">ARTIFACT RECLAIMED</div>'}
        `;
        grid.appendChild(div);
    });
}

// Logic: Core Actions
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

function deleteTask(index) {
    state.tasks.splice(index, 1);
    saveState();
    renderTasks();
    renderBadges();
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -80px)';
    }, 4000);
}
