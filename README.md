# PonAImager

A web UI for Stable Diffusion similiar to [stable-diffusion-ui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) but with a modern design and much LESS options because I am a noob and I don't know what does they do.
doc wip

im not going serious on this proj i use this proj to get hands on express framework and vuejs so dont expect (any) further maintenance once this proj is finished

## Setup

- ensure latest nvidia driver
- https://pytorch.org/get-started/locally/ (u need 3.7-3.9 on win)
- pip install transformers diffusers accelerate ninja
- pip install -v -U git+https://github.com/facebookresearch/xformers.git@main#egg=xformers
- nodejs v18+
- npm i (backend+frontend)
- npm run dryStart

## Args

- [] prompts (77 tokens limit)
- [] steps(10-60)
- [] height&width (max 512x768)
- [] sampler(txt2img, ddim/klms)
- [] seed
- [] strength(img2img)
- [] scale (img2img)

refer to [this guide](https://cdn.discordapp.com/attachments/704107851421057114/1034605063567573002/Tutorial_for_purplesmart_V0.2.1.pdf)

# License info

(Adapted from [pony-diffusion](https://huggingface.co/AstraliteHeart/pony-diffusion))

## License

This model is open access and available to all, with a CreativeML OpenRAIL-M license further specifying rights and usage. The CreativeML OpenRAIL License specifies:

- You can't use the model to deliberately produce nor share illegal or harmful outputs or content
- The authors claims no rights on the outputs you generate, you are free to use them and are accountable for their use which must not go against the provisions set in the license
- You may re-distribute the weights and use the model commercially and/or as a service. If you do, please be aware you have to include the same use restrictions as the ones in the license and share a copy of the CreativeML OpenRAIL-M to all your users (please read the license entirely and carefully) [Please read the full license here](https://huggingface.co/spaces/CompVis/stable-diffusion-license)

## Downstream Uses

This model can be used for entertainment purposes and as a generative art assistant.


