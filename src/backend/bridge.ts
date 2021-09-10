import { ipcRenderer, contextBridge } from "electron";
import { cpus, platform, type } from "os";

const system = {
    threads: cpus().length,
    platform: platform()
}

const files = {
    selectFolder: () => ipcRenderer.invoke("user/select/destination"),
    selectVideoFiles: () => ipcRenderer.invoke("user/select/video-files"),
}

const app = {
    clearStorage: () => ipcRenderer.invoke("clear-storage"),
    onLog: () => {
        ipcRenderer.on("debug-log", (_: any, msg: {message: any, type: ipcLog}) => {
            if (msg.type == "error") { console.error(msg.message); }
            if (msg.type == "vital") { console.error(`IPC Vital: \n`); console.error(msg.message); }
            if (msg.type == "default") { console.log (msg.message); }
        });
    },
    ffmpegInstall: () => ipcRenderer.invoke("get/valid-install-ffmpeg"),
    ffprobegInstall: () => ipcRenderer.invoke("get/valid-install-ffprobe"),
    getVersion: () => ipcRenderer.invoke("get/version"),
}

const _window = {
    minimize: () => ipcRenderer.send("window/minimize"),
    show: () => ipcRenderer.send("window/show"),
    hide: () => ipcRenderer.send("window/hide"),
    quit: () => ipcRenderer.send("window/quit"),
}


const compressor = {
    on: (eventname: CompressorUpdateEvents, callback: Function) => ipcRenderer.on(eventname, (_: any, data: any) => {
        callback(data);
    }),
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