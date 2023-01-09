import argparse
import os
import diffusers
from torch import autocast
import torch
import sys
# get rid of the warnings
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)


def println(str):
    print(str)
    sys.stdout.flush()


parser = argparse.ArgumentParser(description="Generate poni pics.")
parser.add_argument("--scale", type=float,
                    help='scale, default to 7.5', default=7.5)
parser.add_argument("--steps", type=int,
                    help='iteration steps, default to 40', default=40)
parser.add_argument("--height", type=int,
                    help='image height, must be multiples of 32, default to 512', default=512)
parser.add_argument("--width", type=int,
                    help='image width, must be multiples of 32, default to 512', default=512)
parser.add_argument("--sampler", type=str,
                    help='sampler, default to DDIM', choices=["DDIM", "Euler"], default="DDIM")
parser.add_argument("--seed", type=int,
                    help='Specify a seed for generation', default=-1)
parser.add_argument("--noopt",
                    help='don\'t optimize gpu mem usage, default to False', action="store_false")
parser.add_argument("--outname", type=str,
                    help='set image filename', default="")
parser.add_argument("--listen",
                    help='listen to stdin for prompt, draw on line return', action="store_true")
parser.add_argument('prompt', type=str, nargs='*',
                    help='Prompts to generate image, 77 token(word) limit')
parser.add_argument('--negative', type=str, nargs='*', default="",
                    help='Negative prompt: Will not be considered by AI while generating img, 77 token(word) limit')

args = parser.parse_args()
# println(args)

# thanks to the great and powerful great firewall
# nvm i can just store the model locally
# os.environ["http_proxy"] = "127.0.0.1:7890"
# os.environ["https_proxy"] = "127.0.0.1:7890"

rootPath = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), "..")

model_id = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), "pony-model")

tempPath = os.path.join(rootPath, "temp")

os.makedirs(tempPath, exist_ok=True)
device = "cuda"

if args.sampler == "DDIM":
    sampler = diffusers.DDIMScheduler(
        beta_start=0.00085,
        beta_end=0.012,
        beta_schedule="scaled_linear",
        clip_sample=False,
        set_alpha_to_one=False,
        steps_offset=1,
    )
elif args.sampler == "Euler":
    sampler = diffusers.EulerDiscreteScheduler(
        beta_start=0.00085,
        beta_end=0.012,
        beta_schedule="scaled_linear",
    )

pipe = diffusers.StableDiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    revision="main",
    scheduler=sampler,
)

# disable nsfw checker cuz it'shit
pipe.safety_checker = lambda images, clip_input: (images, False)

pipe = pipe.to(device)

# pipp-sized gpu mem optim
# disable if ur mem is average height (8GiB+)
if args.noopt:
    # pipe.enable_sequential_cpu_offload()
    # pipe.enable_xformers_memory_efficient_attention()
    pipe.enable_attention_slicing()
    # pipe.enable_vae_slicing()

# since nodejs doesn't receive tqdm's output for some reason
# probably because it's using unicode control chars to prevent
# \r and \n being printed
pipe.set_progress_bar_config(disable=True)


def drawCallback(step, timestep, latents):
    println(step)


def draw(v, scale, steps, height, width, filename, negative):
    with autocast("cuda"):
        if args.seed == -1:
            image = pipe(v, guidance_scale=scale, num_inference_steps=steps,
                         height=height, width=width, negative_prompt=negative, callback=drawCallback).images[0]
        else:
            generator = torch.Generator(device="cuda").manual_seed(args.seed)
            image = pipe(v, generator=generator, guidance_scale=scale, num_inference_steps=steps,
                         height=height, width=width, negative_prompt=negative, callback=drawCallback).images[0]

        if filename == "":
            image.save(os.path.join(tempPath, v+".png"))
        else:
            image.save(os.path.join(tempPath, filename+".png"))

# rem: 77 tokens limit


# my oc, informaly known as "Sawtooth Soundgoodizer"
# v = "cool ((((solo)))) ((male)) (((pegasus))) with (white skin dark blue short mane cyan iris) wearing sunglasses looking at you smiling highly detailed portrait realistic illustration high resolution {profile pic} awesome {{Unreal Engine 8K}}"

println("ready")
if args.listen:
    while True:
        args = parser.parse_args(input().split())
        prompt = " ".join(args.prompt)
        neg = " ".join(args.negative)
        draw(prompt, args.scale, args.steps,
             args.height, args.width, args.outname, neg)
        println("ready")
else:
    prompt = " ".join(args.prompt)
    neg = " ".join(args.negative)
    draw(prompt, args.scale, args.steps,
         args.height, args.width, args.outname, neg)
