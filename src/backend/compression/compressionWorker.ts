import { spawn } from "child_process";
import { existsSync } from "fs";
import { pathToFfmpeg } from "../../binaries";
import { join, sep } from "path";

// Handle the initial message
process.on("message", async (message: {data: WorkProperties}) => {   


    // Verify as LAST resort the location of the binary.
    // TODO :  - -- - - - - - - -- - - -- - - - -- - -- - 
    // ACTUALLY NOTIFY THE USER OF THE INVALID INSTALL 
    // INSTEAD OF JJST LOGGING TO CONSOLE
    if (!existsSync(pathToFfmpeg) && process.send) {
        process.send({err: true, completed: false, msg: "NO FFMPEG"});
    }


    let result = await compressCLI(message.data)
    console.log(result)
    if (process.send) {
        if (result == true) {
            process.send({err: false, completed: true})
        } else process.send({err: true, completed: false});
    }
})


async function compressCLI (options: WorkProperties) {

    return new Promise<boolean>((res, rej) => {
        let newPath = options.settings.new_path + `${sep}${options.settings.ext}${options.file.name}`;

        // to avoid overwriting a exististing file create a new one with a data appended on the name.
        if (existsSync(newPath)) {
            newPath = options.settings.new_path + `${sep}${options.settings.ext}${Date.now()}${options.file.name}`;
        }
        let cmd = pathToFfmpeg;
        let mutedFlag = "-an";

        let ffmpegOptions = [
            '-i', options.file.path,
            "-c:v", "libx264", 
            "-crf", `${options.settings.bitrate}`, // 29
            "-preset", options.settings.speed, // slow , veryslow, fast veryfast, medium
            "-s", options.settings.resolution, newPath
        ];

        let ffmpegOptionsMuted = [
            '-i', options.file.path,
            "-c:v", "libx264", 
            "-crf", `${options.settings.bitrate}`, // 29
            "-preset", options.settings.speed, // slow , veryslow, fast veryfast, medium
            "-s", options.settings.resolution, mutedFlag, '-progress', '-nostat', newPath,
        ];

        let optionsToUse = (options.settings.mute)? ffmpegOptionsMuted : ffmpegOptions;
        let proc = spawn(cmd, optionsToUse);

        let lastSentUpdate = Date.now()

        proc.stdout.on('data', function(data) {
            console.log(data);
        });

        proc.stderr.setEncoding("utf8")
        proc.stderr.on('data', function(d: string) {
            // console.log(d)
            let data = d.split("=")
            if (data.length > 1) {
                let frameArg = data[1];

                let frameOn = removeNumberFromARG (frameArg);
    
                if (frameOn && process.send) {
                    let differenceInSendTimes = Date.now() - lastSentUpdate;

                    if (differenceInSendTimes > 1400) {
                        lastSentUpdate = Date.now()
                        process.send({completed: false, err: false, frameCompleted: frameOn});
                    }
                }
            }
            
        });

        proc.on('close', () => {
            console.log("closing ... thread")
            res(true)
        });


        proc.on("error", (err) => {
            console.log("\n\n error: " + err);
            rej(err)
        })
    })

}


function removeNumberFromARG (arg: string) {
    let num = '';

   for (let i = 0; i < arg.length; i ++) {
       let check = parseInt(arg[i]);

       if (typeof check == "number") num += arg[i];
   }

    return parseInt(num) || undefined;
}