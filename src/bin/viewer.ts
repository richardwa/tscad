#!/usr/bin/env ts-node
/// <reference path="../../types.d.ts" />

import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import { getShaderSrc } from '../csg/glsl-util';


const cwd = process.cwd();
const dir = path.join(__dirname, '../viewer');
const homePage = fs.readFileSync(path.join(dir, 'viewer.html'), 'utf8');
let hasChanges = false;
const reset = () => {
  hasChanges = false;
  for (const path in require.cache) {
    if (path.endsWith('.js') || path.endsWith('.ts')) { // only clear *.js, not *.node
      delete require.cache[path]
    }
  }
}
const requestListener: http.RequestListener = (req, res) => {
  if (req.url === '/hasChanges') {
    res.writeHead(200);
    res.end(JSON.stringify(hasChanges));
    return;
  }

  console.log(new Date().toISOString(), req.method, req.url);
  if (req.url === '/') {
    res.writeHead(200);
    res.end(homePage);
    return;
  }

  // local file server -- to serve js bundle
  const dirFile = path.join(dir, req.url);
  if (fs.existsSync(dirFile)) {
    res.writeHead(200);
    res.end(fs.readFileSync(dirFile, 'utf8'));
    return;
  }

  // serve shader src and homepage together
  const cwdFile = path.join(cwd, req.url);
  console.log(cwdFile);
  if (fs.existsSync(cwdFile)) {
    reset();
    import(cwdFile)
      .then(({ main }) => {
        const shaderSrc = getShaderSrc(main.gl);
        const script = `<script>window.shaderSrc = ${JSON.stringify(shaderSrc)};</script>`;
        res.writeHead(200);
        res.end(homePage + script);
      }).catch((err) => {
        res.writeHead(500);
        res.end([cwdFile, err].join('\n'));
      });
  } else {
    res.writeHead(404);
    res.end(cwdFile + " not found");
  }
};

const server = http.createServer(requestListener);
const port = 1234;
server.listen(port);
const serverUrl = `http://localhost:${port}`;
console.log("open", serverUrl);

const watchDir = process.argv.length > 2 ? path.join(cwd, process.argv[2]) : cwd;
console.log('watching', watchDir);
chokidar.watch(watchDir, { ignored: ['node_modules/**/*', '.git/**/*'] }).on('all', (event, path) => {
  console.log(event, path);
  hasChanges = true;
});