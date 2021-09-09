import { exec, execFile, spawn } from "child_process";
import ffmpeg  from "fluent-ffmpeg";
const ffmpeg_binary = process.env.APPDATA + "/ffmpeg.exe";
process.on("message", async (message: {data: WorkProperties}) => {   
    let result = await compressCLI(message.data)

    if (process.send) {
        if (result == true) {
            process.send({err: false, completed: true})
        } else process.send({err: result, completed: false});
    }
})

async function compressFile (options: WorkProperties) {

    return new Promise<boolean> ((resolve, reject) => {
        let path = options.file.path;
        let newPath = options.settings.new_path + "\\" + options.file.name;
        let settings = options.settings
        let donePath = newPath;

        ffmpeg.setFfmpegPath(ffmpeg_binary);

        try {
            
            if (settings.mute == true) {
                const command = ffmpeg(path)
                .videoCodec("libx264")
                .videoBitrate(settings.bitrate)
                .setFfmpegPath(ffmpeg_binary)
                .output(donePath)
                .noAudio()
                .on("end", (e) => {
                   resolve(true);
                })
                .on('error', function(err) {
                    console.log('An error occurred: ' + err.message);
                    reject(err);
                }).run()

            } else {
                ffmpeg(path)
                .videoCodec("libx264")
                .videoBitrate(settings.bitrate)
                .on("end", (e) => {
                   resolve(true);
                }).on('error', function(err) {
                    console.log('An error occurred: ' + err.message);
                    reject(err);
                })
                .setFfmpegPath(ffmpeg_binary)
                .output(donePath)
                .run()
            }

        } catch (err) {
            reject(err)
            console.log("errror:\n" + err);
        }
    })

}

async function compressCLI (options: WorkProperties) {

    return new Promise<boolean>((res, rej) =>{
        let newPath = options.settings.new_path + `\\${options.settings.ext}${options.file.name}`;
        let cmd = ffmpeg_binary;
        let mutedFlag = "-an";
        console.log(options.settings)

        let ffmpegOptions= [
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
            "-s", options.settings.resolution, mutedFlag, newPath
        ];

        let optionsToUse = (options.settings.mute)? ffmpegOptionsMuted : ffmpegOptions;

        let proc = spawn(cmd, optionsToUse);

        proc.stdout.on('data', function(data) {
            console.log(data);
        });

        proc.stderr.setEncoding("utf8")
        proc.stderr.on('data', function(data) {
            console.log(data);
        });

        proc.on('close', function() {
            console.log('finished');
            res(true)
        });
    })

}