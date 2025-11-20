# Solid Vanilla JS
example of react-like (more so solidjs-like) framework.  Great for understanding how these frameworks under the hood.  like solidjs I explored to make dom maniuplation more stream lined, without resorting to a virtual dom.  the entire library is about 200 lines (see 'src/client/lib') - so easily comprehendable by any interested dev.

## Features

### dom representation using functions
this is similar to what jsx compiles to.  I can add jsx support, but there are use cases where the plain function calls actually work better.
```ts
vbox()
    .inner(
        div("test 1"), 
        div("test 2"));
```

### async updates
```ts
vbox().do(async (node) => {
    const branches = await fetch("/branches");
    node.inner(
        ...branches.map((branch) => div(branch))
    );
}),
```

### signals / reactivity / watch
```ts
const count = signal(0);
div().watch(count, (node) => node.inner(count.get().toString()));
setInterval(()=> {
    count.set(count.get()+1);
}, 5000);
```

### memoized components
```ts
 grid("repeat(4,max-content)")
    .watch([maxLines, selectedBranch], async (node) => {
        const branch = selectedBranch.get();
        const logs = await fetchJson("gitLogs", branch, maxLines.get());
        ...
        node.inner(
            ...logs.map((log) =>
                // memo data is tied to the node (here it is grid/parent)
                node.memo(
                    // define our unique key
                    [branch, log.commitHash].join(" "), 
                    // since we get back the similar data on subsequent calls, 
                    // we only generate a logrow if it has a new commithash
                    () => logRow(log),
                ),
            ),
        );
    }),
```

### inline css
I do use tailwind, and i even like it.  but i do feel it is too complicated (build plugins + ide plugins)for what you get.  granted the usage of it is pretty good once you get the initial setup.  However i do feel plain inline css is 80% there
```ts
vbox()
    .css("padding", "1rem")
    .css("gap", "1rem")
```

### SPA Routing

```ts
// define routes
const router = new Router();
router.addRoute("/", () => GitDemo());

// use routes
router.navigate("/");

// add router view into dom
export const App = () => div(div("Title"), router.getRoot());

```

### Client-Server bindings
just add to interface, and implement server side.  client shares types using fetchJson
```ts
// interface
export type ServerApi = {
  gitBranches: () => Promise<string[]>;
  gitLogs: (branch: string, lines?: number) => Promise<GitLog[]>;
};

// server
const serverImpl: ServerApi = {
    gitBranches: () => ...,
    gitLogs: () => ...,
};

// client
import { fetchJson } from "../common/interface";
const logs = await fetchJson("gitLogs", branch, maxLines.get()); // input and return are typed!

```