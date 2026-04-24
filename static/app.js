// Advanced State Management
const DEFAULT_BADGES = [
    { id: 1, name: "The Squire's Start", description: "Earned a basic tunic.", requirement: 1, 
      sprite: '<svg viewBox="0 0 24 24" fill="%238B4513"><path d="M12,2L4,5v11c0,5.55,3.84,10.74,8,12c4.16-1.26,8-6.45,8-12V5L12,2z M12,21c-3.11-1.24-5-4.83-5-8.5V7.2l5-1.88l5,1.88V12.5c0,3.67-1.89,7.26-5,8.5z"/></svg>' },
    
    { id: 2, name: "Light Skirmisher", description: "Secured a leather chestpiece.", requirement: 5, 
      sprite: '<svg viewBox="0 0 24 24" fill="%23cd7f32"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>' },
    
    { id: 3, name: "Rugged Vanguard", description: "Constructed iron-plate mail.", requirement: 10, 
      sprite: '<svg viewBox="0 0 24 24" fill="%23708090"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>' },
    
    { id: 4, name: "Radiant Sentinel", description: "Adorned in shining steel.", requirement: 15, 
      sprite: '<svg viewBox="0 0 24 24" fill="%23B0C4DE"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>' },
    
    { id: 5, name: "Immortal Paladin", description: "The legendary heavy aegis.", requirement: 25, 
      sprite: '<svg viewBox="0 0 24 24" fill="%23d4af37"><path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2M12,14.5L7.5,18.4L12,4.3L16.5,18.4L12,14.5Z"/></svg>' }
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
        renderBadges();
    }
}

function renderStats() {
    document.getElementById('level-text').innerText = `Rank ${state.level}`;
    const xpPercent = state.xp % 100;
    document.getElementById('xp-fill').style.width = `${xpPercent}%`;
    document.getElementById('xp-text').innerText = `${xpPercent} / 100`;
}

function renderTasks() {
    const list = document.getElementById('task-list');
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
    container.innerHTML = '';

    const completedCount = state.tasks.filter(t => t.is_completed).length;
    
    // Default Trainee Sprite (Leather brown)
    let currentHeroSprite = '<svg viewBox="0 0 24 24" fill="%238B4513"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H7V9H1v2h2v11h18V11h2V9z"/></svg>';
    let knightPos = { bottom: 40, left: 10 };

    state.badges.forEach((badge, index) => {
        const isUnlocked = completedCount >= badge.requirement;
        const bottom = 120 + (index * 130);
        const left = (index % 2 === 0) ? 70 : 20;

        if (isUnlocked) {
            knightPos = { bottom: bottom + 20, left: left };
            currentHeroSprite = badge.sprite; // Update hero sprite to latest unlocked
        }

        const node = document.createElement('div');
        node.className = `milestone-node ${isUnlocked ? 'unlocked' : 'locked'}`;
        node.style.bottom = `${bottom}px`;
        node.style.left = `${left}%`;
        
        node.innerHTML = `
            <div class="flag-pole">
                <div class="flag-cloth"></div>
            </div>
            <div class="node-info">
                <h4 class="font-black uppercase">${badge.name}</h4>
                <p>${isUnlocked ? 'CONQUERED' : badge.requirement + ' QUESTS'}</p>
            </div>
        `;
        container.appendChild(node);
    });

    // Update Knight Graphic
    const knight = document.getElementById('knight');
    knight.style.bottom = `${knightPos.bottom}px`;
    knight.style.left = `${knightPos.left}%`;
    
    const knightGraphic = knight.querySelector('.knight-graphic');
    knightGraphic.style.backgroundImage = `url('data:image/svg+xml;utf8,${currentHeroSprite}')`;
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
