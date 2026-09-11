import express, { Request, Response, Express, NextFunction } from "express";
import { apiPath, type ServerApi } from "../common/interface.ts";
import { readdir } from "fs/promises";

export const configureRoutes = (app: Express) => {
  // @ts-ignore
  app.use(express.json());
  const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  };
  app.use(logger);

  const serverImpl: ServerApi = {
    listProjects: async () => {
      const files = await readdir("./projects");
      return files;
    },
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
