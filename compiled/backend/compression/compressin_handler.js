"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var workQueue_1 = require("./workQueue");
var events_1 = __importDefault(require("events"));
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var pathToFfmpeg = process.env.APPDATA + "/ffmpeg.exe";
var events = new events_1.default();
var work = new workQueue_1.Work_Queue();
events.addListener("work/finished-compressing", onFinished);
events.addListener("work/started-compression", onStartingNewWork);
electron_1.ipcMain.handle("push/compression/new-work", function (_, work_data) { return __awaiter(void 0, void 0, void 0, function () {
    var previousSize, all;
    return __generator(this, function (_a) {
        previousSize = work.count;
        all = work.push(work_data);
        // means no work is being done.
        if (previousSize === 0) {
            events.emit("work/started-compression", work.current);
        }
        return [2 /*return*/, all];
    });
}); });
function onFinished(finished) {
    return __awaiter(this, void 0, void 0, function () {
        var nextToDo;
        return __generator(this, function (_a) {
            console.log(finished);
            nextToDo = work.next();
            if (nextToDo)
                events.emit("work/started-compression", work.current);
            console.log("Queue Count: " + work.count);
            return [2 /*return*/];
        });
    });
}
function onStartingNewWork(current) {
    return __awaiter(this, void 0, void 0, function () {
        var compressionTask;
        return __generator(this, function (_a) {
            console.log("\nstatus - size: " + work.count + "\n");
            console.log("starting... \n");
            compressionTask = compressFile(current);
            compressionTask.then(function (finished) {
                events.emit("work/finished-compressing", finished);
            });
            compressionTask.catch(function (err) {
                events.emit("work/finished-compressing", current);
                console.log("FAILED TOP Compress FILE" + err);
            });
            return [2 /*return*/];
        });
    });
}
function compressFile(file) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var thread = (0, child_process_1.fork)(__dirname + "/compressionWorker");
                    if ((0, fs_1.existsSync)(pathToFfmpeg)) {
                        thread.send({ data: file });
                        thread.on("message", function (message) {
                            if (message.completed) {
                                thread.kill();
                                res(file);
                            }
                        });
                        thread.on("error", function (error) {
                            console.log(error);
                            rej(error);
                        });
                        thread.on("exit", function (exitCode) {
                            console.log("Process: exited ecode: " + exitCode);
                        });
                    }
                })];
        });
    });
}
