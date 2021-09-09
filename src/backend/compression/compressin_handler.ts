import { BrowserWindow, ipcMain } from "electron";
import { Work_Queue } from "./workQueue";
import EventEmitter from "events";
import { ChildProcess, fork } from "child_process";
import { existsSync } from "fs";
const pathToFfmpeg = process.env.APPDATA + "/ffmpeg.exe";
const events = new EventEmitter();
const work = new Work_Queue();

events.addListener("work/finished-compressing", onFinished);
events.addListener("work/started-compression", onStartingNewWork);

export default async function HandleCompressionEvents (win: BrowserWindow) {
    const window = win;


    



}

ipcMain.handle("push/compression/new-work", async (_, work_data: WorkProperties[]) => {
    let previousSize = work.count;
    let all = work.push(work_data);

    // means no work is being done.
    if (previousSize === 0) {
        events.emit("work/started-compression", work.current);
    }
    return all;
});


async function onFinished (finished: WorkProperties) {
    console.log(finished)
    let nextToDo = work.next();
    if (nextToDo) events.emit("work/started-compression", work.current);

    console.log("Queue Count: " + work.count)
}

async function onStartingNewWork (current: WorkProperties) {
    console.log("\nstatus - size: " + work.count + "\n");
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
    return new Promise<WorkProperties>((res, rej) => {
        const thread = fork(__dirname + "/compressionWorker");

        if (existsSync(pathToFfmpeg)) {

            thread.send({data: file});

            thread.on("message", (message: {completed: boolean, err: boolean}) => {
                if (message.completed) {
                    thread.kill();
                    res(file);
                } 
            });
            
            thread.on("error", (error) => {
                console.log(error);
                rej(error);
            });
            
            thread.on("exit", (exitCode) => {
                console.log(`Process: exited ecode: ${exitCode}`);
            });

        }
    })
}