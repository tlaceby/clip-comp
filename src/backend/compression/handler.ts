import { fork } from "child_process";
import { BrowserWindow } from "electron";
import EventEmitter from "events";
import { existsSync } from "fs";
import { checkValidInstalledFile, installFFMPEG, log, pathToFfmpeg, pathToFfprobe } from "../../binaries";
import { Work_Queue } from "./workQueue";
import * as store from "electron-json-storage";

/**
 * The CompressionManager is responsible for managing the queue state as well
 * as creating new processess for compression to take place.
 * 
 * The class has internal methods for responding and communicating with the window 
 * with relative data and status with compression. It also is respobsible for 
 * handling the errors and messages from the child processess that actually
 * do the compression.
 */
export default class _CompressionManager_ {
    private window: BrowserWindow;
    public events: EventEmitter;
    public work: Work_Queue;

    constructor (win: BrowserWindow) {
        this.window = win;
        this.work = new Work_Queue();
        this.events = new EventEmitter();

        // Create event listeners for use with the queue.
        this.events.addListener("work/finished-compressing", () => {
            this.onFinished();
        });

        this.events.addListener("work/started-compression", (args) => {
            this.onStartingNewWork(args);
        });
    }

    /**
     * The window needs to be set inside the class to enure any messages can be send 
     * from within the class itself. Whenever the window is destroyed or deleted it 
     * is required to pass the new window to the class instance as to keep it working
     * properly.
     * 
     * @param win The BrowserWindow object.
     */
    public setWindow (win: BrowserWindow) {
        if (win.webContents) this.window = win;

        else console.error("ERROR WIN NOT DEFINED");
    }
    
    /**
     * Given the Properties to be used by the compression worker. 
     * This function maintains the lifecycle of the ffmpeg process and its child worker.
     * 
     * What this means is that the function will not return or resolve any promises's
     * untul the file is either
     * 
     * 1) finished compressing.
     * 2) Has a exception / error.
     * @param file The file peoperties struct created in the new WorkForm.
     * @returns A promise containing the file object or an error message if a error 
     * occurs.
     */
    private async compressFile (file: WorkProperties) {
        return new Promise<WorkProperties>( async (res, rej) => {
            const validFFMPEG = await checkValidInstalledFile("ffmpeg", pathToFfmpeg);

            // Create a child process to be ran with the ffmpeg compress code.
            const thread = fork(__dirname + "\\compressionWorker");

            // There are 3 message types you can recieve for now from the 
            // child thread.
            /*
            1) Success and completed without any errors.
            2) Failed / Error message -  Typically caused
            whern ffmpeg has a issue or the file is corrupted.

            3) This is a status message thats send to update the 
            chrome window of the frame thats completed.
            later this will be used to display a progress percentage.
            */
            thread.on("message", (message: {completed: boolean, err: boolean, frameCompleted: number}) => {
                log(message, "default", this.window)
                if (message.completed && !message.err) {
                    thread.kill();
                    res(file);
                } else if (!message.completed && message.err){
                    res(file)
                    thread.kill();
                } else {    
                    this.window.webContents.send("/update-progress", undefined);
                }
            });
            
            thread.on("error", (error) => {
                log(error, "error", this.window);
                rej(error);
            });

            // if the file is not valid we must install it and then proceed after.
            if (!validFFMPEG) {
                log("Vital files cannot be found. Installing required binaries. Please dont disconnect the app from the internet.", "error", this.window, true);
                // check for valid internet connection.
                try {
                    let installPath = await installFFMPEG();

                    // lastly save the new path to storage and send the thread our new information.
                    store.set("ffmpeg-path", {path: installPath} , (err) => {
                        if (err) {
                            thread.kill();
                            rej(err);
                        }
                        
                    })
                    thread.send({data: file});
                } catch (err) {
                    thread.kill();
                    rej(err);
                }

            } else thread.send({data: file});
            
        })
    }

    /**
     * THIS is called whever the work is completed by a prevoius file. 
     * Will check whether there is any more work left to do and if so then it will
     * begin work and notify the renderer process.
     */
    private async onFinished () {
        let nextToDo = this.work.next();
        if (nextToDo) this.events.emit("work/started-compression", this.work.current);
    
        console.log("Queue Count: " + this.work.count)
    
    
    
        if (this.work.count > 0) {
            this.window.webContents.send("/work-update/one-done", this.work.get());
        } else this.window.webContents.send("/work-update/all-done", this.work.get());
    }
    
    /**
     * This is called before actually starting work and is mainly a stopping place to 
     * message the renderer process of all the current work and notify of new work being started,
     * 
     * It will also handle messages to the renderer depending on siccessfull or failed 
     * completion of the file being compressed.
     * @param current The current file and its relative data being compressed.
     */
    private async onStartingNewWork (current: WorkProperties) {
        try {
            this.window.webContents.send("/work-update/starting-new", this.work.get())
        } catch (err) {
            console.log(err);
        }
        console.log("starting... \n");
    
        let compressionTask = this.compressFile(current);
    
        compressionTask.then((finished) => {
            this.events.emit("work/finished-compressing", finished);
        })
        
        compressionTask.catch((err) => {
            this.events.emit("work/finished-compressing", current);
            console.log("FAILED TOP Compress FILE" + err)
        })
    }
    
}