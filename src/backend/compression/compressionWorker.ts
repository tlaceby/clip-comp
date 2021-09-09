import { spawn } from "child_process";
import { existsSync } from "fs";
const ffmpeg_binary = process.env.APPDATA + "\\ffmpeg.exe";
process.on("message", async (message: {data: WorkProperties}) => {   
 
    if (!existsSync(ffmpeg_binary) && process.send)  {
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
        let newPath = options.settings.new_path + `\\${options.settings.ext}${options.file.name}`;
        let cmd = ffmpeg_binary;
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