#!/usr/bin/env ts-node
/// <reference path="../../types.d.ts" />

import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import { connection, server as WebSocketServer } from 'websocket';
import { getShaderSrc } from '../csg/glsl-util';


const cwd = process.cwd();
const dir = path.join(__dirname, '../viewer');
const homePage = fs.readFileSync(path.join(dir, 'viewer.html'), 'utf8');
const cache: Map<string, string> = new Map();
const reset = () => {
  for (const path in require.cache) {
    if (path.endsWith('.js') || path.endsWith('.ts')) { // only clear *.js, not *.node
      delete require.cache[path]
    }
  }
}
const requestListener: http.RequestListener = (req, res) => {

  console.log(new Date().toISOString(), req.method, req.url);
  if (req.url === '/') {
    res.writeHead(200);
    res.end(homePage);
    return;
  }

  // local file server -- to serve js bundle
  const dirFile = path.join(dir, req.url);
  if (cache.has(dirFile)) {
    res.writeHead(200);
    res.end(cache.get(dirFile));
    return;
  } else if (fs.existsSync(dirFile)) {
    const contents = fs.readFileSync(dirFile, 'utf8');
    cache.set(dirFile, contents);
    res.writeHead(200);
    res.end(contents);
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
    return;
  } else {
    res.writeHead(404);
    res.end(cwdFile + " not found");
    return;
  }
};

const server = http.createServer(requestListener);
const port = 1234;
server.listen(port);
const serverUrl = `http://localhost:${port}`;
console.log("open", serverUrl);


// socket server for auto reload
const wsServer = new WebSocketServer({
  httpServer: server
});

const clients: Set<connection> = new Set();
wsServer.on('request', function (request) {
  const connection = request.accept(null, request.origin);
  console.log('connection accepted', request.origin);
  clients.add(connection);

  connection.on('message', function (message) {
    console.log('Received Message:', message.utf8Data);
    connection.sendUTF('Hi this is WebSocket server!');
  });
  connection.on('close', function (reasonCode, description) {
    console.log('Client has disconnected.');
    clients.delete(connection);
  });
  connection.on('error', (e) => {
    console.log(e);
  });

});

const watchDir = process.argv.length > 2 ? path.join(cwd, process.argv[2]) : cwd;
console.log('watching', watchDir);
chokidar.watch(watchDir, { ignored: ['node_modules/', '.*/'] }).on('change', (path) => {
  console.log(path);
  try {
    clients.forEach(c => c.sendUTF("reload", e => console.log(e)));
  } catch (e) {
    console.log(e);
  }
});