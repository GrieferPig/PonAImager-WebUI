# Setup - (GNU/)Linux

The setup process can be different depending on which system your host is running, but it shouldn't be much different if you're using a similar system.

## Prerequisites

### Hardware

You need

- 10+ GiB of free disk space to store the models, source code of this website, and generated images.
- A (fast) Internet connection to download software and model
- A faster CPU and larger RAM is always better (8+ GiB of RAM is recommended)
- Patience. Linux is not that easy to deal with.

Also, if you want to enable GPU acceleration on Linux, you need either a

- Nvidia GPU which supports CUDA
- AMD GPU which supports ROCm (pre-RX cards are not supported)

**AND**  *4+ GiB* VRAM on that card.

> It is suggested that you have 6 GiB or more VRAM to ensure any models can fit into the memory. In my testing with pony-diffusion, I can run this model using 4 GiB VRAM using a few optimizations, but this will not be the case if the model is bigger.

#### Notes

- AMD Vega APUS needs a modified driver to work. The driver is available somewhere on the Internet, but it's strongly discouraged to use APUS since it's not a best practice to use a modified driver, and their performance are way too *puny* to run this task.
- Intel iGPUs are definitely not supported.

If your card does not meet these requirements, CPU inference is your only choice.

### Software

- If you're using GPU acceleation, it is suggested that you install the latest GPU driver to prevent bizarre compactibility issues and have the maximum performance. For driver installation, google it, it's easy. (actually not on Linux since finding an appropriate driver for the correct kernel can be a headache, that's why I recommend Windows if you want to use GPU acceleration)
- You also need a Linux distributions that use glibc >= v2.17. Run `ldd --version` to see the version you're running.

> Fun fact: If your distro is newer than 2015 then 99% it is good. For example, you can even run this on Ubuntu 13.04 (and ofc nobody will)

Also, you need to install

- [Python 3.7 and up](https://www.python.org/downloads/)
- [Node.js v18 and up](https://nodejs.org/en/)
- Git, for cloning the source code

## Setup

Make sure you've installed latest driver for your GPU, and paste these into your terminal.

```bash
sudo apt-get install curl python3 python-is-python3 python-pip git -y
```

Install Node.js using NodeSource PPA,

```bash
curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh && sudo apt install nodejs -y
```

> Your system is likely to ship with a preinstalled Python. You may want to check the version of that since current version of Pytorch does not support Python under version 3.7. Run `python --version` to see the version of Python you installed. If it's below 3.7, google how to update Python for your distro.

Install [Pytorch](https://pytorch.org/get-started/locally/). Go to [this website](https://pytorch.org/get-started/locally/) and select

- "Stable" for PyTorch Build
- "Linux" for Your OS
- "Pip" for Package
- "Python" for language

Compute Platform is a tricky one:

- If you're using a qualified Nvidia GPU, choose "CUDA". There should be two versions of them, pick the one with bigger number.
- If you're using a qualified AMD GPU (which is unlikely), pick the one with "ROCm"
- If you don't have both, pick "CPU"

Copy the command in "Run this command" and paste into your terminal and run it.

Install dependencies for stable diffusion

> (Optional) use `sudo ln /usr/bin/pip /usr/bin/pipp` for best experience and make you smol (jk)

```bash
pip install transformers diffusers accelerate
```

(Optional) Install [xformers](https://github.com/facebookresearch/xformers) to improve efficiency and memory usage. xformers does not have binary for Pip (yet), so you'll have to compile it from source code.

```bash
pip install ninja
pip install -v -U git+https://github.com/facebookresearch/xformers.git@main#egg=xformers
```

Clone the source code of this project into your home directory, and install dependencies for this project

```bash
cd ~
git clone https://github.com/GrieferPig/PonAImager-WebUI.git
cd PonAImager-WebUI
npm i
cd frontend
npm i
```

If you're using GPU acceleration or you want to enable some optimizations (they're off by default), refer to [Configure](Configure) section to see all available options for configuration.

Aaaaaaand done! Now you should be able to draw AI pics but hold on a second...

## Pre-flight check (Recommended)

PonAImager also has a CLI interface written in Python, which can be found in `src/pytorch.py`. It is recommended to test your setup with this script first since it also downloads models from the Internet, which can be a really long process. Once the model is downloaded, it is cached on the disk so you won't need to download it again.

Run this command to see the available arguments.

```bash
cd ~/PonAImager-WebUI/src
python3 pytorch.py -h
```

You will see an output like this

```bash
usage: pytorch.py [-h] [--scale SCALE] [--steps STEPS] [--height HEIGHT] [--width WIDTH] [--seed SEED] [--outname OUTNAME] [--listen] [--oa] [--os] [--ov] [--ox] [--device DEVICE]
                  --modelId MODELID [--revision REVISION] [--proxy PROXY] [--disableChecker] [--negative [NEGATIVE ...]]
                  [prompt ...]
```

For example, this command will download [AstraliteHeart/pony-diffusion](https://huggingface.co/AstraliteHeart/pony-diffusion) and generate an image with a prompt of "test" with xformer enabled using GPU acceleration.

```bash
python3 pytorch.py --modelId "AstraliteHeart/pony-diffusion" --device "CUDA" --ox test
```

Here's another example running a local model under the folder "good-model" running on CPU with a prompt of "hi mom"

```bash
python3 pytorch.py --modelId "good-model" hi mom
```

For more information about the arguments, see [CLI Interface](CLI-Interface).

## A smol fix

Since Linux does not allow non-root processes to listen to port 80, we need to use [this workaround on StackOverflow](https://stackoverflow.com/questions/6109089/how-do-i-run-node-js-on-port-80), which will redirect port 8080 to port 80. Run

```bash
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
```

and modify the value of "http-port" in your config.json to 8080 [see here for details about config.json](Configure).

## Launching the server

You've now have all dependencies installed, it's time to launch the server! Run this in your terminal

```bash
cd ~/PonAImager/
npm run dryStart
```

If there's no errors, congratulations! Your server is ready on [127.0.0.1](http://127.0.0.1)! If there's an error, please google it or post a issue in the project's repository.
