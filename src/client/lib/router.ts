import { RNode, h } from "./rnode";

type Route = {
  path: string;
  component: (params: Record<string, string>) => RNode;
};

export class Router {
  private routes: Route[] = [];
  private readonly root: RNode;

  constructor() {
    this.root = h("div");
    window.addEventListener("popstate", () => this.render());
  }

  getRoot() {
    this.render();
    return this.root;
  }

  addRoute(path: string, component: (params: Record<string, string>) => RNode) {
    this.routes.push({ path, component });
  }

  navigate(path: string) {
    history.pushState({}, "", path);
    this.render();
  }

  private matchRoute(
    pathname: string,
  ): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      const paramNames: string[] = [];
      const regexPath = route.path.replace(/:([^/]+)/g, (_, key) => {
        paramNames.push(key);
        return "([^/]+)";
      });

      const regex = new RegExp(`^${regexPath}$`);
      const match = pathname.match(regex);

      if (match) {
        const params: Record<string, string> = {};
        paramNames.forEach((name, i) => (params[name] = match[i + 1]));
        return { route, params };
      }
    }
    return null;
  }

  private render() {
    const currentPath = window.location.pathname;
    const match = this.matchRoute(currentPath);
    this.root.inner();
    if (match) {
      const node = match.route.component(match.params);
      this.root.inner(node);
    } else {
      this.root.inner("Page Not Found");
    }
  }
}
