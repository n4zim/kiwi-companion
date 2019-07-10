#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = __importDefault(require("commander"));
var packageJson = require("../../package.json");
commander_1.default
    .name("kiwi")
    .version(packageJson.version)
    .description(packageJson.description);
commander_1.default
    .command("install")
    .description("sets up project dependencies");
