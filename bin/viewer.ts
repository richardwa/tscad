#!/usr/bin/env ts-node
/// <reference path="../types.d.ts" />

import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as open from 'open';

const cwd = process.cwd();
const dir = path.join(__dirname, '../dist/viewer');
const homePage = fs.readFileSync(path.join(dir, 'viewer.html'));

const requestListener: http.RequestListener = (req, res) => {
  console.log(new Date().toISOString(), req.method, req.url);
  if (req.url === '/') {
    res.writeHead(200);
    res.end(homePage);
    return;
  }
  // local file wrt this file
  const dirFile = path.join(dir, req.url);
  if (fs.existsSync(dirFile)) {
    res.writeHead(200);
    res.end(fs.readFileSync(dirFile, 'utf8'));
    return;
  }

  const cwdFile = path.join(cwd, req.url);
  console.log(cwdFile);
  if (fs.existsSync(cwdFile)) {
    import(cwdFile)
      .then(({ main }) => {
        res.writeHead(200);
        res.end(homePage + main);
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

process.argv.slice(2)
  .forEach(f => {
    const url = `${serverUrl}/${f}`;
    console.log('open', url);
    open(url);
  });

