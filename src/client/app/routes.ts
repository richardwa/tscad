import { Router } from "../lib";
import { GitDemo } from "./gitdemo";

const router = new Router();

router.addRoute("/", () => GitDemo());

export { router };
