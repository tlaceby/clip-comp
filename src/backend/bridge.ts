import { ipcRenderer, contextBridge } from "electron";
import { cpus, platform, type } from "os";

/**
 * Contains information regarding the users spcific hardware and os information.
 * This can be used to understand the machine without needing to make IPC Calls.
 */
const system = {
    threads: cpus().length,
    platform: platform()
}

/**
 * API methods for selecting and viewing files and folders. These work by creating 
 * dialog boxes for the user to make selections.
 */
const files = {
    selectFolder: () => ipcRenderer.invoke("user/select/destination"),
    selectVideoFiles: () => ipcRenderer.invoke("user/select/video-files"),
}

/**
 * Application specific API Calls. These contain things from storage to ffmpeg 
 * related ipc events.
 */
const app = {
    clearStorage: () => ipcRenderer.invoke("clear-storage"),
    onLog: (cb: (msg: any, type: ipcLog)=> void) => {
        ipcRenderer.on("debug-log", (_: any, msg: {message: any, type: ipcLog}) => {
            cb(msg.message, msg.type);
        });
    },
    ffmpegInstall: () => ipcRenderer.invoke("get/valid-install-ffmpeg"),
    ffprobegInstall: () => ipcRenderer.invoke("get/valid-install-ffprobe"),
    getVersion: () => ipcRenderer.invoke("get/version"),
    OnIPCProgress: (evname: ProgressIPCEvent, cb: (data: ProgressIPCData) => void) => ipcRenderer.on("percentage-update", (_, data: ProgressIPCData) => {
        if (evname == data.for) cb(data);
    }),
}

/**
 * Methods for interacting with the native window. The exception being quit which closes
 * the entire application and processess.
 */
const _window = {
    minimize: () => ipcRenderer.send("window/minimize"),
    show: () => ipcRenderer.send("window/show"),
    hide: () => ipcRenderer.send("window/hide"),
    quit: () => ipcRenderer.send("window/quit"),
}

/**
 * Methods for interacting with the _CompressionWorker_ Class. Has event listeners and 
 * seperate methods for interacting with the Queue and current status of work.
 */
const compressor = {
    on: (eventname: CompressorUpdateEvents, callback: Function) => ipcRenderer.on(eventname, (_: any, data: any) => {
        callback(data);
    }),
    addWork: (files: WorkProperties[]) => ipcRenderer.invoke("push/compression/new-work", files),
    getStatus: (workID: string) => ipcRenderer.invoke("get/compression/work-status", workID),
}

/**
 * Clipz contains a API which can be used by the renderer process to securely
 * communicate with the main process without revealing private and vulnerable
 * information to the wrong process.
 * 
 * In here contains the required functions and methods for interacting with the 
 * IPC Safely.
 */
export const API = {
    files: files,
    system: system,
    app: app,
    compress: compressor,
    window: _window,
}


contextBridge.exposeInMainWorld("api", API);