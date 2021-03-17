#!/usr/bin/env ts-node
/// <reference path="../types.d.ts" />

import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as open from 'open';

const cwd = process.cwd();

const requestListener: http.RequestListener = (req, res) => {
  console.log(req.method, req.url);
  const homePage = fs.readFileSync(path.join(__dirname, '../src/viewer/viewer.html'));
  if (req.url === '/') {
    res.writeHead(200);
    res.end(homePage);
    return;
  }
  const file = path.join(cwd, req.url);
  console.log(file);
  if (fs.existsSync(file)) {
    import(file)
      .then(({ main }) => {
        res.writeHead(200);
        res.end(homePage + main);
      }).catch((err) => {
        res.writeHead(500);
        res.end([file, err].join('\n'));
      });
  } else {
    res.writeHead(404);
    res.end(file + " not found");
  }
};

const server = http.createServer(requestListener);
const port = 1234;
server.listen(port);
const serverUrl = `http://localhost:${port}`;
console.log("open", serverUrl);

process.argv.slice(2)
  .forEach(f => {
    const url = `${serverUrl}/${f}`;
    console.log('open', url);
    open(url);
  });

