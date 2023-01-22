# Setup - Windows (Recommended)

The setup process can be different depending on which system your host is running, but it shouldn't be much different if you're using a similar system.

## Prerequisites

### Hardware

You need

- 10+ GiB of free disk space to store the models, source code of this website, and generated images.
- A (fast) Internet connection to download software and model
- A faster CPU and larger RAM is always better (8+ GiB of RAM is recommended)

Also, if you want to enable GPU acceleration on Windows, you need a

- Nvidia GPU which supports CUDA with *4+ GiB* VRAM on that card.

> It is suggested that you have 6 GiB or more VRAM to ensure any models can fit into the memory. In my testing with pony-diffusion, I can run this model using 4 GiB VRAM using a few optimizations, but this will not be the case if the model is bigger.

#### Notes

- AMD byebye, ROCm does not support Windows (yet)
- Intel iGPUs byebye (also dGPUs byebye because pytorch does not support oneAPI)

If your card does not meet these requirements, CPU inference is your only choice.

### Software

- If you're using GPU acceleation, it is suggested that you install the latest GPU driver to prevent bizarre compactibility issues and have the maximum performance. For driver installation, google it, it's easy.
- You also need Windows 7/ Windows Server 2008 r2 and up. Windows 10 is recommended.

Also, you need to install

- [Python 3.7 - 3.9](https://www.python.org/downloads/)
- [Node.js v18 and up](https://nodejs.org/en/)
- Git, for cloning the source code

## Setup

Make sure you've installed latest driver for your GPU, and go to these two websites to download and install the latest version (except for python) and click "Next" all the way

IMPORTANT: Note that current version of PyTorch reqiures python 3.9 and below to work. I haven't tested if higher versions would work, so you may have a try and tell me if it works ty.

- [Python 3.7 - 3.9](https://www.python.org/downloads/)
- [Node.js v18 and up](https://nodejs.org/en/)
- [Git](https://git-scm.com/)

> You may also use [Chocolatey](https://chocolatey.org/) to automatically install these packages in cmdline like apt or pacman, but the setup process can be a bit tricky. Google yourself if you want to use that.

Install [Pytorch](https://pytorch.org/get-started/locally/). Go to [this website](https://pytorch.org/get-started/locally/) and select

- "Stable" for PyTorch Build
- "Windows" for Your OS
- "Pip" for Package
- "Python" for language

For Compute Platform:

- If you're using a qualified Nvidia GPU, choose "CUDA". There should be two versions of them, pick the one with bigger number.
- Otherwise, pick "CPU"

Copy the command in "Run this command" and paste into your terminal and run it.

Install dependencies for stable diffusion. Open command prompt and throw this thingy into it

```cmd
pip install transformers diffusers accelerate
```

(Optional) Install [xformers](https://github.com/facebookresearch/xformers) to improve efficiency and memory usage.

> xformers does not have released binary for Pip (yet), in their doc, the correct way to install it is to compile it from source code. However, you will very likely to encounter an error caused by NTFS's 260 character restriction. Frankly, there are [prebuilts](https://github.com/facebookresearch/xformers/actions/runs/3566916718) on Github from the official repo so you may give it a shot. Note that these prebuilts may not be the latest version.

Go to [this website](https://github.com/facebookresearch/xformers/actions/runs/3566916718) and scroll to "Artifacts" section. From there you'll see a bunch of .whl files, pick one that best fits your setup in this order

1) os
2) python version
3) torch version
4) cuda version

Download the .whl file, and install it with pip. For example I'm installing for Python 3.9, PyTorch 1.13.0, and CUDA 11.7.

> Replace path/to/download/folder to where your downloaded file locates

```cmd
pip install path/to/download/folder/xformers-windows-2019-py3.9-torch1.13.0+cu117.whl
```

[Download](https://github.com/GrieferPig/PonAImager-WebUI/archive/refs/heads/main.zip) the source code of this project and unzip it to somewhere, and install dependencies for this project

```bash
cd PATH/TO/UNzippED/FOLDER
npm i
cd frontend
npm i
```

If you're using GPU acceleration or you want to enable some optimizations (they're off by default), refer to [Configure](Configure) section to see all available options for configuration.

Aaaaaaand done! Now you should be able to draw AI pics but hold on a second...

## Pre-flight check (Recommended)

PonAImager also has a CLI interface written in Python, which can be found in `src/pytorch.py`. It is recommended to test your setup with this script first since it also downloads models from the Internet, which can be a really long process. Once the model is downloaded, it is cached on the disk so you won't need to download it again.

Run this command to see the available arguments.

```cmd
cd PATH/TO/UNzippED/FOLDER/src
python pytorch.py -h
```

You will see an output like this

```bash
usage: pytorch.py [-h] [--scale SCALE] [--steps STEPS] [--height HEIGHT] [--width WIDTH] [--seed SEED] [--outname OUTNAME] [--listen] [--oa] [--os] [--ov] [--ox] [--device DEVICE]
                  --modelId MODELID [--revision REVISION] [--proxy PROXY] [--disableChecker] [--negative [NEGATIVE ...]]
                  [prompt ...]
```

For example, this command will download [AstraliteHeart/pony-diffusion](https://huggingface.co/AstraliteHeart/pony-diffusion) and generate an image with a prompt of "test" with xformer enabled using GPU acceleration.

```cmd
python pytorch.py --modelId "AstraliteHeart/pony-diffusion" --device "CUDA" --ox test
```

Here's another example running a local model under the folder "good-model" running on CPU with a prompt of "hi mom"

```cmd
python pytorch.py --modelId "good-model" hi mom
```

For more information about the arguments, see [CLI Interface](CLI-Interface).

## Launching the server

You've now have all dependencies installed, it's time to launch the server! Run this in your terminal

```cmd
cd PATH/TO/UNzippED/FOLDER/
npm run dryStart
```

If there's no errors, congratulations! Your server is ready on [127.0.0.1](http://127.0.0.1)! If there's an error, please google it or post a issue in the project's repository.
