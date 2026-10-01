import { readFile, writeFile } from "node:fs/promises";
import { Task } from "../types/types.js";

const TASKS_FILE = 'tasks.json'

export async function loadTasks(): Promise<Task[]> {
    try {
        const data = await readFile(TASKS_FILE, "utf-8");
        const tasks: unknown = JSON.parse(data)

        if(!Array.isArray(tasks)) throw new Error("Tasks must be an array.")
        return tasks as Task[]
    } catch (error: unknown) {
        if(isFileNotFoundError(error)) return []
        throw error
    }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
    const data = JSON.stringify(tasks, null, 2)
    await writeFile(TASKS_FILE, data, "utf-8")
}

export async function saveFilteredTasks(tasks: Task[], name: string): Promise<void> {
    const data = JSON.stringify(tasks, null, 2)
    await writeFile(name, data, "utf-8")
}


function isFileNotFoundError(error: unknown){
    return (
        error instanceof Error &&
        "code" in error &&
        error.code =="ENOENT"
    )
}