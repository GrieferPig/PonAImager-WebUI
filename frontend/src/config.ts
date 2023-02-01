export interface ServerConfig {
    web: Web
    render: Render
}

export interface Web {
    https: Https
    "http-port": number
    "https-port": number
    compression: Compression
}

export interface Https {
    use: boolean
    pem: string
    key: string
    strict: boolean
}

export interface Compression {
    use: boolean
    level: number
}

export interface Render {
    optimizations: Optimizations
    "render-device": string
    maximum: Maximum
    minimum: Minimum
    defaults: Default
    watermark: Watermark
    "banned-tokens": any[]
    "banned-negative-tokens": any[]
    "image-expire-time": number
    "model-id": string
    revision: string
    "download-proxy": string
    "disable-nsfw-checker": boolean
    "random-prompt-list": string[]
}

export interface Optimizations {
    "sequential-cpu-offload": boolean
    xformers: boolean
    "attention-slicing": boolean
    "vae-slicing": boolean
}

export interface Maximum {
    steps: number
    scale: number
    height: number
    width: number
    "token-length": number
}

export interface Minimum {
    steps: number
    scale: number
    height: number
    width: number
}

export interface Default {
    steps: number
    scale: number
    height: number
    width: number
}

export interface Watermark {
    use: boolean
    force: boolean
    text: string
}
