import type { ServerResponse } from "node:http";

export function sendJson(response: ServerResponse, code: number, data: unknown): void {
    response.statusCode = code,
    response.setHeader("Content-Type", "application/json")
    response.end(JSON.stringify(data))
}

export function sendError(response: ServerResponse, code: number, message: string): void {
    sendJson(response, code, {error: message})
}