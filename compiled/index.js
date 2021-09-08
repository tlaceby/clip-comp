"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var storage = __importStar(require("electron-json-storage"));
var fs_1 = require("fs");
var path_1 = require("path");
var electron_reload_1 = __importDefault(require("electron-reload"));
var user_select_1 = require("./backend/dialog/user_select");
var checks_1 = require("./backend/file/checks");
require("./backend/compression/compressin_handler");
var https_1 = require("https");
var FFMPEG_LOCATION_HTTPS = "https://clip-compressor.herokuapp.com/download/win";
(0, electron_reload_1.default)((0, path_1.join)(__dirname, '..'), {});
electron_1.app.whenReady().then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // storage.clear((e) => {
        //     main()
        // })
        main();
        return [2 /*return*/];
    });
}); });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var window;
        return __generator(this, function (_a) {
            window = new electron_1.BrowserWindow({
                icon: "icon.ico",
                width: 800, height: 650,
                show: false,
                autoHideMenuBar: true,
                webPreferences: {
                    preload: __dirname + "/backend/bridge.js",
                    devTools: true
                }
            });
            window.webContents.openDevTools();
            window.loadFile((0, path_1.join)(__dirname, '..', 'index.html'));
            window.on("ready-to-show", window.show);
            return [2 /*return*/];
        });
    });
}
// Application IPC CALLS
electron_1.ipcMain.handle("get/version", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, electron_1.app.getVersion()];
    });
}); });
/// Window Related APP CALLS
// Work Related Calls
electron_1.ipcMain.handle("user/select/video-files", function () { return __awaiter(void 0, void 0, void 0, function () {
    var user_selected, valid_selections;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, user_select_1.user_select_multiple_files)()];
            case 1:
                user_selected = _a.sent();
                // check for cancel of null array
                if (user_selected.canceled || user_selected.filePaths.length == 0)
                    return [2 /*return*/, []];
                return [4 /*yield*/, (0, checks_1.check_files_for_valid_type)(user_selected.filePaths)];
            case 2:
                valid_selections = _a.sent();
                return [2 /*return*/, valid_selections];
        }
    });
}); });
electron_1.ipcMain.handle("user/select/destination", function () { return __awaiter(void 0, void 0, void 0, function () {
    var user_selected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, user_select_1.user_select_destination)()];
            case 1:
                user_selected = _a.sent();
                // check for cancel of null array
                if (user_selected.canceled || user_selected.filePaths.length == 0)
                    return [2 /*return*/, undefined];
                else
                    return [2 /*return*/, user_selected.filePaths];
                return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.handle("get/valid-install", function () { return __awaiter(void 0, void 0, void 0, function () {
    var installedPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkForValidInstall()];
            case 1:
                installedPath = _a.sent();
                return [2 /*return*/, installedPath];
        }
    });
}); });
// Handle Iniit
function checkForValidInstall() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    storage.get("ffmpeg-path", function (err, data) { return __awaiter(_this, void 0, void 0, function () {
                        var newPath_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (err) {
                                        rej(err);
                                    }
                                    console.log(data.path + " path from storage");
                                    if (!data.path) return [3 /*break*/, 1];
                                    res(data.path);
                                    return [3 /*break*/, 3];
                                case 1: return [4 /*yield*/, installFFMPEG()];
                                case 2:
                                    newPath_1 = _a.sent();
                                    storage.set("ffmpeg-path", { path: newPath_1 }, function (err) {
                                        if (err) {
                                            rej(err);
                                        }
                                        res(newPath_1);
                                    });
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                })];
        });
    });
}
function installFFMPEG() {
    return __awaiter(this, void 0, void 0, function () {
        var defaultPathToFFMPEG;
        return __generator(this, function (_a) {
            defaultPathToFFMPEG = electron_1.app.getPath("appData") + "/ffmpeg.exe";
            return [2 /*return*/, new Promise(function (success, reject) {
                    console.log("making https request");
                    var file = (0, fs_1.createWriteStream)(defaultPathToFFMPEG);
                    (0, https_1.get)(FFMPEG_LOCATION_HTTPS, function (response) {
                        response.pipe(file);
                        file.on("finish", function () {
                            console.log("pipe finished");
                            success(defaultPathToFFMPEG);
                        });
                        response.on("error", function (e) {
                            console.log(e);
                            reject(e);
                        });
                    });
                })];
        });
    });
}
