import sqlite3
import os

DB_NAME = "questdo.db"

def get_db_path():
    return os.path.join(os.path.dirname(__file__), DB_NAME)

def init_db():
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            is_completed INTEGER DEFAULT 0
        )
    ''')

    # Player stats table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS player (
            id INTEGER PRIMARY KEY,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1
        )
    ''')

    # Badges table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            is_unlocked INTEGER DEFAULT 0,
            requirement_tasks INTEGER
        )
    ''')

    # Ensure player exists
    cursor.execute('SELECT COUNT(*) FROM player')
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO player (id, xp, level) VALUES (1, 0, 1)')

    # Default Badges
    cursor.execute('SELECT COUNT(*) FROM badges')
    if cursor.fetchone()[0] == 0:
        badges = [
            ("First Blood", "Complete your first quest!", 0, 1),
            ("Novice Adventurer", "Complete 5 quests.", 0, 5),
            ("Quest Master", "Complete 10 quests.", 0, 10),
            ("Legendary Hero", "Complete 25 quests.", 0, 25)
        ]
        cursor.executemany('INSERT INTO badges (name, description, is_unlocked, requirement_tasks) VALUES (?, ?, ?, ?)', badges)

    conn.commit()
    conn.close()

# Task functions
def add_task(title):
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute('INSERT INTO tasks (title) VALUES (?)', (title,))
    conn.commit()
    conn.close()

def get_tasks():
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks')
    tasks = cursor.fetchall()
    conn.close()
    return tasks

def complete_task(task_id):
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute('UPDATE tasks SET is_completed = 1 WHERE id = ?', (task_id,))
    
    # Award XP
    cursor.execute('UPDATE player SET xp = xp + 10 WHERE id = 1')
    
    # Check for level up (100 XP per level)
    cursor.execute('SELECT xp FROM player WHERE id = 1')
    xp = cursor.fetchone()[0]
    new_level = (xp // 100) + 1
    cursor.execute('UPDATE player SET level = ? WHERE id = 1', (new_level,))
    
    conn.commit()
    conn.close()
    return xp, new_level

def delete_task(task_id):
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()

# Player functions
def get_player_stats():
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute('SELECT xp, level FROM player WHERE id = 1')
    stats = cursor.fetchone()
    conn.close()
    return stats

# Badge functions
def get_badges():
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM badges')
    badges = cursor.fetchall()
    conn.close()
    return badges

def check_badges():
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    
    # Get total completed tasks
    cursor.execute('SELECT COUNT(*) FROM tasks WHERE is_completed = 1')
    completed_count = cursor.fetchone()[0]
    
    # Unlock badges that meet requirements
    cursor.execute('UPDATE badges SET is_unlocked = 1 WHERE requirement_tasks <= ? AND is_unlocked = 0', (completed_count,))
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
