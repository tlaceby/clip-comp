"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
var electron_1 = require("electron");
var os_1 = require("os");
var system = {
    threads: (0, os_1.cpus)().length,
    platform: (0, os_1.platform)()
};
var files = {
    selectFolder: function () { return electron_1.ipcRenderer.invoke("user/select/destination"); },
    selectVideoFiles: function () { return electron_1.ipcRenderer.invoke("user/select/video-files"); },
};
var app = {
    ffmpegInstall: function () { return electron_1.ipcRenderer.invoke("get/valid-install"); },
    getVersion: function () { return electron_1.ipcRenderer.invoke("get/version"); },
};
var _window = {
    minimize: function () { return electron_1.ipcRenderer.send("window/minimize"); },
    show: function () { return electron_1.ipcRenderer.send("window/show"); },
    hide: function () { return electron_1.ipcRenderer.send("window/hide"); },
    quit: function () { return electron_1.ipcRenderer.send("window/quit"); },
};
var compressor = {
    addWork: function (files) { return electron_1.ipcRenderer.invoke("push/compression/new-work", files); },
    getStatus: function (workID) { return electron_1.ipcRenderer.invoke("get/compression/work-status", workID); },
};
exports.API = {
    files: files,
    system: system,
    app: app,
    compress: compressor,
    window: _window,
};
electron_1.contextBridge.exposeInMainWorld("api", exports.API);
