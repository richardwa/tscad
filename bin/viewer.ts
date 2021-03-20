#!/usr/bin/env ts-node
/// <reference path="../types.d.ts" />

import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import { getShaderSrc } from '../src/csg/glsl-util';

const cwd = process.argv.length > 2 ? process.argv[2] : process.cwd();
const dir = path.join(__dirname, '../dist/viewer');
const homePage = fs.readFileSync(path.join(dir, 'viewer.html'), 'utf8');

const requestListener: http.RequestListener = (req, res) => {
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

