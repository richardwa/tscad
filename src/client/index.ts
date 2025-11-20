import { render } from "./lib";
import { App } from "./app/App";
import { router } from "./app/routes";
import "@picocss/pico";

render(document.getElementById("app"), App());
router.navigate("/");
