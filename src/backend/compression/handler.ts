import { fork } from "child_process";
import { BrowserWindow } from "electron";
import EventEmitter from "events";
import { existsSync } from "fs";
import { log, pathToFfmpeg, pathToFfprobe } from "../../binaries";
import { Work_Queue } from "./workQueue";



export default class _CompressionManager_ {
    private window: BrowserWindow;
    public events: EventEmitter;
    public work: Work_Queue;

    constructor (win: BrowserWindow) {
        this.window = win;
        this.work = new Work_Queue();
        this.events = new EventEmitter();

        this.events.addListener("work/finished-compressing", () => {
            this.onFinished();
        });

        this.events.addListener("work/started-compression", (args) => {
            this.onStartingNewWork(args);
        });
    }

    public setWindow (win: BrowserWindow) {
        if (win.webContents) this.window = win;

        else console.error("ERROR WIN NOT DEFINED");
    }
 
    private async compressFile (file: WorkProperties) {
        return new Promise<WorkProperties>( async (res, rej) => {
            const thread = fork(__dirname + "\\compressionWorker");
            if (existsSync(pathToFfmpeg) && existsSync(pathToFfprobe)) { 

                thread.send({data: file});

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
            } 
        })
    }

    private async onFinished () {
        let nextToDo = this.work.next();
        if (nextToDo) this.events.emit("work/started-compression", this.work.current);
    
        console.log("Queue Count: " + this.work.count)
    
    
    
        if (this.work.count > 0) {
            this.window.webContents.send("/work-update/one-done", this.work.get());
        } else this.window.webContents.send("/work-update/all-done", this.work.get());
    }
    
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