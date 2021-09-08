import { app, ipcMain, BrowserWindow } from "electron";
import * as storage from "electron-json-storage";
import { createWriteStream } from "fs";
import { join } from "path";
import electronReload from "electron-reload";
import {user_select_multiple_files, user_select_destination} from "./backend/dialog/user_select";
import { check_files_for_valid_type } from "./backend/file/checks";
import "./backend/compression/compressin_handler";
import { get } from "https";

const FFMPEG_LOCATION_HTTPS = "https://clip-compressor.herokuapp.com/download/win";
electronReload(join(__dirname, '..'), {});

app.whenReady().then(async () => {
    // storage.clear((e) => {
    //     main()
    // })
    main()
});

async function main () {

    const window = new BrowserWindow({
        icon: "icon.ico",
        width: 800, height: 650,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: __dirname + "/backend/bridge.js",
            devTools: true
        }
    });

    window.webContents.openDevTools()
    window.loadFile(join(__dirname, '..', 'index.html'));
    window.on("ready-to-show", window.show);
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


ipcMain.handle("get/valid-install", async() => {
    let installedPath = await checkForValidInstall();

    return installedPath;
})


// Handle Iniit

async function checkForValidInstall () {
    return new Promise((res, rej) => {
        storage.get("ffmpeg-path", async (err, data: any) => {
            if (err) {
                rej(err)
            }

            console.log(data.path + " path from storage");
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


async function installFFMPEG () {
    const defaultPathToFFMPEG = app.getPath("appData") + "/ffmpeg.exe";
    return new Promise((success, reject) => {
            console.log("making https request")
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