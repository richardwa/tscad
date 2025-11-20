import { hbox, vbox, div, fragment, grid } from "../lib/base-components";
import { Button, ClickLink, NumberInput, TextInput } from "./components";
import { signal, render, RNode } from "../lib";
import { fetchJson, GitLog } from "../../common/interface";
import { formatDate } from "../../common/util";

export const GitDemo = () => {
  const maxLines = signal(5);
  const selectedBranch = signal<string>();

  const title = (s: string) => div(s).css("font-weight", "bold");
  return vbox()
    .css("padding", "1rem")
    .css("gap", "1rem")
    .inner(
      div("log limit: ", NumberInput(maxLines)),
      hbox()
        .css("gap", "1rem")
        .inner(
          title("Branches"),
          fragment().do(async (node) => {
            const branches = await fetchJson("gitBranches");
            selectedBranch.set(branches[0]);
            node.inner(
              ...branches.map((branch) =>
                ClickLink(branch)
                  .on("click", () => selectedBranch.set(branch))
                  .watch(selectedBranch, (node) =>
                    node.css(
                      "font-weight",
                      selectedBranch.get() === branch ? "bold" : "normal",
                    ),
                  ),
              ),
            );
          }),
        ),
      vbox(
        title("Logs: "),
        grid("repeat(4,max-content)")
          .css("column-gap", "1rem")
          .watch([maxLines, selectedBranch], async (node) => {
            const branch = selectedBranch.get();
            if (branch) {
              const logs = await fetchJson("gitLogs", branch, maxLines.get());
              const logRow = (log: GitLog) =>
                fragment(
                  div(log.commitHash.slice(0, 10)),
                  div(formatDate(log.commitDate)),
                  div(log.commitAuthor),
                  div(log.commitMessage),
                );
              node.inner(
                ...logs.map((log) =>
                  node.memo(
                    [selectedBranch.get(), log.commitHash].join(" "),
                    () => logRow(log),
                  ),
                ),
              );
            }
          }),
      ),
    );
};
