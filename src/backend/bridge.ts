import { ipcRenderer, contextBridge } from "electron";
import { cpus, platform } from "os";

const system = {
    threads: cpus().length,
    platform: platform()
}

const files = {
    selectFolder: () => ipcRenderer.invoke("user/select/destination"),
    selectVideoFiles: () => ipcRenderer.invoke("user/select/video-files"),
}

const app = {
    ffmpegInstall: () => ipcRenderer.invoke("get/valid-install"),
    getVersion: () => ipcRenderer.invoke("get/version"),
}

const _window = {
    minimize: () => ipcRenderer.send("window/minimize"),
    show: () => ipcRenderer.send("window/show"),
    hide: () => ipcRenderer.send("window/hide"),
    quit: () => ipcRenderer.send("window/quit"),
}


const compressor = {
    addWork: (files: WorkProperties[]) => ipcRenderer.invoke("push/compression/new-work", files),
    getStatus: (workID: string) => ipcRenderer.invoke("get/compression/work-status", workID),
}

export const API = {
    files: files,
    system: system,
    app: app,
    compress: compressor,
    window: _window,
}

contextBridge.exposeInMainWorld("api", API);