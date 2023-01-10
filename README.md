# PonAImager

A web UI for Stable Diffusion similiar to [stable-diffusion-ui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) but with a modern design and much LESS options because I am a noob and I don't know what does they do.
doc wip

im not going serious on this proj i use this proj to get hands on express framework and vuejs so dont expect (any) further maintenance once this proj is finished

## Setup

- https://pytorch.org/get-started/locally/ (u need 3.7-3.9 on win)
- pip install transformers diffusers accelerate ninja
- pip install -v -U git+https://github.com/facebookresearch/xformers.git@main#egg=xformers

## Args

- [] prompts (77 tokens limit)
- [] steps(10-60)
- [] height&width (max 512x768)
- [] sampler(txt2img, ddim/klms)
- [] seed
- [] strength(img2img)
- [] scale (img2img)

refer to [this guide](https://cdn.discordapp.com/attachments/704107851421057114/1034605063567573002/Tutorial_for_purplesmart_V0.2.1.pdf)