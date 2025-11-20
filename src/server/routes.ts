import express, { Request, Response, Server, NextFunction } from "express";
import { apiPath, type ServerApi } from "../common/interface";
import { getGitLog, getBranches } from "./resources/git";

export const configureRoutes = (app: Server) => {
  // @ts-ignore
  app.use(express.json());
  const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  };
  app.use(logger);

  const serverImpl: ServerApi = {
    gitBranches: getBranches,
    gitLogs: getGitLog,
  };
  const routes = express.Router();
  Object.entries(serverImpl).forEach(([key, fn]) => {
    routes.post(`/${key}`, async (req: Request, res: Response) => {
      // @ts-ignore
      const reqParams = req.body ?? [];
      // @ts-ignore
      const result = await fn(...reqParams);
      res.json(result);
    });
  });
  // Serve API
  app.use(apiPath, routes);
};
