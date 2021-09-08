
interface CompressionSettings {
    bitrate: number,
    mute: boolean,
    ext?: string,
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