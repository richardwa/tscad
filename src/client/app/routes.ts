import { div, Router } from "../lib";
import { RayMarcher } from "./views/RayMarcher";

const router = new Router();
router.addRoute("/", () => div("select project").css("margin", "1rem"));
router.addRoute("/raymarch/:file", (params) => RayMarcher(params.file));

export { router };
