import { fromFile } from "file-type";
import { existsSync, statSync } from "fs";
import { basename } from "path";

export async function check_files_for_valid_type (paths: string[]) {
    return new Promise<FileDetails[]>( async (res, rej) => {
        const validFiles: FileDetails[] = [];

        try {

            for (let i = 0; i < paths.length; i++) {
                const path = paths[i];

                try {
                    // check for existing loaction.
                    if (existsSync(path)) {
                        // get file information aka size and isFile
                        let file_info = statSync(path);
                        // check for proper file type
                        if (file_info.isFile()) {
                            const f_type = await fromFile(path);
                            
                            // check for video mimt type
                            if (f_type?.mime.includes("video")) {
                                let size = file_info.size;
                                let size_mb = file_info.size / (1024 * 1024);
                                
                                // create the file object to be used.
                                let fileDetails: FileDetails = {
                                    size: size, 
                                    name: basename(path),
                                    size_mb: `${size_mb.toFixed(2)}mb`,
                                    path: path,
                                    mime: f_type.mime,
                                    ext: f_type.ext,
                                }
                                
                                validFiles.push(fileDetails);
                            }
                        }
                    }

                } catch (err) {console.log(err)}
            }

            res(validFiles);
        } catch(err) {rej(err)}
        
    });
}
