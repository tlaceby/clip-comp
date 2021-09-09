type CompressionResolution = "1280x720" | "1920x1080";
type CompressionSpeed = "veryslow" | "slow" | "medium" | "fast" | "veryfast";

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

interface FileDetails {
    name: string,
    size_mb: string,
    size: number,
    path: string,
    ext: string,
    mime: string
}


type CompressorUpdateEvents = "/work-update/starting-new"|  "/work-update/one-done" | "/work-update/all-done";