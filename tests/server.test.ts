import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { server } from "../src/http/server.js";
import { Task } from "../src/types/types.js";

let baseUrl: string;
const TASKS_FILE = "tasks.json";

beforeAll(async() => {
    await new Promise<void>((resolve) => {
        server.listen(0, () => {
            const address = server.address();
            if (address === null || typeof address === "string") {
                throw new Error("Could not determine server address");
            }
            baseUrl = `http://localhost:${address.port}`;
            resolve();
        });
    });
});

afterAll(async() => {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }   
            resolve();
        });
    });
});


describe("Task API", () => {
    // beforeEach( async () => {
    //     await rm(TASKS_FILE, {force: true})
    // })
    // afterEach( async () => {
    //     await rm(TASKS_FILE, {force: true})
    // })
    it("Retrives data from the server", async () => {
        const response = await fetch(`${baseUrl}/tasks`)
        expect(response.status).toBe(200)
        expect(response.headers.get('content-type')).toBe("application/json")
        const body: unknown = await response.json()
        expect(Array.isArray(body)).toBe(true)
    })
    it("posts data into the server", async () => {
        const response = await fetch(`${baseUrl}/tasks`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                title:"Test HTTP API"
            })
        })
        expect(response.status).toBe(201)
        const body: unknown = await response.json()
        expect(body).toEqual(
            expect.objectContaining({
                title: "Test HTTP API",
                status: "pending",
            })
        );
    });
    it("checks the post valiation on the server", async () => {
        const response = await fetch(`${baseUrl}/tasks`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                title:""
            })
        })
        expect(response.status).toBe(400)
        const body: unknown = await response.json()
        expect(body).toEqual(
            expect.objectContaining({
                error: "Title is required"
            })
        );
    });
    it("checks the invalid body json format on the server", async () => {
        const response = await fetch(`${baseUrl}/tasks`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: "{title:"
        })
        expect(response.status).toBe(400)
        const body: unknown = await response.json()
        expect(body).toEqual(
            expect.objectContaining({
                error: "Invalid Json"
            })
        );
    });
    it("returns no route after giving invalid route", async () => {
        const response = await fetch(`${baseUrl}/invalidpath`)
        expect(response.status).toBe(404)
        const body: unknown = await response.json()
        expect(body).toEqual(
            expect.objectContaining({
                error: "Route not found"
            })
        );
    });
    it("returns the task for the inputted id", async () => {
        const createResponse = await fetch(`${baseUrl}/tasks`, {
            method:"POST", 
            headers:{
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                title: "Test Task for retrieval"
            })
        })
        expect(createResponse.status).toEqual(201)
        const createdTask = await createResponse.json() as {
            id: string,
            title: string,
            status: string
        }
        const getResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`)
        expect(await getResponse.json()).toStrictEqual(createdTask)
    })
    it("error for the task with invalid id", async () => {
        const get = await fetch(`${baseUrl}/tasks/invalidid`)
        expect(get.status).toEqual(404)
        
        expect(await get.json()).toStrictEqual({
            error: "Task not found"
        })
    })
    it("updates a task status", async () => {
        const createResponse = await fetch(`${baseUrl}/tasks`, {
            method:"POST", 
            headers:{
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                title: "Test Task for retrieval"
            })
        })
        expect(createResponse.status).toEqual(201)
        const createdTask = await createResponse.json() as {
            id: string,
            title: string,
            status: string
        }
        expect(await createdTask).toStrictEqual({
            id: createdTask.id,
            title: "Test Task for retrieval",
            status: "pending"
        })
        const updateResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`, {
            method:"PATCH", 
            headers:{
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                status: "completed"
            })
        })
        expect(updateResponse.status).toEqual(200)

        expect(await updateResponse.json()).toStrictEqual({
            id: createdTask.id,
            title: createdTask.title,
            status: "completed"
        })
    })
    it("tries update a task with invalid json body", async () => {
        const updateResponse = await fetch(`${baseUrl}/tasks/invalidId`, {
            method:"PATCH", 
            headers:{
                "Content-type": "application/json"
            },
            body: "{status:'pending'"
        })
        expect(updateResponse.status).toEqual(400)

        expect(await updateResponse.json()).toStrictEqual({
            error: "Invalid Json"
        })
    })
    it("tries update an invalid task", async () => {
        const updateResponse = await fetch(`${baseUrl}/tasks/invalidId`, {
            method:"PATCH", 
            headers:{
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                status: "completed"
            })
        })
        expect(updateResponse.status).toEqual(404)

        expect(await updateResponse.json()).toStrictEqual({
            error: "Task not found"
        })
    })
    it("tries update a task with empty/invalid status", async () => {
        const createResponse = await fetch(`${baseUrl}/tasks`, {
            method:"POST", 
            headers:{
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                title: "Test Task for retrieval"
            })
        })
        expect(createResponse.status).toEqual(201)
        const createdTask = await createResponse.json() as {
            id: string,
            title: string,
            status: string
        }
        expect(await createdTask).toStrictEqual({
            id: createdTask.id,
            title: "Test Task for retrieval",
            status: "pending"
        })
        const updateResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`, {
            method:"PATCH", 
            headers:{
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                status: ""
            })
        })
        expect(updateResponse.status).toEqual(400)

        expect(await updateResponse.json()).toStrictEqual({
            error: "Status is required"
        })
    })
    it("filters the tasks", async () => {
        const completedResponse = await fetch(`${baseUrl}/tasks?status=completed`);
        const completedTasks = await completedResponse.json() as Task[]
        expect(completedResponse.status).toEqual(200)
        completedTasks.forEach(task => {
            expect(task.status).toEqual("completed")
        });
        const pendingResponse = await fetch(`${baseUrl}/tasks?status=pending`);
        const pendingTasks = await pendingResponse.json() as Task[]
        expect(pendingResponse.status).toEqual(200)
        pendingTasks.forEach(task => {
            expect(task.status).toEqual("pending")
        });
    })

    it("manages invalid status on filtering", async () => {
        const response = await fetch(`${baseUrl}/tasks?status=invalid`);
        expect(response.status).toEqual(400)
        expect(await response.json()).toEqual({
            error: "Invalid Status"
        })
    })


})