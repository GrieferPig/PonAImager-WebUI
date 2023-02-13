#!/usr/bin/python3

import argparse
import os
import diffusers
from torch import autocast
import torch
import sys
import time

from PIL import Image, ImageDraw, ImageFont

# get rid of the warnings
import warnings

warnings.simplefilter(action="ignore", category=FutureWarning)


def println(str):
    print(str)
    sys.stdout.flush()


parser = argparse.ArgumentParser(description="Generate poni pics.")
parser.add_argument("--scale", type=float, help="scale, default to 7.5", default=7.5)
parser.add_argument(
    "--steps", type=int, help="iteration steps, default to 50", default=50
)
parser.add_argument(
    "--height",
    type=int,
    help="image height, must be multiples of 32, default to 512",
    default=512,
)
parser.add_argument(
    "--width",
    type=int,
    help="image width, must be multiples of 32, default to 512",
    default=512,
)
parser.add_argument(
    "--seed", type=int, help="Specify a seed for generation", default=-1
)
parser.add_argument("--outname", type=str, help="set image filename", default="")
parser.add_argument(
    "--listen",
    help="listen to stdin for prompt, draw on line return",
    action="store_true",
)
parser.add_argument("--oa", help="Enable attention-slicing", action="store_true")
parser.add_argument("--os", help="Enable sequential-cpu-offload", action="store_true")
parser.add_argument("--ov", help="Enable vae-slicing", action="store_true")
parser.add_argument(
    "--ox", help="Enable xformers (require a xformers install)", action="store_true"
)
parser.add_argument(
    "--device", type=str, help="set inference device, default to cpu", default="cpu"
)
parser.add_argument(
    "--modelId", type=str, help="Model ID/Path", default="", required=True
)
parser.add_argument(
    "--revision",
    type=str,
    help="Branch of the Model to be used, default to main",
    default="main",
)
parser.add_argument(
    "--proxy", type=str, help="Proxy used to download model", default=""
)
parser.add_argument(
    "--disableChecker", help="Disable nsfw checker", action="store_true"
)
parser.add_argument(
    "prompt",
    type=str,
    nargs="*",
    help="Prompts to generate image, 77 token(word) limit",
)
parser.add_argument(
    "--negative",
    type=str,
    nargs="*",
    default="",
    help="Negative prompt: Will less likely to be considered by AI while generating image, 77 token(word) limit",
)
parser.add_argument(
    "--watermark", type=str, nargs="*", help="Add a watermark", default=""
)

renderParser = argparse.ArgumentParser()
renderParser.add_argument(
    "--scale", type=float, help="scale, default to 7.5", default=7.5
)
renderParser.add_argument(
    "--steps", type=int, help="iteration steps, default to 50", default=50
)
renderParser.add_argument(
    "--height",
    type=int,
    help="image height, must be multiples of 32, default to 512",
    default=512,
)
renderParser.add_argument(
    "--width",
    type=int,
    help="image width, must be multiples of 32, default to 512",
    default=512,
)
renderParser.add_argument(
    "--seed", type=int, help="Specify a seed for generation", default=-1
)
renderParser.add_argument(
    "--outname", type=str, help="set image filename", default="", required=True
)
renderParser.add_argument(
    "prompt",
    type=str,
    nargs="*",
    help="Prompts to generate image, 77 token(word) limit",
)
renderParser.add_argument(
    "--negative",
    type=str,
    nargs="*",
    default="",
    help="Negative prompt: Will not be considered by AI while generating img, 77 token(word) limit",
)
renderParser.add_argument(
    "--watermark", type=str, nargs="*", help="Add a watermark", default=""
)

args = parser.parse_args()
# println(args)

# thanks to the great and powerful great firewall
# nvm i can just store the model locally
if args.proxy != "":
    os.environ["http_proxy"] = args.proxy
    os.environ["https_proxy"] = args.proxy
    println("Using proxy " + args.proxy)

rootPath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

# model_id = os.path.join(os.path.dirname(
#     os.path.abspath(__file__)), "pony-model")

model_id = args.modelId

tempPath = os.path.join(rootPath, "temp")

os.makedirs(tempPath, exist_ok=True)
device = args.device

sampler = diffusers.DDIMScheduler(
    beta_start=0.00085,
    beta_end=0.012,
    beta_schedule="scaled_linear",
    clip_sample=False,
    set_alpha_to_one=False,
    steps_offset=1,
)

println(
    "Using model " + model_id + " revision " + args.revision + " running on " + device
)

torchType = torch.float16

if device == "cpu":
    torchType = torch.bfloat16
    println("Using CPU, using bf16 instead of fp16")

pipe = diffusers.StableDiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torchType,
    revision=args.revision,
    scheduler=sampler,
)

# disable nsfw checker cuz it'shit
if args.disableChecker:
    pipe.safety_checker = lambda images, clip_input: (images, False)
    # I would be genuinely suprised if they followed this rule which is stated in the eula
    println(
        "Disabled safety checker. Please ensure you use this feature to only generate appropriate images."
    )

pipe = pipe.to(device)

# pipp-sized gpu mem optim
# disable if ur mem is average height (8GiB+)
# no acturally use this if u have xformers installed
if args.oa:
    pipe.enable_attention_slicing()
    println("Attension slicing is enabled")

if args.os:
    pipe.enable_sequential_cpu_offload()
    println("Sequential CPU offload is enabled")

if args.ox:
    pipe.enable_xformers_memory_efficient_attention()
    println("Xformers is enabled")

if args.ov:
    pipe.enable_vae_slicing()
    println("VAE slicing is enabled")

# since nodejs doesn't receive tqdm's output for some reason
# probably because it's using unicode control chars to prevent
# \r and \n being printed
pipe.set_progress_bar_config(disable=True)


def drawCallback(step, timestep, latents):
    println(step)


def draw(v, scale, steps, height, width, filename, negative):
    with autocast(device):
        if args.seed == -1:
            image = pipe(
                v,
                guidance_scale=scale,
                num_inference_steps=steps,
                height=height,
                width=width,
                negative_prompt=negative,
                callback=drawCallback,
            ).images[0]
        else:
            generator = torch.Generator(device=device).manual_seed(args.seed)
            image = pipe(
                v,
                generator=generator,
                guidance_scale=scale,
                num_inference_steps=steps,
                height=height,
                width=width,
                negative_prompt=negative,
                callback=drawCallback,
            ).images[0]

        if args.watermark != "":
            text = " ".join(args.watermark)
            image = watermark(image, text)

        if filename == "":
            image.save(os.path.join(tempPath, v + ".png"))
        else:
            image.save(os.path.join(tempPath, filename + ".png"))


# rem: 77 tokens limit


font = ImageFont.truetype(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "Adventure.ttf"),
    20,
    index=0,
)


def watermark(image, text):
    rgba_image = image.convert("RGBA")
    text_overlay = Image.new("RGBA", rgba_image.size, (255, 255, 255, 0))
    image_draw = ImageDraw.Draw(text_overlay)

    image_draw.text((8, 8), text, font=font, fill=(255, 255, 255, 225))

    return Image.alpha_composite(rgba_image, text_overlay)


# my oc, informaly known as "Sawtooth Soundgoodizer"
# v = "cool ((((solo)))) ((male)) (((pegasus))) with (white skin dark blue short mane cyan iris) wearing sunglasses looking at you smiling highly detailed portrait realistic illustration high resolution {profile pic} awesome {{Unreal Engine 8K}}"

# NodeJS: Hey Python wait up!
time.sleep(0.1)

# TODO: Investigate on this problem (maybe call zipp she might be useful)
println("ready")
if args.listen:
    while True:
        args = renderParser.parse_args(input().split())
        prompt = " ".join(args.prompt)
        neg = " ".join(args.negative)
        draw(prompt, args.scale, args.steps, args.height, args.width, args.outname, neg)
        println("ready")
else:
    if args.outname == "":
        # c'mon rarity is not like that
        # TODO: write better dialog
        println(
            "I'd love to generate images for you darling, but it's simply dreadful if you don't say where to put my fabulous artwork to."
        )
        println(
            "Oh and by the way, my dear, you may specify what name the image should be by using --outname yourfrickingimage.png, and it will appear in the temp folder after a while."
        )
        sys.exit(101)  # lol
    prompt = " ".join(args.prompt)
    neg = " ".join(args.negative)
    draw(prompt, args.scale, args.steps, args.height, args.width, args.outname, neg)
