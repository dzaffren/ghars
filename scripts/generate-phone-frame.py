#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

W, H = 1920, 1080
BEZEL = 22

SCREEN_X, SCREEN_Y = 1105, 118
SCREEN_W, SCREEN_H = 390, 844

PHONE_X = SCREEN_X - BEZEL
PHONE_Y = SCREEN_Y - BEZEL
PHONE_W = SCREEN_W + BEZEL * 2   # 434
PHONE_H = SCREEN_H + BEZEL * 2   # 888

BEZEL_COLOR = (28, 28, 30, 255)
CORNER_RADIUS = 55

img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

d.rounded_rectangle(
    [PHONE_X, PHONE_Y, PHONE_X + PHONE_W, PHONE_Y + PHONE_H],
    radius=CORNER_RADIUS,
    fill=BEZEL_COLOR,
)

# Cut screen area back to transparent
cutout = Image.new('RGBA', (SCREEN_W, SCREEN_H), (0, 0, 0, 0))
img.paste(cutout, (SCREEN_X, SCREEN_Y))

# Dynamic island pill
island_w, island_h = 120, 34
island_x = SCREEN_X + (SCREEN_W - island_w) // 2
island_y = SCREEN_Y + 14
d.rounded_rectangle(
    [island_x, island_y, island_x + island_w, island_y + island_h],
    radius=17,
    fill=BEZEL_COLOR,
)

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'phone-frame.png')
img.save(out)
print(f'saved {out}')
