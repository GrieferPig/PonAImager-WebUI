# CLI Interface

PonAImager also has a CLI interface written in Python, which can be found in `src/pytorch.py`. It is recommended to test your setup with this script first since it also downloads models from the Internet, which can be a really long process. Once the model is downloaded, it is cached on the disk so you won't need to download it again.

> This CLI interface does not use configurations inside config.json

```bash
$ cd ~/PonAIMager/src
$ python3 pytorch.py -h
usage: pytorch.py [-h] [--scale SCALE] [--steps STEPS] [--height HEIGHT] [--width WIDTH] [--seed SEED] [--outname OUTNAME] [--listen] [--oa]
                  [--os] [--ov] [--ox] [--device DEVICE] --modelId MODELID [--revision REVISION] [--proxy PROXY] [--disableChecker]
                  [--negative [NEGATIVE ...]]
                  [prompt ...]

Generate poni pics.
...
```

## Arguments

### Required

```bash
--outname OUTNAME
```

> Type: String

The filename of your output image

---

```bash
--modelId MODELID
```

> Type: String

The model ID (on HuggingFace) / local path to use (Local path is relative to the directory your shell is in)

---

```bash
prompt
```

> Type: String

Prompts to generate image

### Optional

```bash
-h
```

> Type: Switch

Show help message and exit

---

```bash
--scale SCALE
```

> Type: Integer

Scale (how heavily the prompts affect the image), default to 7.5

---

```bash
--steps STEPS
```

> Type: Integer

STEPS (how many iterations does rendered image take), default to 50

---

```bash
--height HEIGHT
```

> Type: Integer

Image height, must be multiples of 32, default to 512

---

```bash
--width WIDTH
```

> Type: Integer

Image width, must be multiples of 32, default to 512

---

```bash
--seed SEED
```

> Type: Integer

Specify a seed for image generation, default to a random seed

---

```bash
--listen
```

> Type: Switch

listen to stdin for prompt, draw on line return

---

```bash
--oa
```

> Type: Switch

Enable attention slicing optimization (save RAM)

---

```bash
--os
```

> Type: Switch

Enable sequential CPU offload optimization

---

```bash
--ov
```

> Type: Switch

Enable VAE slicing optimization

---

```bash
--ox
```

> Type: Switch

Enable xformers optimization (require a xformer install)

---

```bash
--device DEVICE
```

> Type: String

Set inference device, default to CPU ("CPU"|"CUDA"|"MPU"|...)

---

```bash
--revision REVISION
```

> Type: String

Branch name of the model to use

---

```bash
--proxy PROXY
```

> Type: String

Set a http(s) proxy to download

---

```bash
--disableChecker
```

> Type: Switch

Disable NSFW checker

---

```bash
--negative [NEGATIVE ...]
```

> Type: Multi-String

Negative prompt: Will less likely to be considered by AI while generating image

## Example

Here's an example running a local model under the folder "good-model" running on CPU with a prompt of "hi mom", negative prompt of "not you dad" with Xformers optimization on. 35 steps, height=480, width=512, seed=114514

```cmd
python pytorch.py --ox --modelId "good-model" hi mom --negative not you dad --steps 35 --height 480 --width 512 --seed 114514
```

## FAQ

Google is your best friend. If not, post an issue in this repo please. Most of the problems you may encounter are straightforward and easy to solve.
