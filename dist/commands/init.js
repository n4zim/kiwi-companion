"use strict";
exports.command = "init [dir]";
exports.desc = "Create a new Kiwi project";
exports.builder = {
    dir: {
        default: "."
    }
};
exports.handler = function (argv) {
    console.log("init called for dir", argv.dir);
};
