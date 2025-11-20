import { div, h } from "../lib";
import { NavLink } from "./util/components";

import { router } from "./routes";

export const App = () =>
  h("main")
    .cn("container")
    .inner(
      h("header").inner(
        div()
          .cn("wrapper")
          .inner(
            h("nav").inner(h("ul").inner(h("li").inner(NavLink("/", "Home")))),
          ),
        router.getRoot(),
      ),
    );
