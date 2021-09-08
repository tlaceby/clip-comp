"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
var electron_1 = require("electron");
exports.API = {
    getVersion: function () { return electron_1.ipcRenderer.invoke("get/version"); },
};
electron_1.contextBridge.exposeInMainWorld("api", exports.API);
