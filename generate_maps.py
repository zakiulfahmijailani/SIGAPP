#!/usr/bin/env python3
"""
SIGAPP GeoAI Map Generator

Regenerates 10 deterministic map overlay images for SIGAPP.
The generator uses zoom 11, 5x5 OSM tiles, compact overlay geometry,
and an unclipped in-image legend.
"""

import math
import os
import random
import time
from datetime import datetime
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFont


SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR / "public" / "school-maps"

ZOOM = 11
TILE_SIZE = 256
GRID = 5
KM_TO_PX = 72
CANVAS_W = 800
CANVAS_H = 500
DARK_OVERLAY = (13, 33, 55, 180)
FALLBACK_TILE = (20, 30, 50, 255)
TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
TILE_HEADERS = {"User-Agent": "SIGAPP-GeoAI-Research/2.0"}
TILE_DELAY_SECONDS = 0.3


SCHOOLS = [
    {"name": "SDN Oesao", "lat": -10.1234, "lon": 123.7891,
     "index": 0.71, "tier": "KRITIS", "kab": "Kupang"},
    {"name": "SMPN 1 Ende", "lat": -8.8511, "lon": 121.6743,
     "index": 0.58, "tier": "TINGGI", "kab": "Ende"},
    {"name": "SDN Maumere 2", "lat": -8.6201, "lon": 122.2198,
     "index": 0.63, "tier": "TINGGI", "kab": "Sikka"},
    {"name": "SMAN Waingapu", "lat": -9.6589, "lon": 120.2701,
     "index": 0.45, "tier": "SEDANG", "kab": "Sumba Timur"},
    {"name": "SDN Labuan Bajo", "lat": -8.4971, "lon": 119.8901,
     "index": 0.39, "tier": "SEDANG", "kab": "Manggarai Barat"},
    {"name": "SMPN Ruteng", "lat": -8.6115, "lon": 120.4712,
     "index": 0.67, "tier": "KRITIS", "kab": "Manggarai"},
    {"name": "SDN Atambua 3", "lat": -9.1089, "lon": 124.8934,
     "index": 0.72, "tier": "KRITIS", "kab": "Belu"},
    {"name": "SMAN Soe", "lat": -9.8634, "lon": 124.2867,
     "index": 0.54, "tier": "TINGGI", "kab": "TTS"},
    {"name": "SDN Bajawa", "lat": -8.7891, "lon": 121.0012,
     "index": 0.61, "tier": "TINGGI", "kab": "Ngada"},
    {"name": "SMPN Lewoleba", "lat": -8.3621, "lon": 123.0089,
     "index": 0.48, "tier": "SEDANG", "kab": "Lembata"},
]

TIER_COLORS = {
    "KRITIS": (239, 68, 68),
    "TINGGI": (249, 115, 22),
    "SEDANG": (234, 179, 8),
    "RENDAH": (34, 197, 94),
}

LEGEND_ITEMS = [
    ((0, 180, 180), "Service Area"),
    ((139, 92, 246), "Catchment Zone"),
    ((245, 158, 11), "Isochrone 30 mnt"),
    ((255, 200, 50), "Night Light"),
    ((59, 130, 246), "Flood Risk Zone"),
    ((34, 120, 60), "NDVI / Vegetasi"),
]

TILE_CACHE = {}


def make_seed(school, i):
    return i * 97 + int(abs(school["lat"]) * 1000) + int(abs(school["lon"]) * 1000)


def get_vars(i):
    return {
        "ring1_px": min(60 + i * 8, 80),
        "ring2_px": min(130 + i * 15, 160),
        "ring3_px": min(220 + i * 18, 260),
        "flood_op": 0.12 + i * 0.022,
        "night_dn": 8 + i * 6,
        "ndvi": 0.22 + i * 0.058,
        "iso_amp": 0.45 + i * 0.04,
    }


def lat_lon_to_tile(lat, lon, zoom):
    n = 2 ** zoom
    x = int((lon + 180) / 360 * n)
    y = int((1 - math.log(
        math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))
    ) / math.pi) / 2 * n)
    return x, y


def lat_lon_to_tile_float(lat, lon, zoom):
    n = 2 ** zoom
    x = (lon + 180) / 360 * n
    y = (1 - math.log(
        math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))
    ) / math.pi) / 2 * n
    return x, y


def fetch_tile(z, x, y):
    key = (z, x, y)
    if key in TILE_CACHE:
        return TILE_CACHE[key].copy()

    url = TILE_URL.format(z=z, x=x, y=y)
    tile = None
    try:
        response = requests.get(url, headers=TILE_HEADERS, timeout=8)
        if response.status_code == 200:
            tile = Image.open(BytesIO(response.content)).convert("RGBA")
        else:
            print(f"    [WARN] Tile {z}/{x}/{y} returned HTTP {response.status_code}; using fallback.")
    except Exception as exc:
        print(f"    [WARN] Tile {z}/{x}/{y} failed: {exc}; using fallback.")
    finally:
        time.sleep(TILE_DELAY_SECONDS)

    if tile is None:
        tile = Image.new("RGBA", (TILE_SIZE, TILE_SIZE), FALLBACK_TILE)

    TILE_CACHE[key] = tile.copy()
    return tile


def build_basemap(lat, lon, zoom=ZOOM, grid=GRID):
    center_tx, center_ty = lat_lon_to_tile(lat, lon, zoom)
    half = grid // 2
    origin_tx = center_tx - half
    origin_ty = center_ty - half

    full = Image.new("RGBA", (grid * TILE_SIZE, grid * TILE_SIZE), FALLBACK_TILE)
    for dy in range(grid):
        for dx in range(grid):
            tx = origin_tx + dx
            ty = origin_ty + dy
            tile = fetch_tile(zoom, tx, ty)
            full.paste(tile, (dx * TILE_SIZE, dy * TILE_SIZE))

    fx, fy = lat_lon_to_tile_float(lat, lon, zoom)
    school_px = int((fx - origin_tx) * TILE_SIZE)
    school_py = int((fy - origin_ty) * TILE_SIZE)

    left = school_px - CANVAS_W // 2
    top = school_py - CANVAS_H // 2
    right = left + CANVAS_W
    bottom = top + CANVAS_H

    if left < 0 or top < 0 or right > full.width or bottom > full.height:
        padded = Image.new("RGBA", (CANVAS_W, CANVAS_H), FALLBACK_TILE)
        src_left = max(0, left)
        src_top = max(0, top)
        src_right = min(full.width, right)
        src_bottom = min(full.height, bottom)
        dst_left = max(0, -left)
        dst_top = max(0, -top)
        if src_right > src_left and src_bottom > src_top:
            padded.paste(full.crop((src_left, src_top, src_right, src_bottom)),
                         (dst_left, dst_top))
        school_cx = school_px - left
        school_cy = school_py - top
        return padded, school_cx, school_cy

    cropped = full.crop((left, top, right, bottom))
    school_cx = school_px - left
    school_cy = school_py - top
    return cropped, school_cx, school_cy


def apply_dark_overlay(img):
    overlay = Image.new("RGBA", img.size, DARK_OVERLAY)
    return Image.alpha_composite(img.convert("RGBA"), overlay)


def draw_night_light(draw, cx, cy, dn):
    max_r = int(40 + (dn / 63) * 70)
    for r in range(max_r, 0, -3):
        t = r / max_r
        alpha = int((1 - t) * (dn / 63) * 90)
        gold_r = int(30 + (1 - t) * 225)
        gold_g = int(20 + (1 - t) * 180)
        gold_b = int(60 - (1 - t) * 40)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                     fill=(gold_r, gold_g, gold_b, alpha))


def draw_ndvi(draw, cx, cy, ndvi_val):
    r = int(30 + ndvi_val * 60)
    g = int(80 + ndvi_val * 100)
    alpha = int(25 + ndvi_val * 35)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                 fill=(20, g, 40, alpha))


def draw_flood(draw, cx, cy, flood_op, seed):
    rng = random.Random(seed + 500)
    ox = cx + int(rng.uniform(40, 90))
    oy = cy + int(rng.uniform(30, 70))
    rx = int(55 + rng.random() * 45)
    ry = int(40 + rng.random() * 35)
    alpha = int(flood_op * 255)
    draw.ellipse([ox - rx, oy - ry, ox + rx, oy + ry],
                 fill=(59, 130, 246, alpha),
                 outline=(100, 160, 255, min(alpha + 40, 255)),
                 width=1)


def draw_rings(draw, cx, cy, r1, r2, r3):
    configs = [
        (r3, (100, 116, 139, 18), (100, 116, 139, 90), 1),
        (r2, (139, 92, 246, 30), (139, 92, 246, 150), 1),
        (r1, (0, 180, 180, 55), (0, 180, 180, 200), 2),
    ]
    for r, fill, outline, width in configs:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                     fill=fill, outline=outline, width=width)


def draw_dashed_line(draw, start, end, color, dash=8, gap=5, width=2):
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    total = math.hypot(dx, dy)
    if total <= 0:
        return
    ux = dx / total
    uy = dy / total
    pos = 0
    while pos < total:
        seg_end = min(pos + dash, total)
        draw.line([
            (int(x1 + ux * pos), int(y1 + uy * pos)),
            (int(x1 + ux * seg_end), int(y1 + uy * seg_end)),
        ], fill=color, width=width)
        pos += dash + gap


def draw_isochrone(draw, cx, cy, base_r, amp, seed):
    rng = random.Random(seed + 200)
    n_pts = 18
    road_dirs = [rng.uniform(0, 2 * math.pi) for _ in range(3)]
    points = []

    for k in range(n_pts):
        angle = (2 * math.pi * k / n_pts) - math.pi / 2
        jitter = amp + rng.random() * (1 - amp)
        radius = base_r * jitter
        for road_dir in road_dirs:
            diff = abs(angle - road_dir) % (2 * math.pi)
            diff = min(diff, 2 * math.pi - diff)
            if diff < 0.5:
                radius *= 1.3 + rng.random() * 0.4
        radius = min(radius, base_r * 1.8)
        points.append((
            int(cx + radius * math.cos(angle)),
            int(cy + radius * math.sin(angle)),
        ))

    draw.polygon(points, fill=(245, 158, 11, 38),
                 outline=(245, 158, 11, 120))
    for k in range(n_pts):
        if k % 2 == 0:
            draw.line([points[k], points[(k + 1) % n_pts]],
                      fill=(245, 158, 11, 200), width=2)


def draw_infra_lines(draw, cx, cy, seed):
    rng = random.Random(seed + 300)
    endpoints = [
        (cx + int(rng.uniform(-140, 140)), cy + int(rng.uniform(-100, 100))),
        (cx + int(rng.uniform(-120, 120)), cy + int(rng.uniform(-90, 90))),
    ]
    colors = [(34, 197, 94, 220), (234, 179, 8, 200)]
    for endpoint, color in zip(endpoints, colors):
        draw_dashed_line(draw, (cx, cy), endpoint, color, dash=8, gap=5, width=2)
        ex, ey = endpoint
        draw.ellipse([ex - 5, ey - 5, ex + 5, ey + 5],
                     fill=color[:3] + (255,))


def draw_school_marker(draw, cx, cy):
    for r, alpha in [(28, 30), (22, 55), (16, 100), (11, 160)]:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                     outline=(167, 139, 250, alpha), width=2)
    draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5],
                 fill=(255, 255, 255, 255),
                 outline=(167, 139, 250, 255), width=2)


def first_font(paths, size):
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()


def load_fonts():
    regular_paths = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    bold_paths = [
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    mono_paths = [
        "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/cour.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/System/Library/Fonts/Menlo.ttc",
    ]
    return {
        "bold_15": first_font(bold_paths, 15),
        "bold_14": first_font(bold_paths, 14),
        "reg_11": first_font(regular_paths, 11),
        "small_10": first_font(regular_paths, 10),
        "small_9": first_font(regular_paths, 9),
        "mono_9": first_font(mono_paths, 9),
    }


def text_shadow(draw, xy, text, fill, font, shadow=(0, 0, 0, 190)):
    x, y = xy
    draw.text((x + 1, y + 1), text, fill=shadow, font=font)
    draw.text((x, y), text, fill=fill, font=font)


def draw_panel(draw, box, fill, outline, radius=6, width=1):
    if hasattr(draw, "rounded_rectangle"):
        draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)
    else:
        draw.rectangle(box, fill=fill, outline=outline, width=width)


def draw_ui(draw, school, fonts):
    text_shadow(draw, (20, 20), school["name"],
                fill=(255, 255, 255, 230), font=fonts["bold_15"])
    text_shadow(draw, (20, 38), f"Kab. {school['kab']} - NTT",
                fill=(148, 163, 184, 210), font=fonts["reg_11"])
    text_shadow(draw, (20, 53), f"{school['lat']:.4f}, {school['lon']:.4f}",
                fill=(74, 222, 128, 190), font=fonts["mono_9"])

    tier_color = TIER_COLORS[school["tier"]]
    badge = [580, 12, 790, 60]
    draw_panel(draw, badge, fill=(*tier_color, 25),
               outline=(*tier_color, 180), radius=7, width=2)
    draw.text((592, 17), "SIGAPP Index",
              fill=(*tier_color, 185), font=fonts["small_9"])
    draw.text((592, 32), f"{school['index']:.2f}   {school['tier']}",
              fill=(*tier_color, 255), font=fonts["bold_14"])

    draw.rectangle([0, CANVAS_H - 22, CANVAS_W, CANVAS_H],
                   fill=(8, 18, 35, 220))
    run_time = datetime.now().strftime("%H:%M WIB")
    footer = f"SIGAPP GeoAI v1.2  -  Agent Run: {run_time}  -  Simulasi Deterministik"
    draw.text((10, CANVAS_H - 15), footer,
              fill=(71, 85, 105, 225), font=fonts["mono_9"])

    draw.ellipse([544, CANVAS_H - 14, 552, CANVAS_H - 6],
                 fill=(34, 197, 94, 255))
    draw.text((558, CANVAS_H - 16), "LIVE",
              fill=(34, 197, 94, 210), font=fonts["mono_9"])


def draw_legend(draw, fonts):
    lx, ly = 614, 300
    width = 176
    height = 172
    draw.rectangle([lx, ly, lx + width, ly + height],
                   fill=(13, 33, 55, 218),
                   outline=(51, 65, 85, 200), width=1)
    draw.text((lx + 10, ly + 8), "LAYER LEGEND",
              fill=(71, 85, 105, 220), font=fonts["mono_9"])

    for j, (color, label) in enumerate(LEGEND_ITEMS):
        y = ly + 28 + j * 23
        draw.ellipse([lx + 10, y + 1, lx + 20, y + 11],
                     fill=(*color, 255))
        draw.text((lx + 26, y), label,
                  fill=(203, 213, 225, 225), font=fonts["small_10"])


def generate_map(i, school, fonts):
    filename = f"map_{i + 1:02d}.png"
    print(f"[GEN] {filename} - {school['name']}")

    vars_for_school = get_vars(i)
    seed = make_seed(school, i)

    basemap, school_cx, school_cy = build_basemap(
        school["lat"], school["lon"], zoom=ZOOM, grid=GRID
    )
    base = apply_dark_overlay(basemap)

    overlay_img = Image.new("RGBA", base.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay_img)

    draw_night_light(overlay_draw, school_cx, school_cy, vars_for_school["night_dn"])
    draw_ndvi(overlay_draw, school_cx, school_cy, vars_for_school["ndvi"])
    draw_flood(overlay_draw, school_cx, school_cy,
               vars_for_school["flood_op"], seed)
    draw_rings(overlay_draw, school_cx, school_cy,
               vars_for_school["ring1_px"],
               vars_for_school["ring2_px"],
               vars_for_school["ring3_px"])
    draw_isochrone(overlay_draw, school_cx, school_cy,
                   vars_for_school["ring2_px"],
                   vars_for_school["iso_amp"], seed)
    draw_infra_lines(overlay_draw, school_cx, school_cy, seed)
    draw_school_marker(overlay_draw, school_cx, school_cy)

    result = Image.alpha_composite(base.convert("RGBA"), overlay_img)
    ui_layer = Image.new("RGBA", result.size, (0, 0, 0, 0))
    ui_draw = ImageDraw.Draw(ui_layer)
    draw_ui(ui_draw, school, fonts)
    draw_legend(ui_draw, fonts)
    result = Image.alpha_composite(result, ui_layer)

    output_path = OUTPUT_DIR / filename
    result.convert("RGB").save(output_path, quality=95)
    size = output_path.stat().st_size
    print(f"    [OK] {filename} saved ({CANVAS_W}x{CANVAS_H}, {size:,} bytes)")
    return output_path


def main():
    print("=" * 64)
    print("SIGAPP GeoAI Map Generator")
    print(f"Zoom {ZOOM}, {GRID}x{GRID} tiles, {CANVAS_W}x{CANVAS_H}px output")
    print("=" * 64)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    fonts = load_fonts()

    generated = []
    for i, school in enumerate(SCHOOLS):
        try:
            generated.append(generate_map(i, school, fonts))
        except Exception as exc:
            print(f"    [FAIL] map_{i + 1:02d}.png - {exc}")

    print("=" * 64)
    print(f"[SUMMARY] {len(generated)}/10 maps saved to {OUTPUT_DIR}")
    for path in sorted(OUTPUT_DIR.glob("map_*.png")):
        try:
            with Image.open(path) as img:
                print(f"  {path.name}: {img.size[0]}x{img.size[1]}, {path.stat().st_size:,} bytes")
        except Exception as exc:
            print(f"  {path.name}: unreadable ({exc})")
    print("=" * 64)

    return 0 if len(generated) == len(SCHOOLS) else 1


if __name__ == "__main__":
    raise SystemExit(main())
