
"""
Schedule command handler for EirosShell
"""

import logging
import time
from typing import Dict, Any, Optional

logger = logging.getLogger("EirosShell")

# Store for scheduled tasks
_scheduled_tasks = {}

class ScheduledTask:
    """Represents a scheduled task in EirosShell"""
    
    def __init__(self, task_id, command, interval, active=True, name=None):
        self.id = task_id
        self.command = command  # The command to execute (string or command dict)
        self.interval = interval  # Interval in seconds
        self.active = active
        self.name = name or f"Task-{task_id}"
        self.last_run = None
        self.next_run = time.time() + interval
        self.error_count = 0
        self.max_retries = 3
        self.cooldown = interval  # Default cooldown is same as interval
    
    def to_dict(self):
        """Convert to dictionary for storage/serialization"""
        return {
            "id": self.id,
            "command": self.command,
            "interval": self.interval,
            "active": self.active,
            "name": self.name,
            "last_run": self.last_run,
            "next_run": self.next_run,
            "error_count": self.error_count,
            "max_retries": self.max_retries,
            "cooldown": self.cooldown
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create a ScheduledTask from a dictionary"""
        task = cls(
            data["id"],
            data["command"],
            data["interval"],
            data.get("active", True),
            data.get("name")
        )
        task.last_run = data.get("last_run")
        task.next_run = data.get("next_run", time.time() + task.interval)
        task.error_count = data.get("error_count", 0)
        task.max_retries = data.get("max_retries", 3)
        task.cooldown = data.get("cooldown", task.interval)
        return task

async def handle_schedule_command(params: Dict[str, Any], command_id: str) -> Dict[str, Any]:
    """
    Handle scheduling a command
    Example: /schedule#cmd1{ "command": "/click#btn1{ selector: '.submit' }", "interval": 60, "name": "Click Submit" }
    """
    try:
        # Get parameters
        command_str = params.get("command")
        interval = int(params.get("interval", 60))  # Default to 60 seconds
        name = params.get("name")
        active = params.get("active", True)
        
        if not command_str:
            return {
                "command_id": command_id,
                "type": "schedule",
                "status": "error",
                "message": "Missing command parameter",
                "formatted_message": f"[оболочка]: Планирование #{command_id} — ОШИБКА: команда не указана. #log_{command_id}"
            }
        
        # Create task ID
        task_id = f"task_{int(time.time())}_{command_id}"
        
        # Create scheduled task
        task = ScheduledTask(task_id, command_str, interval, active, name)
        
        # Store task
        _scheduled_tasks[task_id] = task
        
        logger.info(f"Scheduled task {task_id}: '{name}' with interval {interval}s")
        
        return {
            "command_id": command_id,
            "type": "schedule",
            "status": "success",
            "message": f"Task '{name or task_id}' scheduled successfully",
            "task_id": task_id,
            "task": task.to_dict(),
            "formatted_message": f"[оболочка]: Задача #{task_id}: '{name or task_id}' запланирована каждые {interval}с — OK. #log_{command_id}"
        }
    except Exception as e:
        logger.error(f"Error scheduling task: {str(e)}")
        return {
            "command_id": command_id,
            "type": "schedule",
            "status": "error",
            "message": f"Error scheduling task: {str(e)}",
            "formatted_message": f"[оболочка]: Планирование задачи — ОШИБКА: {str(e)}. #log_{command_id}"
        }

def get_all_tasks() -> Dict[str, Dict[str, Any]]:
    """
    Get all scheduled tasks as dictionaries
    """
    return {task_id: task.to_dict() for task_id, task in _scheduled_tasks.items()}

def get_task(task_id: str) -> Optional[ScheduledTask]:
    """
    Get a task by ID
    """
    return _scheduled_tasks.get(task_id)

def remove_task(task_id: str) -> bool:
    """
    Remove a scheduled task
    """
    if task_id in _scheduled_tasks:
        del _scheduled_tasks[task_id]
        return True
    return False

def toggle_task_active(task_id: str) -> bool:
    """
    Toggle a task's active status
    """
    if task_id in _scheduled_tasks:
        task = _scheduled_tasks[task_id]
        task.active = not task.active
        return True
    return False

def clear_all_tasks() -> None:
    """
    Clear all scheduled tasks
    """
    _scheduled_tasks.clear()

def update_task_after_run(task_id: str, success: bool) -> None:
    """
    Update a task's metadata after execution
    """
    if task_id in _scheduled_tasks:
        task = _scheduled_tasks[task_id]
        task.last_run = time.time()
        task.next_run = time.time() + task.interval
        
        if not success:
            task.error_count += 1
            # If error count exceeds max retries, increase cooldown
            if task.error_count >= task.max_retries:
                task.cooldown *= 2  # Exponential backoff
                task.next_run = time.time() + task.cooldown
                logger.warning(f"Task {task_id} failed {task.error_count} times, cooldown increased to {task.cooldown}s")
        else:
            # Reset error count and cooldown on success
            task.error_count = 0
            task.cooldown = task.interval
