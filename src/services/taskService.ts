import { loadTasks, saveTasks } from "../repositories/taskRepository.js";
import { Task, TaskStatus } from "../types/types.js";

export async function addTask(title: string): Promise<Task> {
    const tasks = await loadTasks()
    const task: Task = {
        id: crypto.randomUUID(),
        title: title,
        status: "pending"
    } 
    tasks.push(task)
    await saveTasks(tasks)
    return task
}

export async function listTasks():Promise<Task[]> {
    return loadTasks()
}

export async function completeTask(id: string):Promise<Task[]> {
    const tasks = await loadTasks()
    const task = tasks.find(task => task.id == id)
    
    if(task == undefined) throw new Error("Task not found")

    task.status = "completed"
    await saveTasks(tasks)
    return tasks
}

export async function deleteTask(id: string): Promise<void> {
    const tasks = await loadTasks()
    const taskExists = tasks.some(task => task.id === id)
    if(!taskExists) throw new Error("Task not found")

    const remainingTasks = tasks.filter(task => task.id !== id)
    await saveTasks(remainingTasks)
}

export async function filterTask(status: TaskStatus): Promise<Task[]> {
    const tasks = await loadTasks()
    return tasks.filter(task => task.status == status)
}

export async function getTask(id: string): Promise<Task> {
    const tasks = await loadTasks()
    const task = tasks.find(task => task.id == id)
    if (task === undefined) {
        throw new Error("Task not found");
    }
    return task
}

export async function updateTask(id: string, status: TaskStatus): Promise<Task> {
    const tasks = await loadTasks()
    const task = tasks.find(task => task.id == id)
    if (task === undefined) {
        throw new Error("Task not found");
    }
    task.status = status
    saveTasks(tasks)
    return task
}