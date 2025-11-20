import { fragment, h, vbox, div } from "../../lib";
import { fetchJson } from "../../../common/interface";
import { ClickLink } from "./components";
import { router } from "../routes";

export const ProjectList = () =>
  vbox()
    .css("border", "1px solid gray")
    .css("min-height", "calc(100vh - 2px)")
    .inner(
      div()
        .css("border-bottom", "1px solid gray")
        .css("padding", ".25rem")
        .inner("Projects"),
      vbox()
        .css("padding", ".25rem")
        .do(async (node) => {
          const files = await fetchJson("listProjects");
          node.inner(
            ...files.map((file) =>
              ClickLink(file).on("click", () =>
                router.navigate(`/raymarch/${file}`),
              ),
            ),
          );
        }),
    );
