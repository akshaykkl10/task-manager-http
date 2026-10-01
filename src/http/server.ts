import { createServer, IncomingMessage } from "node:http";
import { sendError, sendJson } from "./response.js";
import { addTask, updateTask, getTask, listTasks, deleteTask, filterTask } from "../services/taskService.js";
import { Task, TaskStatus } from "../types/types.js";
import { stat } from "node:fs";

async function readJson(req: IncomingMessage ): Promise<unknown> {
    const chunks: Buffer[] = []
    for await (const chunk of req){
        chunks.push(Buffer.from(chunk));
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf-8"))
    return body
}

function isValidCreateTaskBody(body: unknown): body is {title: string}{
    if(body == null || typeof body !== "object") return false;
    if(!("title" in body)) return false;

    return typeof body.title === "string" && body.title.trim().length > 0;
}
function isValidUpdateTaskBody(body: unknown): body is {status: "pending" | "completed"}{
    if(body == null || typeof body !== "object") return false;
    if(!("status" in body)) return false;
    return body.status === "pending" || body.status === "completed";
}

function isValidFilter(status: string): status is TaskStatus{
    return status === "pending" || status === "completed"
}

export const server = createServer(async (req, res) => {
    const method = req.method
    const url = new URL(req.url ?? "/", "http://localhost");

    if (method == "GET" && url.pathname == "/tasks") {
        try {
            const status = url.searchParams.get("status")
            if(status !== null) {
                if(isValidFilter(status)) {
                    const tasks = await filterTask(status)
                    sendJson(res, 200, tasks) 
                    return
                }
                throw new Error("Invalid Status")
            }        
            const tasks: Task[] = await listTasks()
            sendJson(res, 200, tasks) 
            return
            
        } catch (error) {
            if(error instanceof Error && error.message == "Invalid Status") {
                    sendError(res, 400, "Invalid Status")
                    return
            }
            throw error;
        }
        return
    } 
    if (method == "POST" && url.pathname == "/tasks") {
        try {
            const body = await readJson(req)
            if(!isValidCreateTaskBody(body)) {
                sendError(res, 400, "Title is required");
                return;
            }
            const task = await addTask(body.title.trim());
            sendJson(res, 201, task);
        } catch (error: unknown) {
            if( error instanceof SyntaxError){
                sendError(res, 400, "Invalid Json");
                return
            }
            throw error;
        }
        return
    }
    const taskPath = url.pathname.match(/^\/tasks\/([^/]+)$/)
    if (taskPath !== null) {
        const taskId = taskPath[1]
        if(method === "GET") {
            try {
                const task = await getTask(taskId)
                sendJson(res, 200, task);
            } catch (error: unknown) {
                if(error instanceof Error && error.message == "Task not found") {
                    sendError(res, 404, "Task not found")
                    return
                }
                throw error;
            }
            return;
        }
        if(method == "PATCH") {
            try {
                const body = await readJson(req)
                if(!isValidUpdateTaskBody(body)) {
                    sendError(res, 400, "Status is required");
                    return;
                }
                const tasks = await updateTask(taskId, body.status)
                sendJson(res, 200, tasks);
                
            } catch (error: unknown) {
                if( error instanceof SyntaxError){
                    sendError(res, 400, "Invalid Json");
                    return
                }
                if(error instanceof Error && error.message == "Task not found") {
                    sendError(res, 404, "Task not found")
                    return
                }
                throw error;
            }
            return;
        }
        if(method == "DELETE") {
            try {
                await deleteTask(taskId)
                res.statusCode = 204;
                res.end();
                
            } catch (error: unknown) {
                if(error instanceof Error && error.message == "Task not found") {
                    sendError(res, 404, "Task not found")
                    return
                }
                throw error;
            }
            return
        }
    }
    sendError(res, 404, "Route not found")
})


