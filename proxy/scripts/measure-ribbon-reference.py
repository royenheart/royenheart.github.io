"""Measure the supplied line sketch without editing its pixels."""

import argparse
import json

import numpy as np
from PIL import Image


parser = argparse.ArgumentParser()
parser.add_argument("image")
parser.add_argument("--circle-right-of", type=int, default=700)
args = parser.parse_args()
pixels = np.asarray(Image.open(args.image).convert("RGB"))
dark = pixels.max(axis=2) < 115
ys, xs = np.where(dark)
circle = xs > args.circle_right_of
x, y = xs[circle].astype(float), ys[circle].astype(float)
matrix = np.stack([2 * x, 2 * y, np.ones_like(x)], axis=1)
cx, cy, constant = np.linalg.lstsq(matrix, x * x + y * y, rcond=None)[0]
diameter = 2 * np.sqrt(constant + cx * cx + cy * cy)
long_rows = np.where(dark[:, 20:520].sum(axis=1) > 350)[0]
height = int(long_rows[-1] - long_rows[0])
print(json.dumps({
    "source_dimensions": [pixels.shape[1], pixels.shape[0]],
    "method": "Least-squares circle fit to isolated right-hand dark pixels; horizontal row occupancy for ribbon edges",
    "circle_center": [float(cx), float(cy)],
    "cover_diameter": float(diameter),
    "horizontal_edge_rows": long_rows.tolist(),
    "ribbon_height": height,
    "ribbon_to_cover_ratio": float(height / diameter),
    "center_offset_to_cover_ratio": float(((long_rows[0] + long_rows[-1]) / 2 - cy) / diameter),
}, indent=2))
