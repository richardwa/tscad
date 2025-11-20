import { render } from "./lib";
import { App } from "./app/main";
import { router } from "./app/routes";

render(document.getElementById("app"), App());
router.navigate("/");
