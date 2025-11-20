import { fragment, h, vbox, div } from "../../lib";
import { fetchJson } from "../../../common/interface";
import { ClickLink, Header } from "./components";
import { router } from "../routes";

export const ProjectList = () =>
  vbox()
    .css("border-right", "1px solid gray")
    .css("min-height", "100vh")
    .inner(
      div().css("border-bottom", "1px solid gray").inner(Header("Projects").css("text-align", "center")),
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
