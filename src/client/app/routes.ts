import { Router } from "../lib";
import { Home } from "./views/Home";
import { RayMarcher } from "./views/RayMarcher";

const router = new Router();

router.addRoute("/", () => Home());
router.addRoute("/raymarch/:file", (params) => RayMarcher(params.file));

export { router };
