#!/usr/bin/env node

var spawn = require("child_process").spawn,
    watcher = spawn("grunt", ["regarde", "--force"]),
    server = spawn("grunt", ["build", "connect:server"]);

watcher.stdout.on("data", function(data) {
  var importantOutput = data.toString().split("\r?\n").filter(function(str) {
    return />>|Done|Warning|Running/.test(str);
  });

  process.stdout.write(importantOutput.join("\n"));
  // process.stdout.write(data);
});

server.stdout.on("data", function(data) {
  process.stdout.write(data);
});

watcher.on("exit", function(code, signal) {
  server.kill();
  process.exit();
});

server.on("exit", function(code, signal) {
  watcher.kill();
  process.exit();
});

process.on("exit", function() {
  watcher.kill();
  server.kill();
});

