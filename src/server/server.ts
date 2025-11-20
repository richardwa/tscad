import express, { Request, Response } from "express";
import path from "path";
import { configureRoutes } from "./routes";
import { apiPath } from "../common/interface";

const app = express();
const PORT = process.env.PORT || 3000;

configureRoutes(app);

// Serve frontend from built Vite dist
const distPath = path.resolve(__dirname, "../../dist");
app.use(express.static(distPath));

// SPA fallback
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
