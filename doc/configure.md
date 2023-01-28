# Configure

The configuration file is albeit optional, but recommended to create before the program's first run. Using a custom configuration file may increase efficiency and uses the full potential of your hardware.

To create a configuration file, simply duplicate the example.json and rename it to config.json. The values in example.json are default values taken by the program, you may edit them to fit your setup and needs. You may also remove entries in this config to be replaced by defaults once the config is loaded.

## Options

### web

#### https

##### use

Use HTTPS instead of HTTP (require fields "pem" and "key")

> Boolean, default: false

##### pem

Certificate used by HTTPS

> String, default: ""

##### key

Private key used by HTTPS

> String, default: ""

##### strict

Use strict header in responds to prevent cross-origin attacks

> Boolean, default: false

#### http-port

Port number to listen with HTTP protocol

> Number, default: 80

#### https-port

Port number to listen with HTTPS protocol

> Number, default: 443

#### compression

##### use

Use compression to save bandwidth (require more CPU power)

> Boolean, default: true

##### level

Compression level (0-9, 0=fastest, no compression)

> Number, default: 9

### render

#### optimizations

##### sequential-cpu-offload

Use sequential CPU offload optimization

> Boolean, default: false

##### xformers

Use xformers (require a xformers install)

> Boolean, default: false

##### attention-slicing

Use attention slicing optimization (save RAM)

> Boolean, default: false

##### vae-slicing

Use VAE slicing optimization (save RAM)

> Boolean, default: false

#### render-device

Device used for inference ("cpu","cuda","mpu"...)

> String, default: "cpu"

#### maximum

##### steps

Maximum steps

> Number, default: 50

##### scale

Maximum scale

> Number, default: 15

##### height

Maximum height

> Number, default: 512

##### width

Maximum width

> Number, default: 512

##### token-length

Maximum length of tokens

> Number, default: 77

#### minimum

##### steps

Minimum steps

> Number, default: 15

##### scale

Minimum scale

> Number, default: 0

##### height

Minimum height

> Number, default: 64

##### width

Minimum width

> Number, default: 64

#### defaults

##### steps

Default steps

> Number, default: 50

##### scale

Default scale

> Number, default: 7.5

##### height

Default height

> Number, default: 512

##### width

Default width

> Number, default: 512

#### watermark

##### use

Use watermark on generated images

> Boolean, default: false

##### force

Force to use the value in "use", override user's choice

> Boolean, default: true

##### text

Text of the watermark

> String, default: "Generated By PonAImager"

#### banned-tokens

Tokens banned from positive prompt

> String array, default: []

#### banned-negative-tokens

Tokens banned from negative prompt

> String array, default: []

#### image-expire-time

How long does the image expire

> Number, default: 30

#### model-id

The model ID (on HuggingFace) / local path to use (Local path is relative to the directory your shell is in)

> String, default: "AstraliteHeart/pony-diffusion"

#### revision

Branch name of the model

> String, default "main"

#### download-proxy

HTTP(S) proxy to use while downloading model

> String, default: ""

#### disable-nsfw-checker

Disable NSFW checker

> Boolean, default: true