import { render } from "./lib";
import { App } from "./app/App";
import { router } from "./app/routes";

render(document.getElementById("app"), App());
router.navigate("/");
