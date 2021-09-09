import { spawn } from "child_process"

export async function getFramesFromFolder (inputPath: string, pathToBinary: string) {
    return new Promise((res, rej) => {
        const command  = `${pathToBinary} -i ${inputPath} -print_format json -loglevel fatal -show_streams -count_frames -select_streams v`
        let path = "";
        let proc = spawn(command);
    
            proc.stdout.on('data', function(data) {
                console.log(data);
            });
    
            proc.stderr.setEncoding("utf8")
            proc.stderr.on('data', function(d: string) {
                console.log(d)
                
                
            });
    
            proc.on('close', () => {
                console.log("closing ... thread")
                res(path)
            });
    
    
            proc.on("error", (err) => {
                console.log("\n\n error: " + err);
                rej(err)
            })
    })


}