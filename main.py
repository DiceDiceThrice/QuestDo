from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from contextlib import asynccontextmanager
import database as db
import os

# Lifespan manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield

app = FastAPI(lifespan=lifespan)

# Data models
class TaskCreate(BaseModel):
    title: str

# API Endpoints
@app.get("/api/stats")
def get_stats():
    xp, level = db.get_player_stats()
    return {"xp": xp, "level": level}

@app.get("/api/tasks")
def get_tasks():
    tasks = db.get_tasks()
    return [{"id": t[0], "title": t[1], "is_completed": bool(t[2])} for t in tasks]

@app.post("/api/tasks")
def create_task(task: TaskCreate):
    if not task.title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    db.add_task(task.title)
    return {"status": "success"}

@app.put("/api/tasks/{task_id}/complete")
def complete_task(task_id: int):
    xp, level = db.complete_task(task_id)
    db.check_badges()
    return {"xp": xp, "level": level}

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    db.delete_task(task_id)
    return {"status": "success"}

@app.get("/api/badges")
def get_badges():
    badges = db.get_badges()
    return [{"id": b[0], "name": b[1], "description": b[2], "is_unlocked": bool(b[3])} for b in badges]

# Serve Static Files using a relative path to THIS file
current_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(current_dir, "static")

app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
