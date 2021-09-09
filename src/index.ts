import { app, ipcMain, BrowserWindow } from "electron";
import * as storage from "electron-json-storage"
import { createWriteStream } from "fs";
import { join } from "path";
import {user_select_multiple_files, user_select_destination} from "./backend/dialog/user_select";
import { check_files_for_valid_type } from "./backend/file/checks";
// import "./backend/compression/compressin_handler";
import { get } from "https"; 
import { Work_Queue } from "./backend/compression/workQueue";
import EventEmitter from "events";
import { ChildProcess, fork } from "child_process";
import { existsSync } from "fs";
const events = new EventEmitter();
const work = new Work_Queue();
import { autoUpdater } from 'electron-updater';
autoUpdater.autoInstallOnAppQuit = true;

events.addListener("work/finished-compressing", onFinished);
events.addListener("work/started-compression", onStartingNewWork);

const FFPROBE_LOCATION_HTTPS = 'https://drive.google.com/u/1/uc?export=download&confirm=4uyB&id=1gBIu5E-uuqdeTslwzjVpq3d9_C3ulVPV'
const FFMPEG_LOCATION_HTTPS = "https://clip-compressor.herokuapp.com/download/win";
const pathToFfprobe = process.env.APPDATA + "\\ffprobe.exe";
const pathToFfmpeg = process.env.APPDATA + "\\ffmpeg.exe";

let window: BrowserWindow;

app.whenReady().then(async () => {
    main();
});

function setWindowNormalSize () {   
    window.setSize(1120, 870);
    window.center();
}

async function main () {

    window = new BrowserWindow({
        icon: "icon.ico",
        width: 350, height: 300,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: __dirname + "/backend/bridge.js",
            devTools: true
        }
    });

    // window.webContents.openDevTools()
    window.loadFile(join(__dirname, '..', 'index.html'));
    window.on("ready-to-show", window.show);

    log("Application Version: " + app.getVersion(), "default");
}

// Application IPC CALLS

ipcMain.handle("get/version", async () => {
    return app.getVersion();
});




/// Window Related APP CALLS



// Work Related Calls

ipcMain.handle("user/select/video-files", async () => {

    // get user selection of files.

    const user_selected = await user_select_multiple_files();

    // check for cancel of null array
    if (user_selected.canceled || user_selected.filePaths.length == 0) return [];

    // then check the files before sending them back as VALID

    const valid_selections = await check_files_for_valid_type(user_selected.filePaths);

    return valid_selections;
    // return either empty array for bad /invalid selection or files 
    // that are compressable

});

ipcMain.handle("user/select/destination", async () => {
    const user_selected = await user_select_destination ();

    // check for cancel of null array
    if (user_selected.canceled || user_selected.filePaths.length == 0) return undefined;
    else return user_selected.filePaths;
});

///Work QUEUE
ipcMain.handle("push/compression/new-work", async (_: any, work_data: WorkProperties[]) => {
    let previousSize = work.count;
    let all = work.push(work_data);

    // means no work is being done.
    if (previousSize === 0) {
        events.emit("work/started-compression", work.current);
    }

    return all;
});


async function onFinished (finished: WorkProperties) {
    let nextToDo = work.next();
    if (nextToDo) events.emit("work/started-compression", work.current);

    console.log("Queue Count: " + work.count)



    if (work.count > 0) {
        window.webContents.send("/work-update/one-done", work.get());
    } else window.webContents.send("/work-update/all-done", work.get());
}

async function onStartingNewWork (current: WorkProperties) {
    try {
        window.webContents.send("/work-update/starting-new", work.get())
    } catch (err) {
        console.log(err);
    }
    console.log("starting... \n");

    let compressionTask = compressFile(current);

    compressionTask.then((finished) => {
        events.emit("work/finished-compressing", finished);
    })

    compressionTask.catch((err) => {
        events.emit("work/finished-compressing", current);
        console.log("FAILED TOP Compress FILE" + err)
    })
}


async function compressFile (file: WorkProperties) {
    return new Promise<WorkProperties>( async (res, rej) => {
        const thread = fork(__dirname + "/backend/compression/compressionWorker");
        let totalFrames = 0;
        let showProgress = false;
        if (existsSync(pathToFfmpeg) && existsSync(pathToFfprobe)) { 

            thread.send({data: file});

            thread.on("message", (message: {completed: boolean, err: boolean, frameCompleted: number}) => {
                log(message, "default")
                if (message.completed && !message.err) {
                    thread.kill();
                    res(file);
                } else if (!message.completed && message.err){
                    res(file)
                    thread.kill();
                } else {    
                     
                    window.webContents.send("/update-progress", undefined);
                }
            });
            
            thread.on("error", (error) => {
                log(error, "error");
                rej(error);
            });
            
            thread.on("exit", (exitCode) => {
                console.log(`Process: exited ecode: ${exitCode}`);
            });

        } 
    })
}


ipcMain.handle("get/valid-install-ffmpeg", async() => {
    let installedPath = await checkForValidFFMPEGInstall();

    return installedPath;
})

ipcMain.handle("get/valid-install-ffprobe", async() => {
    let installedPath = await checkForValidFFPROBEInstall();


    setWindowNormalSize()
    return installedPath;
})


// Handle Iniit

async function checkForValidFFMPEGInstall () {
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


async function checkForValidFFPROBEInstall () {
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


async function installFFMPEG () {
    const defaultPathToFFMPEG = app.getPath("appData") + "/ffmpeg.exe";
    return new Promise((success, reject) => {
            console.log("making https request for ffmpeg binary")
            const file = createWriteStream(defaultPathToFFMPEG);
            
            get(FFMPEG_LOCATION_HTTPS, (response) => {
                response.pipe(file);
                file.on("finish", () => {
                    console.log("pipe finished")
                    success(defaultPathToFFMPEG);
                })

                response.on("error", (e: any) => {
                    console.log(e)
                    reject(e);
                });

            });
    })
}

async function installFFPROBE () {
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




// Updater Stuffz
setTimeout(autoUpdater.checkForUpdatesAndNotify, 5000);
// Check for application update every 30s
setInterval(() => {
    try {
        autoUpdater.checkForUpdatesAndNotify();
    } catch(err) {
        console.log(err);
        console.log('failed to search for autoUpdater')
    }
    
}, 30000)

autoUpdater.on("update-downloaded", (e) => {
    window.webContents.send("update-downloaded", "an update was downloaded and will be installed when you restart the app.")
});

autoUpdater.on("update-available", (e) => {
    window.webContents.send("update-found", "starting update now")
    log("[Update Found]: Downloading to tmp dir.", "default");
});

function log (message: any, type?: ipcLog) {
    window.webContents.send("debug-log", {message: message, type: type || "default"});
}