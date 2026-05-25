#!/usr/bin/env python3
"""
SIGAPP GeoAI Map Generator

Renames the 10 approved spatial map images and generates 10 remote
sensing map images for SIGAPP. Both image families use zoom 11, 5x5
OSM tiles, deterministic overlays, and unclipped in-image legends.
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
DARK_OVERLAY_SPATIAL = (13, 33, 55, 180)
DARK_OVERLAY_REMOTE = (8, 18, 40, 200)
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

REMOTE_LEGEND_ITEMS = [
    ((255, 200, 50), "Night-time Lights (VIIRS)"),
    ((34, 120, 60), "NDVI Vegetasi (Sentinel-2)"),
    ((59, 130, 246), "Flood Risk Zone (JRC)"),
    ((220, 80, 30), "Built-up Change (GEE)"),
    ((139, 92, 246), "Catchment Boundary"),
    ((255, 255, 255), "Titik Sekolah"),
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


def get_vars_remote(i):
    return {
        "night_dn": 15 + i * 5,
        "flood_op": 0.20 + i * 0.025,
        "ndvi": 0.25 + i * 0.055,
        "builtup_op": 0.15 + i * 0.022,
        "catchment_r": 180 + i * 12,
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


def apply_dark_overlay(img, overlay_color=DARK_OVERLAY_SPATIAL):
    overlay = Image.new("RGBA", img.size, overlay_color)
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


def draw_night_light_rs(draw, cx, cy, dn):
    max_r = int(70 + (dn / 63) * 110)
    for r in range(max_r, 0, -4):
        t = r / max_r
        alpha = int((1 - t ** 1.5) * (dn / 63) * 130)
        gold_r = int(20 + (1 - t) * 235)
        gold_g = int(15 + (1 - t) * 170)
        gold_b = int(50 - (1 - t) * 35)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                     fill=(gold_r, gold_g, gold_b, alpha))


def draw_ndvi(draw, cx, cy, ndvi_val):
    r = int(30 + ndvi_val * 60)
    g = int(80 + ndvi_val * 100)
    alpha = int(25 + ndvi_val * 35)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                 fill=(20, g, 40, alpha))


def draw_ndvi_rs(draw, cx, cy, ndvi_val, seed):
    rng = random.Random(seed + 700)
    ox = cx + int(rng.uniform(-30, 30))
    oy = cy + int(rng.uniform(-25, 25))
    rx = int(80 + ndvi_val * 90)
    ry = int(60 + ndvi_val * 70)
    g = int(90 + ndvi_val * 100)
    alpha = int(40 + ndvi_val * 55)
    draw.ellipse([ox - rx, oy - ry, ox + rx, oy + ry],
                 fill=(15, g, 35, alpha))
    draw.ellipse([ox - rx // 2, oy - ry // 2, ox + rx // 2, oy + ry // 2],
                 fill=(20, min(g + 40, 255), 50, min(alpha + 20, 255)))


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


def draw_flood_rs(draw, cx, cy, flood_op, seed):
    rng = random.Random(seed + 500)
    ox = cx + int(rng.uniform(50, 110))
    oy = cy + int(rng.uniform(35, 80))
    rx = int(70 + rng.random() * 55)
    ry = int(45 + rng.random() * 40)
    alpha = int(flood_op * 255)
    draw.ellipse([ox - rx, oy - ry, ox + rx, oy + ry],
                 fill=(59, 130, 246, alpha))
    draw.ellipse([ox - rx, oy - ry, ox + rx, oy + ry],
                 outline=(120, 180, 255, min(alpha + 60, 255)),
                 width=2)
    ox2 = ox + int(rng.uniform(20, 50))
    oy2 = oy + int(rng.uniform(-20, 20))
    rx2, ry2 = rx // 3, ry // 3
    draw.ellipse([ox2 - rx2, oy2 - ry2, ox2 + rx2, oy2 + ry2],
                 fill=(59, 130, 246, max(alpha - 20, 0)))


def draw_builtup(draw, cx, cy, builtup_op, seed):
    rng = random.Random(seed + 900)
    ox = cx + int(rng.uniform(-60, 60))
    oy = cy + int(rng.uniform(-50, 50))
    max_r = int(45 + rng.random() * 40)
    for r in range(max_r, 0, -3):
        t = r / max_r
        alpha = int((1 - t) * builtup_op * 200)
        red_r = int(180 + (1 - t) * 75)
        red_g = int(60 + (1 - t) * 60)
        draw.ellipse([ox - r, oy - r, ox + r, oy + r],
                     fill=(red_r, red_g, 20, alpha))


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


def draw_catchment_rs(draw, cx, cy, radius):
    circumference = int(2 * math.pi * radius)
    for k in range(0, circumference, 16):
        angle = (k / circumference) * 2 * math.pi
        angle2 = ((k + 8) / circumference) * 2 * math.pi
        x1 = int(cx + radius * math.cos(angle))
        y1 = int(cy + radius * math.sin(angle))
        x2 = int(cx + radius * math.cos(angle2))
        y2 = int(cy + radius * math.sin(angle2))
        draw.line([(x1, y1), (x2, y2)],
                  fill=(139, 92, 246, 120), width=1)


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


def draw_school_info(draw, school, fonts):
    text_shadow(draw, (20, 20), school["name"],
                fill=(255, 255, 255, 230), font=fonts["bold_15"])
    text_shadow(draw, (20, 38), f"Kab. {school['kab']} - NTT",
                fill=(148, 163, 184, 210), font=fonts["reg_11"])
    text_shadow(draw, (20, 53), f"{school['lat']:.4f}, {school['lon']:.4f}",
                fill=(74, 222, 128, 190), font=fonts["mono_9"])


def draw_spatial_badge(draw, school, fonts):
    tier_color = TIER_COLORS[school["tier"]]
    badge = [580, 12, 790, 60]
    draw_panel(draw, badge, fill=(*tier_color, 25),
               outline=(*tier_color, 180), radius=7, width=2)
    draw.text((592, 17), "SIGAPP Index",
              fill=(*tier_color, 185), font=fonts["small_9"])
    draw.text((592, 32), f"{school['index']:.2f}   {school['tier']}",
              fill=(*tier_color, 255), font=fonts["bold_14"])


def draw_rs_badge(draw, fonts):
    color = (6, 182, 212)
    badge = [540, 12, 790, 60]
    draw_panel(draw, badge, fill=(*color, 20),
               outline=(*color, 180), radius=7, width=2)
    draw.text((555, 17), "Remote Sensing - GEE",
              fill=(*color, 185), font=fonts["small_9"])
    draw.text((555, 32), "SIGAPP GeoAI v1.2",
              fill=(*color, 255), font=fonts["bold_14"])


def draw_bottom_bar(draw, fonts):
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


def draw_ui(draw, school, fonts):
    draw_school_info(draw, school, fonts)
    draw_spatial_badge(draw, school, fonts)
    draw_bottom_bar(draw, fonts)


def draw_ui_remote(draw, school, fonts):
    draw_school_info(draw, school, fonts)
    draw_rs_badge(draw, fonts)
    draw_bottom_bar(draw, fonts)


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


def draw_legend_rs(draw, fonts):
    lx, ly = 614, 300
    width = 176
    height = 192
    draw.rectangle([lx, ly, lx + width, ly + height],
                   fill=(13, 33, 55, 218),
                   outline=(51, 65, 85, 200), width=1)
    draw.text((lx + 10, ly + 8), "LAYER LEGEND",
              fill=(71, 85, 105, 220), font=fonts["mono_9"])

    for j, (color, label) in enumerate(REMOTE_LEGEND_ITEMS):
        y = ly + 28 + j * 26
        draw.ellipse([lx + 10, y + 1, lx + 20, y + 11],
                     fill=(*color, 255))
        draw.text((lx + 26, y), label,
                  fill=(203, 213, 225, 225), font=fonts["small_9"])


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


def rename_spatial_maps():
    print("[RENAME] Spatial maps")
    renamed = []
    for i in range(1, 11):
        old_path = OUTPUT_DIR / f"map_{i:02d}.png"
        new_path = OUTPUT_DIR / f"map_s_{i:02d}.png"
        if new_path.exists():
            print(f"    [SKIP] {new_path.name} already exists")
            renamed.append(new_path)
            continue
        if old_path.exists():
            old_path.rename(new_path)
            print(f"    [OK] {old_path.name} -> {new_path.name}")
            renamed.append(new_path)
            continue
        raise FileNotFoundError(
            f"Missing spatial source: expected {old_path.name} or {new_path.name}"
        )
    return renamed


def generate_remote_map(i, school, fonts):
    filename = f"map_r_{i + 1:02d}.png"
    print(f"[GEN] {filename} - {school['name']}")

    vars_for_school = get_vars_remote(i)
    seed = make_seed(school, i)

    basemap, school_cx, school_cy = build_basemap(
        school["lat"], school["lon"], zoom=ZOOM, grid=GRID
    )
    base = apply_dark_overlay(basemap, DARK_OVERLAY_REMOTE)

    overlay_img = Image.new("RGBA", base.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay_img)

    draw_ndvi_rs(overlay_draw, school_cx, school_cy,
                 vars_for_school["ndvi"], seed)
    draw_night_light_rs(overlay_draw, school_cx, school_cy,
                        vars_for_school["night_dn"])
    draw_flood_rs(overlay_draw, school_cx, school_cy,
                  vars_for_school["flood_op"], seed)
    draw_builtup(overlay_draw, school_cx, school_cy,
                 vars_for_school["builtup_op"], seed)
    draw_catchment_rs(overlay_draw, school_cx, school_cy,
                      vars_for_school["catchment_r"])
    draw_school_marker(overlay_draw, school_cx, school_cy)

    result = Image.alpha_composite(base.convert("RGBA"), overlay_img)
    ui_layer = Image.new("RGBA", result.size, (0, 0, 0, 0))
    ui_draw = ImageDraw.Draw(ui_layer)
    draw_ui_remote(ui_draw, school, fonts)
    draw_legend_rs(ui_draw, fonts)
    result = Image.alpha_composite(result, ui_layer)

    output_path = OUTPUT_DIR / filename
    result.convert("RGB").save(output_path, quality=95)
    size = output_path.stat().st_size
    print(f"    [OK] {filename} saved ({CANVAS_W}x{CANVAS_H}, {size:,} bytes)")
    return output_path


def main():
    print("=" * 64)
    print("SIGAPP GeoAI Map Generator")
    print("Split spatial and remote sensing map images")
    print(f"Zoom {ZOOM}, {GRID}x{GRID} tiles, {CANVAS_W}x{CANVAS_H}px output")
    print("=" * 64)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    fonts = load_fonts()

    spatial = []
    generated_remote = []
    for i, school in enumerate(SCHOOLS):
        try:
            if i == 0:
                spatial = rename_spatial_maps()
            generated_remote.append(generate_remote_map(i, school, fonts))
        except Exception as exc:
            print(f"    [FAIL] map_r_{i + 1:02d}.png - {exc}")

    print("=" * 64)
    print(f"[SUMMARY] {len(spatial)}/10 spatial maps ready")
    print(f"[SUMMARY] {len(generated_remote)}/10 remote maps saved to {OUTPUT_DIR}")
    for path in sorted(OUTPUT_DIR.glob("map_*.png")):
        try:
            with Image.open(path) as img:
                print(f"  {path.name}: {img.size[0]}x{img.size[1]}, {path.stat().st_size:,} bytes")
        except Exception as exc:
            print(f"  {path.name}: unreadable ({exc})")
    print("=" * 64)

    return 0 if len(spatial) == len(SCHOOLS) and len(generated_remote) == len(SCHOOLS) else 1


if __name__ == "__main__":
    raise SystemExit(main())
