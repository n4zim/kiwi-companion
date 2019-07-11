#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var yargs_1 = __importDefault(require("yargs"));
yargs_1.default
    .scriptName("kiwi")
    .commandDir("commands")
    .usage('$0 <command> [args]')
    .demandCommand(1, "")
    .recommendCommands()
    .strict()
    .argv;
