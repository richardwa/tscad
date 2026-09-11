import { div, Router } from "solid-vanilla";
import { RayMarcher } from "./views/RayMarcher";

const router = new Router(div());
router.addRoute("/", () => div().css("margin", "1rem").inner("select project"));
router.addRoute("/raymarch/:file", (params) => RayMarcher(params.file));

export { router };
