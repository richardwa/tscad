import { h } from "../../lib";
import { fetchJson } from "../../../common/interface";
import { ClickLink } from "../util/components";
import { router } from "../routes";
export const Home = () =>
  h("main")
    .cn("grid")
    .do(async (node) => {
      const files = await fetchJson("listProjects");
      node.inner(
        ...files.map((file) =>
          ClickLink(file).on("click", () =>
            router.navigate(`/raymarch/${file}`),
          ),
        ),
      );
    });
