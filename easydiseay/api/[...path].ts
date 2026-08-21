import serverModule from "./server.cjs";
import type { Request, Response } from "express";

const app = typeof serverModule === "function" ? serverModule : serverModule.default;

export default function handler(req: Request, res: Response) {
	return app(req, res);
}