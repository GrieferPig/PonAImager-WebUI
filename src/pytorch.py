import torch
from torch import autocast
from diffusers import StableDiffusionPipeline, DDIMScheduler

# thanks to the great and powerful great firewall
import os
os.environ["http_proxy"] = "127.0.0.1:7890"
os.environ["https_proxy"] = "127.0.0.1:7890"

# from accelerate import Accelerator
model_id = "AstraliteHeart/pony-diffusion"
# 默认使用cpu渲染。如果有支持cuda或者rocm的设备，可以注释掉cpu改成cuda
device = "cuda"
# accelerator = Accelerator()
# device = "cpu"
pipe = StableDiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    revision="main",
    scheduler=DDIMScheduler(
        beta_start=0.00085,
        beta_end=0.012,
        beta_schedule="scaled_linear",
        clip_sample=False,
        set_alpha_to_one=False,
    ),
)
#disable nsfw checker
pipe.safety_checker = lambda images, clip_input: (images, False)
pipe = pipe.to(device)

# small gpu mem optim
pipe.enable_attention_slicing()

def draw_list(prompt_list, steps, height, width):
    for i, v in enumerate(prompt_list):
        draw(v, steps, height, width)


def draw(v, steps, height, width):
    with autocast("cuda"):
        image = pipe(v, guidance_scale=7.5, num_inference_steps=steps, height=height, width=width).images[0]
        image.save(v+".png")

# 这里是prompt列表 可以批量渲染
# g5小马的训练集应该不大所以别想啦（呜呜我的pipp
# 建议用g4的mane 6效果最佳（因为图最多）
# 每个prompt都有77个token（单词）的限制
# 尽量不要用太抽象的词 越具体越好

prompt_list = [
    "lyra heartstring sitting on bench smooth sharp focus green background smiling waving",
    "zephyr heights at dawn landscape highly detailed concept art sharp",
    "misty and opaline laughing at sunny starscout focus sharp cartoon style simple",
    "rara singing on concert veil intricate highly detailed digital painting artstation concept art smooth sharp focus illustration Unreal Engine 5 8K",
    "rara singing on concert",
    "rara",
    # since this is trained based on derpibooru's tagz
    "pony milestone transparent background tragedy portrait hi res suggestive",
    "amogus wide putin rickroll gas gas gas 28 stab wounds meme",  # wat nsfw?
    "evil unicorn twilight sparkle portrait close up veil intricate highly detailed digital painting artstation concept art smooth sharp focus illustration Unreal Engine 5 8K",
    "storm king and tempest sitting talking in a cave while raining highly detailed intricate oil painting blurry",
    "transgender rainbow dash crying 2d smooth sharp white background picasso style simple color", ]

# my oc, informaly known as "Sawtooth Soundgoodizer"
v = "cool pegasus colt with white skin dark blue short mane cyan iris wearing sunglasses looking at you smiling highly detailed portrait realistic illustration high resolution avatar awesome" 

draw(v, 50, 512, 512)