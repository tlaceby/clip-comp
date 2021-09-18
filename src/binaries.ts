import { BrowserWindow } from "electron";
import storage from "electron-json-storage";
import { createWriteStream, existsSync, lstatSync } from "fs";
import { get } from "https";

///////////////////
//// binary loc //
/////////////////

export const FFPROBE_LOCATION_HTTPS = 'https://clip-compressor.herokuapp.com/download/ffprobe/win';
export const FFMPEG_LOCATION_HTTPS = "https://clip-compressor.herokuapp.com/download/win";
export const pathToFfprobe = process.env.USERPROFILE + "\\ffprobe.exe";
export const pathToFfmpeg = process.env.USERPROFILE + "\\ffmpeg.exe";

/**
 * From the main process you can communicate with any window object. Specifify the message type as well as the body and window.
 * This can be usefull for sending messages to the dev tools during binary builds as well
 * as sending messages to devtools for users to view if they so choose. 
 * @param message The message body to be shown.
 * @param type The type will determine what style to display thr message in the renderer console.
 * @param win The BrowserWindow object that the log will appear in via erbContents.
 */
export function log (message: any, type: ipcLog, win: BrowserWindow, alert_: boolean = false) {
    if (win) win.webContents.send("debug-log", {message: message, type: type || "default", alertMessage: alert_});
}


/**
 * ** -- FOR DEBUGGING AND ERRORS ONLY -- ** From the main process you can communicate with any window object. Specifify the message type as well as the body and window.
 * This can be usefull for sending messages to the dev tools during binary builds as well
 * as sending messages to devtools for users to view if they so choose. 
 * 
 * ** Logs the message in ERROR MODE every time **
 */
 export function debug_log (message: any, win: BrowserWindow) {
    if (win) win.webContents.send("debug-log", {message: message, type: "error"});
}
///////////////////
//// binary loc //
/////////////////

/**
 * Will check whrther the storage object contains the valid path to the ffmpeg 
 * binary. If that is null or the path is non existant it will then return false.
 */
export async function checkForValidFFMPEGInstall (win: BrowserWindow) {
    return new Promise((res, rej) => {
        storage.get("ffmpeg-path", async (err, data: any) => {
            if (err) {
                rej(err)
            }

            if (data.path && await checkValidInstalledFile("ffmpeg", data.path)) res(data.path);
            else {
                let newPath = await installFFMPEG (win);
                storage.set("ffmpeg-path", {path: newPath} , (err) => {
                    if (err) {
                        rej(err);
                    }
                    res(newPath);
                })
            }
        })
    })
}

/**
 * Will check whrther the storage object contains the valid path to the ffprobe  
 * binary. If that is null or the path is non existant it will then return false.
 */
export async function checkForValidFFPROBEInstall (win: BrowserWindow) {
    return new Promise((res, rej) => {
        storage.get("ffprobe-path", async (err, data: any) => {
            if (err) {
                rej(err)
            }

            if (data.path && await checkValidInstalledFile("ffprobe", data.path)) res(data.path);
            else {
                let newPath = await installFFPROBE(win);
                storage.set("ffprobe-path", {path: newPath} , (err) => {
                    if (err) {
                        rej(err);
                    }
                    res(newPath);
                })
            }
        })
    })
}

////////////////////////
//// binary download //
//////////////////////

/**
 * Makes a HTTPS request and downloads FFMPEG the binary to the users appData folder. Then it
 * will save the download location inside the users storage.
 */
export async function installFFMPEG (win?: BrowserWindow) {
    return new Promise((success, reject) => {
            let file = createWriteStream(pathToFfmpeg);
            let total_bytes = 4900000;
            let recieved_bytes = 0;

            get(FFMPEG_LOCATION_HTTPS, (res) => {

                if (res.headers['content-length']) {
                    total_bytes = parseInt(res.headers['content-length']);
                }

                res.pipe(file)
                .on("finish", () => {
                    success(pathToFfmpeg);
                });

                res.on("data", (chunk) => {
                    recieved_bytes += chunk.length;
                    const percentage_downloaded = recieved_bytes / total_bytes;
                    if (win) {
                        sendProgressUpdate(parseFloat(percentage_downloaded.toFixed(2)), "installing-dependecies", win, "Installing FFMPEG Dependecies");
                    }
                })

                res.on("error", (e) => {
                    console.log(e);
                    throw new Error("Error downloading files. sadge");
                });
            })
    })
}

/**
 * Makes a HTTPS request and downloads the FFPROBE binary to the users appData folder. Then it
 * will save the download location inside the users storage.
 */
export async function installFFPROBE (win?: BrowserWindow) {
    return new Promise((success, reject) => {
            let file = createWriteStream(pathToFfprobe);
            let total_bytes = 4900000;
            let recieved_bytes = 0;

            get(FFPROBE_LOCATION_HTTPS, (res) => {

                if (res.headers['content-length']) {
                    total_bytes = parseInt(res.headers['content-length']);
                }

                res.pipe(file)
                .on("finish", () => {
                    success(pathToFfprobe);
                });

                res.on("data", (chunk) => {
                    recieved_bytes += chunk.length;
                    const percentage_downloaded = recieved_bytes / total_bytes;
                    if (win) {
                        sendProgressUpdate(parseFloat(percentage_downloaded.toFixed(2)), "installing-dependecies", win, "Installing FFPROBE Dependecies");
                    }
                })

                res.on("error", (e) => {
                    console.log(e);
                    throw new Error("Error downloading files. sadge");
                });
            })
           
            


    });
}


export function sendProgressUpdate (percentage: number, progressFor: ProgressIPCEvent, window: BrowserWindow, msg: string = "") {
    window.webContents.send("percentage-update", {for: progressFor, percentage: percentage, msg: msg});
}

/**
 * Determines whether a path passed into the function is a correct ffmpeg or ffprobe binary.
 * @param binary Whether to check for valid ffmpeg or ffprobe file at location.
 * @param path The path to the file in absolute terms.
 * @returns boolean on whether the file is a correct binary or exists.
 */
export async function checkValidInstalledFile (binary: "ffmpeg" | "ffprobe", path: string) {
    if (!existsSync(path)) return false;

    const minimumBytes = (binary == "ffmpeg")? 76000000 : 43000000; 
    // ffprobe: 43023360 bytes, ffmpeg: 76434432 bytes

    try {
        const stat = lstatSync(path);
        if (!stat.isFile() || stat.size < minimumBytes) return false;
    } catch(err) {
        console.log("err \n", err);
        return false;
    }

    return true;
    
}