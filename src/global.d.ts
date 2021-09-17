
/**
 * The output target resolution. If a higher resolution is selected than 
 * the current input then it will be scaled up and may lose substantial quality.
 */
type CompressionResolution = "1280x720" | "1920x1080";

/**
 * The FFMPEG determined speeds for compression speed. The slower the speed the better the 
 * results will be for individual file compression as well as space savings.
 * Faster speeds will reduce possoble quality saved per mb loss.
 */
type CompressionSpeed = "veryslow" | "slow" | "medium" | "fast" | "veryfast";

/**
 * Defines the layout of a compression-task. Each piece of work must follow this 
 * schema.
 */
interface CompressionSettings {
    bitrate: number,
    mute: boolean,
    speed: CompressionSpeed;
    resolution: CompressionResolution,
    ext: string,
    new_path?: string
}

/**
 * Defines the schema for a work Object. This is the sdettings tro be used when compressing a certain file
 */
interface WorkProperties {
    id: string,
    file: FileDetails,
    settings: CompressionSettings
}

/**
 * Each video-file will have the required information to properly 
 * display this data to the user and the ffmpeg program. Most of it is to inform the user
 * of peoper file selection.
 */
interface FileDetails {
    name: string,
    size_mb: string,
    size: number,
    path: string,
    ext: string,
    mime: string
}

/**
 * These events can be listened to and contain information about the file or files 
 * that have been completed.
 */
type CompressorUpdateEvents = "/work-update/starting-new"|  "/work-update/one-done" | "/work-update/all-done" | "/update-progress";

/**
 * The message event priority to be send along to the console.
 * a error and vital event will be logged using coneole.error while default will 
 * contain usual white text.
 */
type ipcLog = "error" | "vital" | "default"