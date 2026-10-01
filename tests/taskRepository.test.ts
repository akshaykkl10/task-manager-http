import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { loadTasks, saveFilteredTasks, saveTasks } from "../src/repositories/taskRepository.js";
import type { Task } from "../src/types/types.js";
import { readFile, rm, writeFile } from "node:fs/promises";

const TASKS_FILE = "tasks.json";
const FILTERED_FILE = "pendingTasks.json";



describe("Task Respository", () => {
    const task: Task = {
        id: "task-1",
        title: "Learn tests",
        status: "pending",
    }
    beforeEach(async () => {
        await rm(TASKS_FILE, {force: true})
        await rm(FILTERED_FILE, {force: true})
    })
    afterEach(async () => {
        await rm(TASKS_FILE, { force: true });
        await rm(FILTERED_FILE, { force: true });
    });
    describe("load tasks", () => {

        it("loads task from json", async() => {
            await writeFile(TASKS_FILE, JSON.stringify([task]), "utf-8")
            const tasks = await loadTasks()
            expect(tasks).toStrictEqual([task])
        })
        it("returns empty list on no file", async() => {
            const tasks = await loadTasks()
            expect(tasks).toStrictEqual([])
        })
        it("throws an error when the JSON is malformed", async () => {
            await writeFile(TASKS_FILE,"{ invalid json","utf-8");
            
            await expect(loadTasks()).rejects.toThrow();
        });
        it("throws an error when the JSON is not an array", async () => {
            await writeFile(
                TASKS_FILE,
                JSON.stringify({
                    id: "task-1",
                    title: "Learn tests",
                    status: "pending",
                }),
                "utf-8",
            );
    
            await expect(loadTasks()).rejects.toThrow("Tasks must be an array.");
        })
    });
    describe("save tasks", ()=> {
        it("saves task to json", async () => {
            await saveTasks([task])
            const fileContent = await readFile(TASKS_FILE, "utf-8")
            expect(JSON.parse(fileContent)).toStrictEqual([task])
        })
    })
    describe("save filtered tasks", ()=> {
        it("saves filtered task to json", async () => {
            await saveFilteredTasks([task], FILTERED_FILE)
            const fileContent = await readFile(FILTERED_FILE, "utf-8")
            expect(JSON.parse(fileContent)).toStrictEqual([task])
        })
        it("does not modify tasks.json", async () => {
            await saveFilteredTasks([task], FILTERED_FILE);

            await expect(readFile(TASKS_FILE, "utf-8")).rejects.toThrow();
        });
    })
    
})
