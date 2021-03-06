#!/usr/bin/env node

const clipboardy = require("clipboardy");
const isEquals = require("lodash.isequal");

const args = require("docopt").docopt(
  `
Usage:
  rcpb <strings>...

Options:
  -h --help   Show this screen.
  -d --debug  Debug mode.
`.trim()
);

const CTRL_V = {
  shiftKey: false,
  altKey: false,
  ctrlKey: true,
  metaKey: false,
  keychar: 118,
  keycode: 0,
  rawcode: 86,
  type: "keypress",
};

const runIoHook = !!process.env.runIoHook;

if (!runIoHook) {
  const { spawn } = require("child_process");
  const subprocess = spawn(process.argv[0], process.argv.slice(1), {
    detached: true,
    windowsHide: true,
    env: {
      runIoHook: "true",
    },
    stdio: "ignore",
  });

  subprocess.unref();
  return;
}

const list = args["<strings>"];
clipboardy.writeSync(list.shift());

const ioHook = require("iohook");

ioHook.on("keypress", (event) => {
  if (isEquals(event, CTRL_V)) {
    if (list.length) {
      clipboardy.writeSync(list.shift());
    }
    if (list.length == 0) {
      ioHook.unload();
    }
  }
});

ioHook.start();
