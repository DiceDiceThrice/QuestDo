// Advanced State Management
let state = JSON.parse(localStorage.getItem('questDoState')) || {
    xp: 0,
    level: 1,
    tasks: [],
    badges: [
        { id: 1, name: "First Blood", description: "Complete your first quest!", requirement: 1, icon: "flare" },
        { id: 2, name: "Novice Adventurer", description: "Complete 5 quests.", requirement: 5, icon: "explore" },
        { id: 3, name: "Quest Master", description: "Complete 10 quests.", requirement: 10, icon: "workspace_premium" },
        { id: 4, name: "Legendary Hero", description: "Complete 25 quests.", requirement: 25, icon: "auto_fix_high" }
    ]
};

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

// UI: Tab Switching with Animation
function switchTab(tab) {
    const questsSection = document.getElementById('quests-section');
    const trophySection = document.getElementById('trophy-section');
    const tabQuests = document.getElementById('tab-quests');
    const tabTrophy = document.getElementById('tab-trophy');

    if (tab === 'quests') {
        questsSection.classList.remove('hidden');
        trophySection.classList.add('hidden');
        
        tabQuests.classList.add('bg-indigo-600', 'text-white', 'shadow-lg');
        tabQuests.classList.remove('text-slate-400');
        
        tabTrophy.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg');
        tabTrophy.classList.add('text-slate-400');
    } else {
        questsSection.classList.add('hidden');
        trophySection.classList.remove('hidden');
        
        tabTrophy.classList.add('bg-indigo-600', 'text-white', 'shadow-lg');
        tabTrophy.classList.remove('text-slate-400');
        
        tabQuests.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg');
        tabQuests.classList.add('text-slate-400');
        renderBadges();
    }
}

// UI: Dynamic Stats
function renderStats() {
    document.getElementById('level-text').innerText = `Level ${state.level}`;
    const xpPercent = state.xp % 100;
    document.getElementById('xp-fill').style.width = `${xpPercent}%`;
    document.getElementById('xp-text').innerText = `${xpPercent} / 100 XP`;
}

// UI: Task List
function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    
    if (state.tasks.length === 0) {
        list.innerHTML = `
            <div class="text-center py-10 opacity-40">
                <span class="material-icons text-5xl mb-2">auto_stories</span>
                <p>No active quests. Time to start your journey!</p>
            </div>
        `;
        return;
    }

    state.tasks.forEach((task, index) => {
        const li = document.createElement('div');
        li.className = `quest-card group flex items-center gap-4 glass p-4 rounded-2xl ${task.is_completed ? 'opacity-60' : ''}`;
        
        li.innerHTML = `
            <div class="relative flex items-center justify-center">
                <input type="checkbox" ${task.is_completed ? 'checked disabled' : ''} 
                       onchange="completeTask(${index})" 
                       class="w-6 h-6 rounded-lg border-2 border-slate-600 bg-slate-800 checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer appearance-none">
                ${task.is_completed ? '<span class="material-icons absolute text-white text-xs pointer-events-none">done</span>' : ''}
            </div>
            <span class="flex-1 font-semibold ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-200'}">${task.title}</span>
            <button onclick="deleteTask(${index})" class="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all">
                <span class="material-icons">delete</span>
            </button>
        `;
        list.appendChild(li);
    });
}

// UI: Trophy Grid
function renderBadges() {
    const grid = document.getElementById('badge-grid');
    grid.innerHTML = '';
    
    const completedCount = state.tasks.filter(t => t.is_completed).length;

    state.badges.forEach(badge => {
        const isUnlocked = completedCount >= badge.requirement;
        const div = document.createElement('div');
        div.className = `badge-card p-6 rounded-3xl text-center glass transition-all duration-500 ${isUnlocked ? 'badge-unlocked scale-100' : 'badge-locked scale-95'}`;
        
        div.innerHTML = `
            <div class="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-2xl flex items-center justify-center">
                <span class="material-icons text-4xl ${isUnlocked ? 'text-amber-400' : 'text-slate-600'}">${badge.icon}</span>
            </div>
            <h4 class="font-bold text-sm mb-1">${badge.name}</h4>
            <p class="text-[10px] text-slate-400 leading-tight uppercase tracking-wider">${badge.description}</p>
            ${!isUnlocked ? `<div class="mt-3 text-[10px] font-bold text-indigo-400">${completedCount}/${badge.requirement} COMPLETED</div>` : ''}
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
    
    const oldLevel = state.level;
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
        toast.style.transform = 'translate(-50%, 40px)';
    }, 3000);
}
