#!/usr/bin/env ts-node
"use strict";
/// <reference path="../types.d.ts" />
exports.__esModule = true;
var http = require("http");
var path = require("path");
var fs = require("fs");
var open = require("open");
var glsl_util_1 = require("../src/csg/glsl-util");
var cwd = process.argv.length > 2 ? process.argv[2] : process.cwd();
var dir = path.join(__dirname, '../dist/viewer');
var homePage = fs.readFileSync(path.join(dir, 'viewer.html'), 'utf8');
var requestListener = function (req, res) {
    console.log(new Date().toISOString(), req.method, req.url);
    if (req.url === '/') {
        res.writeHead(200);
        res.end(homePage);
        return;
    }
    // local file server -- to serve js bundle
    var dirFile = path.join(dir, req.url);
    if (fs.existsSync(dirFile)) {
        res.writeHead(200);
        res.end(fs.readFileSync(dirFile, 'utf8'));
        return;
    }
    // serve shader src and homepage together
    var cwdFile = path.join(cwd, req.url);
    console.log(cwdFile);
    if (fs.existsSync(cwdFile)) {
        Promise.resolve().then(function () { return require(cwdFile); }).then(function (_a) {
            var main = _a.main;
            console.log(main);
            var shaderSrc = glsl_util_1.getShaderSrc(main.gl);
            var script = "<script>window.shaderSrc = " + JSON.stringify(shaderSrc) + ";</script>";
            res.writeHead(200);
            res.end(homePage + script);
        })["catch"](function (err) {
            res.writeHead(500);
            res.end([cwdFile, err].join('\n'));
        });
    }
    else {
        res.writeHead(404);
        res.end(cwdFile + " not found");
    }
};
var server = http.createServer(requestListener);
var port = 1234;
server.listen(port);
var serverUrl = "http://localhost:" + port;
console.log("open", serverUrl);
process.argv.slice(2)
    .forEach(function (f) {
    var url = serverUrl + "/" + f;
    console.log('open', url);
    open(url);
});
//# sourceMappingURL=viewer.js.map