import { app, ipcMain, BrowserWindow } from "electron";
import * as storage from "electron-json-storage";
import { join, extname, sep, toNamespacedPath } from "path";
import { autoUpdater } from "electron-updater";

////////////////
//// IMPORTS //
//////////////

import {user_select_multiple_files, user_select_destination} from "./backend/dialog/user_select";
import { check_files_for_valid_type } from "./backend/file/checks";
import { checkForValidFFMPEGInstall, checkForValidFFPROBEInstall, debug_log, log, pathToFfmpeg, pathToFfprobe } from "./binaries";
import _CompressionManager_ from "./backend/compression/handler";

//////////////////////////
//// EVENTS & EMITTERS //
////////////////////////
///////////////////////

let CompressionManager: _CompressionManager_;
let window: BrowserWindow;
let updateCheckInterval: null | NodeJS.Timer = null;

// Startup Main Function
// Creates main window then initializes the CompressionManager class.
app.whenReady().then(async () => {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    await main();
    CompressionManager = new _CompressionManager_(window);
    console.log(pathToFfprobe, pathToFfmpeg);

    // handle updates via github releases.
    autoUpdater.checkForUpdatesAndNotify();
    // Call the update-interval
    updateCheckInterval = setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 30000);
});

/////////////////////
//// MAIN STARTUP //
///////////////////

/**
 * This method is called when the application is finished installing the 
 * required dependecies and is ready to show the dashboard page.
 */
function setWindowNormalSize () {   
    window.resizable = true;
    window.setSize(1120, 870);
    window.center();
    CompressionManager.setWindow(window);
    log("Application Version: " + app.getVersion(), "default", window);

}


/**
 * Creates the window as well as loads the preload script and html content.
 */
async function main () {
    
    window = new BrowserWindow({
        icon: "icon.ico",
        width: 350, height: 300,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: __dirname + "/backend/bridge.js",
            devTools: true
        }, resizable: false,
    });

    // window.webContents.openDevTools()
    window.loadFile(join(__dirname, '..', 'index.html'));
    window.on("ready-to-show", window.show);

    return true;
}

//////////////////
//// IPC CALLS //
////////////////


// returns a promise with the applicatioins version
ipcMain.handle("get/version", async () => {
    return app.getVersion();
});

// Clears the storage. This means any and all binaries that are required will 
// be installed upon next time the user starts up the app. 
ipcMain.handle("clear-storage", async () => {
    storage.clear(() => {
        app.quit();
    });
})


//////////////////
//// IPC WORK ///
////////////////


// This IPC Call allows the user to select a single or mutltiple video files and 
// from that selection It will verify whether the video files are valid and able to be //
// compressed. If zero files are compressable it will simply return a empty array[]

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

/////////////////////////////
////////////////////////////
/// ipc new-work-request //
//////////////////////////
/////////////////////////


/// Add new work to the queue.
// If work is not happening already then starts compressing first element inside queue 

ipcMain.handle("push/compression/new-work", async (_: any, work_data: WorkProperties[]) => {
    let previousSize = CompressionManager.work.count;
    let all = CompressionManager.work.push(work_data);

    // means no work is being done.
    if (previousSize === 0) {
        debug_log("Starting new work with queue.", window);
        CompressionManager.events.emit("work/started-compression", CompressionManager.work.current);
    }

    return all;
});

////////////////////////
// AUTO-UPDATES  //////
// BINARY PATHS /////
////////////////////

autoUpdater.on("update-downloaded", () => {
    log("[Update Downloaded]: Restart App to install Update", "default", window);
    autoUpdater.autoInstallOnAppQuit = true;
});

// Checks for a update agains the github releases. If found starts downloading.

autoUpdater.on("update-available", () => {
    
    // If the interval is valid then done check again.
    if (updateCheckInterval) {
        clearInterval(updateCheckInterval);
        updateCheckInterval = null;
    }

    log("[Update Found]: Downloading to users' tmp dir.", "default", window);
});


// Checks for a valid binary installation. If the binary is found and exists on the
// filesystem it will return true. It will install otherwise.
ipcMain.handle("get/valid-install-ffmpeg", async() => {
    let installedPath = await checkForValidFFMPEGInstall(window);
    return installedPath;
})


// Checks for a valid binary installation. If the binary is found and exists on the
// filesystem it will return true.
// If the binary is null or corrupted it will install it using HTTPS.
ipcMain.handle("get/valid-install-ffprobe", async() => {
    let installedPath = await checkForValidFFPROBEInstall(window);
    
    setWindowNormalSize()
    return installedPath;
})
