export const apiPath = "/api";

export type GitLog = {
  commitHash: string;
  commitDate: string;
  commitAuthor: string;
  commitMessage: string;
};

export type ServerApi = {
  gitBranches: () => Promise<string[]>;
  gitLogs: (branch: string, lines?: number) => Promise<GitLog[]>;
};

export const fetchJson = <T extends keyof ServerApi>(
  key: T,
  ...params: Parameters<ServerApi[T]>
) =>
  fetch(`${apiPath}/${key}`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json()) as ReturnType<ServerApi[T]>;
