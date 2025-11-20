import { exec } from "child_process";
import { promisify } from "util";
import { GitLog } from "../../common/interface";

const execAsync = promisify(exec);

export const getGitLog = async (branchName: string, lines?: number) => {
  if (!branchName) {
    return [];
  }

  const delim = "|";
  const linesArg = lines ? ` -${lines}` : "";
  const { stdout } = await execAsync(
    `git log${linesArg} ${branchName} --pretty=format:"%H${delim}%aI${delim}%al${delim}%f"`,
  );
  const logs = stdout.split("\n");
  return logs.map((log) => {
    const [commitHash, commitDate, commitAuthor, ...commitMessage] =
      log.split(delim);

    return {
      commitHash,
      commitDate,
      commitAuthor,
      commitMessage: commitMessage.join(delim),
    } satisfies GitLog;
  });
};

export const getBranches = async () => {
  const lines = new Set<string>();
  const { stdout } = await execAsync(
    'git for-each-ref --format="%(refname:short)" refs/heads/',
  );

  stdout
    .split("\n")
    .filter((line) => line)
    .forEach((line) => lines.add(line));

  return Array.from(lines);
};
