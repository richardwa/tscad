import { div, h, grid } from "../lib";

import { router } from "./routes";
import { ProjectList } from "./views/ProjectList";

export const App = () =>
  h("main")
    .cn("container")
    .inner(
      grid("auto 1fr")
        .css("gap", ".25rem")
        .inner(ProjectList(), router.getRoot()),
    );
