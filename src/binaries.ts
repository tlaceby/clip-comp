import { BrowserWindow } from "electron";
import storage from "electron-json-storage";
import { createWriteStream } from "fs";
import { get } from "https";

///////////////////
//// binary loc //
/////////////////

export const FFPROBE_LOCATION_HTTPS = 'https://drive.google.com/u/1/uc?export=download&confirm=4uyB&id=1gBIu5E-uuqdeTslwzjVpq3d9_C3ulVPV'
export const FFMPEG_LOCATION_HTTPS = "https://clip-compressor.herokuapp.com/download/win";
export const pathToFfprobe = process.env.APPDATA + "\\ffprobe.exe";
export const pathToFfmpeg = process.env.APPDATA + "\\ffmpeg.exe";

/**
 * From the main process you can communicate with any window object. Specifify the message type as well as the body and window.
 * This can be usefull for sending messages to the dev tools during binary builds as well
 * as sending messages to devtools for users to view if they so choose. 
 * @param message The message body to be shown.
 * @param type The type will determine what style to display thr message in the renderer console.
 * @param win The BrowserWindow object that the log will appear in via erbContents.
 */
export function log (message: any, type: ipcLog, win: BrowserWindow) {
    if (win) win.webContents.send("debug-log", {message: message, type: type || "default"});
}

///////////////////
//// binary loc //
/////////////////

/**
 * Will check whrther the storage object contains the valid path to the ffmpeg 
 * binary. If that is null or the path is non existant it will then return false.
 */
export async function checkForValidFFMPEGInstall () {
    return new Promise((res, rej) => {
        storage.get("ffmpeg-path", async (err, data: any) => {
            if (err) {
                rej(err)
            }

            if (data.path) res(data.path);
            else {
                let newPath = await installFFMPEG ();
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
export async function checkForValidFFPROBEInstall () {
    return new Promise((res, rej) => {
        storage.get("ffprobe-path", async (err, data: any) => {
            if (err) {
                rej(err)
            }

            if (data.path) res(data.path);
            else {
                let newPath = await installFFPROBE();
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
export async function installFFMPEG () {
    return new Promise((success, reject) => {
            const file = createWriteStream(pathToFfmpeg);
            
            get(FFMPEG_LOCATION_HTTPS, (response) => {
                response.pipe(file);
                file.on("finish", () => {
                    success(pathToFfmpeg);
                })

                response.on("error", (e: any) => {
                    console.log(e)
                    reject(e);
                });

            });
    })
}

/**
 * Makes a HTTPS request and downloads the FFPROBE binary to the users appData folder. Then it
 * will save the download location inside the users storage.
 */
export async function installFFPROBE () {
    return new Promise((success, reject) => {
            console.log("making https request for ffprobe binary")
            const file = createWriteStream(pathToFfprobe);
            
            get(FFPROBE_LOCATION_HTTPS, (response) => {
                response.pipe(file);
                file.on("finish", () => {
                    console.log("pipe finished for ffprobe");
                    success(pathToFfprobe);
                })

                response.on("error", (e: any) => {
                    console.log(e)
                    reject(e);
                });

            });
    })
}