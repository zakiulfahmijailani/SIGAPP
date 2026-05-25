#!/usr/bin/env python3
"""
SIGAPP GeoAI Map Generator
Generates 10 professional map overlay images for pitching presentation.
Each map shows a different school in NTT with GeoAI analysis overlays.
"""

import math
import os
import random
import sys
import time
from datetime import datetime
from io import BytesIO

import numpy as np
from PIL import Image, ImageDraw, ImageFont
import requests

# ─── OUTPUT CONFIG ──────────────────────────────────────────────────
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "school-maps")
IMG_W, IMG_H = 800, 500
ZOOM = 13
TILE_SIZE = 256
KM_TO_PX = 290  # pixels per km at zoom 13
TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
TILE_HEADERS = {"User-Agent": "SIGAPP-GeoAI-Research/1.0"}
DARK_BG = (13, 33, 55)  # #0D2137
FALLBACK_TILE_COLOR = (26, 39, 68)  # #1a2744

# ─── SCHOOL DATA ────────────────────────────────────────────────────
SCHOOLS = [
    {"name": "SDN Oesao",       "lat": -10.1234, "lon": 123.7891,
     "index": 0.71, "tier": "KRITIS",  "kabupaten": "Kupang"},
    {"name": "SMPN 1 Ende",     "lat": -8.8511,  "lon": 121.6743,
     "index": 0.58, "tier": "TINGGI",  "kabupaten": "Ende"},
    {"name": "SDN Maumere 2",   "lat": -8.6201,  "lon": 122.2198,
     "index": 0.63, "tier": "TINGGI",  "kabupaten": "Sikka"},
    {"name": "SMAN Waingapu",   "lat": -9.6589,  "lon": 120.2701,
     "index": 0.45, "tier": "SEDANG",  "kabupaten": "Sumba Timur"},
    {"name": "SDN Labuan Bajo", "lat": -8.4971,  "lon": 119.8901,
     "index": 0.39, "tier": "SEDANG",  "kabupaten": "Manggarai Barat"},
    {"name": "SMPN Ruteng",     "lat": -8.6115,  "lon": 120.4712,
     "index": 0.67, "tier": "KRITIS",  "kabupaten": "Manggarai"},
    {"name": "SDN Atambua 3",   "lat": -9.1089,  "lon": 124.8934,
     "index": 0.72, "tier": "KRITIS",  "kabupaten": "Belu"},
    {"name": "SMAN Soe",        "lat": -9.8634,  "lon": 124.2867,
     "index": 0.54, "tier": "TINGGI",  "kabupaten": "Timor Tengah Selatan"},
    {"name": "SDN Bajawa",      "lat": -8.7891,  "lon": 121.0012,
     "index": 0.61, "tier": "TINGGI",  "kabupaten": "Ngada"},
    {"name": "SMPN Lewoleba",   "lat": -8.3621,  "lon": 123.0089,
     "index": 0.48, "tier": "SEDANG",  "kabupaten": "Lembata"},
]

# ─── TIER COLORS ────────────────────────────────────────────────────
TIER_COLORS = {
    "KRITIS": (239, 68, 68),
    "TINGGI": (249, 115, 22),
    "SEDANG": (234, 179, 8),
    "RENDAH": (34, 197, 94),
}

# ─── LEGEND ITEMS ───────────────────────────────────────────────────
LEGEND_ITEMS = [
    ((0, 180, 180),   "Service Area"),
    ((139, 92, 246),  "Catchment Zone"),
    ((245, 158, 11),  "Isochrone 30 mnt"),
    ((255, 200, 0),   "Night Light"),
    ((59, 130, 246),  "Flood Risk Zone"),
    ((34, 197, 94),   "NDVI / Vegetasi"),
]


# ═══════════════════════════════════════════════════════════════════
# TILE / COORDINATE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════

def lat_lon_to_tile(lat, lon, zoom):
    n = 2 ** zoom
    x = int((lon + 180) / 360 * n)
    y = int((1 - math.log(math.tan(math.radians(lat)) +
             1 / math.cos(math.radians(lat))) / math.pi) / 2 * n)
    return x, y


def latlon_to_pixel(lat, lon, zoom, origin_tx, origin_ty, tile_size=256):
    n = 2 ** zoom
    px = (lon + 180) / 360 * n * tile_size
    py = (1 - math.log(math.tan(math.radians(lat)) +
          1 / math.cos(math.radians(lat))) / math.pi) / 2 * n * tile_size
    ox = origin_tx * tile_size
    oy = origin_ty * tile_size
    return int(px - ox), int(py - oy)


def fetch_tile(z, x, y):
    """Fetch a single OSM tile. Returns PIL Image or None on failure."""
    url = TILE_URL.format(z=z, x=x, y=y)
    try:
        resp = requests.get(url, headers=TILE_HEADERS, timeout=10)
        if resp.status_code == 200:
            return Image.open(BytesIO(resp.content)).convert("RGBA")
    except Exception as e:
        print(f"    [WARN] Tile fetch failed ({z}/{x}/{y}): {e}")
    return None


def stitch_tiles(lat, lon, zoom):
    """Fetch 3x3 tile grid centered on school, stitch into composite."""
    cx_tile, cy_tile = lat_lon_to_tile(lat, lon, zoom)
    origin_tx = cx_tile - 1
    origin_ty = cy_tile - 1

    composite = Image.new("RGBA", (3 * TILE_SIZE, 3 * TILE_SIZE),
                          (*FALLBACK_TILE_COLOR, 255))

    for dx in range(-1, 2):
        for dy in range(-1, 2):
            tx = cx_tile + dx
            ty = cy_tile + dy
            tile_img = fetch_tile(zoom, tx, ty)
            if tile_img is None:
                # Use fallback solid color
                tile_img = Image.new("RGBA", (TILE_SIZE, TILE_SIZE),
                                     (*FALLBACK_TILE_COLOR, 255))
            px_x = (dx + 1) * TILE_SIZE
            px_y = (dy + 1) * TILE_SIZE
            composite.paste(tile_img, (px_x, px_y))
            time.sleep(0.15)  # Be polite to OSM servers

    # Get school pixel position in composite
    school_px, school_py = latlon_to_pixel(lat, lon, zoom, origin_tx, origin_ty)

    # Crop center 800x500 centered on school
    left = school_px - IMG_W // 2
    top = school_py - IMG_H // 2

    # Create padded image if crop goes outside composite bounds
    result = Image.new("RGBA", (IMG_W, IMG_H), (*DARK_BG, 255))

    # Calculate source and destination rectangles
    src_left = max(0, left)
    src_top = max(0, top)
    src_right = min(composite.width, left + IMG_W)
    src_bottom = min(composite.height, top + IMG_H)

    dst_left = max(0, -left)
    dst_top = max(0, -top)

    if src_right > src_left and src_bottom > src_top:
        crop = composite.crop((src_left, src_top, src_right, src_bottom))
        result.paste(crop, (dst_left, dst_top))

    # School position in final image
    final_cx = school_px - left
    final_cy = school_py - top

    return result, final_cx, final_cy


def apply_dark_overlay(img):
    """Apply dark semi-transparent overlay for GeoAI aesthetic."""
    dark = Image.new("RGBA", img.size, (13, 33, 55, 160))
    return Image.alpha_composite(img, dark)


# ═══════════════════════════════════════════════════════════════════
# DRAWING HELPERS
# ═══════════════════════════════════════════════════════════════════

def draw_hollow_circle(img, cx, cy, radius, color, border_color, border_width):
    """Draw a hollow circle with fill and border on an RGBA image."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
    d.ellipse(bbox, fill=color)
    d.ellipse(bbox, outline=border_color, width=border_width)
    return Image.alpha_composite(img, overlay)


def make_isochrone(cx, cy, base_radius_px, amplitude, seed):
    """Generate 12-point jittered isochrone polygon."""
    rng = random.Random(seed)
    points = []
    for k in range(12):
        angle = (2 * math.pi * k / 12) - math.pi / 2
        jitter = amplitude + rng.random() * (1 - amplitude)
        r = base_radius_px * jitter
        px = cx + r * math.cos(angle)
        py = cy + r * math.sin(angle)
        points.append((int(px), int(py)))
    return points


def draw_radial_gradient_circle(img, cx, cy, radius, color_rgba):
    """Draw a radial gradient circle by drawing concentric circles."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    r, g, b, max_alpha = color_rgba
    steps = min(radius, 60)  # Limit steps for performance
    for step in range(steps, 0, -1):
        t = step / steps  # 1.0 at edge, approaching 0 at center
        current_r = int(radius * t)
        if current_r < 1:
            continue
        alpha = int(max_alpha * (1 - t) * 0.8)  # Fade from center
        alpha = max(0, min(255, alpha))
        d.ellipse([cx - current_r, cy - current_r,
                   cx + current_r, cy + current_r],
                  fill=(r, g, b, alpha))
    return Image.alpha_composite(img, overlay)


def draw_dashed_line(draw, start, end, color, dash=8, gap=5, width=2):
    """Draw a dashed line between two points."""
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    length = math.sqrt(dx * dx + dy * dy)
    if length < 1:
        return
    ux = dx / length
    uy = dy / length
    pos = 0
    while pos < length:
        seg_end = min(pos + dash, length)
        sx = int(x1 + ux * pos)
        sy = int(y1 + uy * pos)
        ex = int(x1 + ux * seg_end)
        ey = int(y1 + uy * seg_end)
        draw.line([(sx, sy), (ex, ey)], fill=color, width=width)
        pos += dash + gap


def draw_rounded_rect(draw, bbox, radius, fill, outline):
    """Draw a rounded rectangle."""
    x1, y1, x2, y2 = bbox
    # Draw main rectangle body
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)
    # Draw four corners
    draw.pieslice([x1, y1, x1 + 2 * radius, y1 + 2 * radius],
                  180, 270, fill=fill)
    draw.pieslice([x2 - 2 * radius, y1, x2, y1 + 2 * radius],
                  270, 360, fill=fill)
    draw.pieslice([x1, y2 - 2 * radius, x1 + 2 * radius, y2],
                  90, 180, fill=fill)
    draw.pieslice([x2 - 2 * radius, y2 - 2 * radius, x2, y2],
                  0, 90, fill=fill)
    # Draw outline
    draw.arc([x1, y1, x1 + 2 * radius, y1 + 2 * radius],
             180, 270, fill=outline, width=1)
    draw.arc([x2 - 2 * radius, y1, x2, y1 + 2 * radius],
             270, 360, fill=outline, width=1)
    draw.arc([x1, y2 - 2 * radius, x1 + 2 * radius, y2],
             90, 180, fill=outline, width=1)
    draw.arc([x2 - 2 * radius, y2 - 2 * radius, x2, y2],
             0, 90, fill=outline, width=1)
    draw.line([(x1 + radius, y1), (x2 - radius, y1)], fill=outline, width=1)
    draw.line([(x1 + radius, y2), (x2 - radius, y2)], fill=outline, width=1)
    draw.line([(x1, y1 + radius), (x1, y2 - radius)], fill=outline, width=1)
    draw.line([(x2, y1 + radius), (x2, y2 - radius)], fill=outline, width=1)


def text_shadow(draw, pos, text, fill, font, shadow_color=(0, 0, 0, 200)):
    """Draw text with a shadow for readability."""
    x, y = pos
    # Draw shadow at offsets
    for dx, dy in [(1, 1), (1, 0), (0, 1)]:
        draw.text((x + dx, y + dy), text, fill=shadow_color, font=font)
    draw.text(pos, text, fill=fill, font=font)


# ═══════════════════════════════════════════════════════════════════
# FONT SETUP
# ═══════════════════════════════════════════════════════════════════

def get_fonts():
    """Try to load system fonts, fall back to defaults."""
    font_paths = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]

    fonts = {}

    # Try bold font
    bold_loaded = False
    for path in font_paths:
        if "bold" in path.lower() or "Bold" in path or "segoeuib" in path or "arialbd" in path:
            try:
                fonts["bold_16"] = ImageFont.truetype(path, 16)
                fonts["bold_14"] = ImageFont.truetype(path, 14)
                fonts["bold_18"] = ImageFont.truetype(path, 18)
                bold_loaded = True
                break
            except Exception:
                continue

    # Try regular font
    regular_loaded = False
    for path in font_paths:
        if "bold" not in path.lower() and "Bold" not in path and "segoeuib" not in path.lower() and "arialbd" not in path.lower():
            try:
                fonts["regular_12"] = ImageFont.truetype(path, 12)
                fonts["regular_10"] = ImageFont.truetype(path, 10)
                fonts["regular_11"] = ImageFont.truetype(path, 11)
                fonts["regular_14"] = ImageFont.truetype(path, 14)
                regular_loaded = True
                break
            except Exception:
                continue

    # Fallback
    if not bold_loaded:
        default = ImageFont.load_default()
        fonts["bold_16"] = default
        fonts["bold_14"] = default
        fonts["bold_18"] = default

    if not regular_loaded:
        default = ImageFont.load_default()
        fonts["regular_12"] = default
        fonts["regular_10"] = default
        fonts["regular_11"] = default
        fonts["regular_14"] = default

    return fonts


# ═══════════════════════════════════════════════════════════════════
# MAIN MAP GENERATION
# ═══════════════════════════════════════════════════════════════════

def generate_map(i, school, fonts):
    """Generate a single map image for school index i."""
    print(f"  [GEN] map_{i+1:02d}.png for {school['name']}...")

    # -- Per-school variation parameters --
    ring1_km = 0.8 + i * 0.12
    ring2_km = 2.2 + i * 0.25
    ring3_km = 5.0 + i * 0.45

    flood_opacity = 0.12 + i * 0.025
    night_dn = 8 + i * 6
    ndvi_val = 0.22 + i * 0.06
    isochrone_amp = 0.55 + i * 0.045

    # ── Step 1: Fetch and stitch tiles ──
    print(f"    [TILE] Fetching OSM tiles (zoom={ZOOM})...")
    base, cx, cy = stitch_tiles(school["lat"], school["lon"], ZOOM)

    # Clamp center point to image bounds
    cx = max(50, min(IMG_W - 50, cx))
    cy = max(50, min(IMG_H - 50, cy))

    # ── Step 2: Apply dark overlay ──
    base = apply_dark_overlay(base)

    # ── Step 3: Create overlay layer for all geo-layers ──
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))

    # ── Layer 5: NDVI Overlay (bottom) ──
    ndvi_radius = int((1.5 + ndvi_val * 1.8) * KM_TO_PX)
    ndvi_g = int(80 + ndvi_val * 120)
    ndvi_alpha = int(40 + ndvi_val * 60)
    ndvi_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ndvi_draw = ImageDraw.Draw(ndvi_layer)
    ndvi_draw.ellipse([cx - ndvi_radius, cy - ndvi_radius,
                       cx + ndvi_radius, cy + ndvi_radius],
                      fill=(20, ndvi_g, 40, ndvi_alpha))
    overlay = Image.alpha_composite(overlay, ndvi_layer)

    # ── Layer 4: Flood Risk Zone ──
    flood_radius = int((2.5 + i * 0.35) * KM_TO_PX)
    flood_alpha = int(flood_opacity * 255)
    flood_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    flood_draw = ImageDraw.Draw(flood_layer)
    flood_outline_alpha = min(255, flood_alpha + 60)
    flood_draw.ellipse([cx - flood_radius, cy - flood_radius,
                        cx + flood_radius, cy + flood_radius],
                       fill=(59, 130, 246, flood_alpha),
                       outline=(59, 130, 246, flood_outline_alpha),
                       width=2)
    overlay = Image.alpha_composite(overlay, flood_layer)

    # ── Layer 3: Night Light Halo ──
    nl_radius = int((1.2 + (night_dn / 63) * 2.8) * KM_TO_PX)
    nl_opacity = int(30 + (night_dn / 63) * 80)
    nl_r = int(30 + (night_dn / 63) * 225)
    nl_g = int(20 + (night_dn / 63) * 195)
    nl_b = int(60 + (night_dn / 63) * (-50))
    nl_b = max(0, nl_b)
    overlay = draw_radial_gradient_circle(overlay, cx, cy, nl_radius,
                                          (nl_r, nl_g, nl_b, nl_opacity))

    # ── Layer 1: Service Area Rings ──
    # Ring 3 (outermost) — Slate
    r3 = int(ring3_km * KM_TO_PX)
    overlay = draw_hollow_circle(overlay, cx, cy, r3,
                                  (100, 116, 139, 20),
                                  (100, 116, 139, 80), 1)
    # Ring 2 — Purple
    r2 = int(ring2_km * KM_TO_PX)
    overlay = draw_hollow_circle(overlay, cx, cy, r2,
                                  (139, 92, 246, 35),
                                  (139, 92, 246, 140), 1)
    # Ring 1 (innermost) — Cyan
    r1 = int(ring1_km * KM_TO_PX)
    overlay = draw_hollow_circle(overlay, cx, cy, r1,
                                  (0, 180, 180, 60),
                                  (0, 180, 180, 180), 2)

    # ── Layer 2: Isochrone Polygon ──
    iso_radius = int(ring2_km * KM_TO_PX * 0.75)
    iso_points = make_isochrone(cx, cy, iso_radius, isochrone_amp, seed=i * 37)
    iso_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    iso_draw = ImageDraw.Draw(iso_layer)
    iso_draw.polygon(iso_points, fill=(245, 158, 11, 46))
    # Draw border segments
    for k in range(len(iso_points)):
        p1 = iso_points[k]
        p2 = iso_points[(k + 1) % len(iso_points)]
        draw_dashed_line(iso_draw, p1, p2, (245, 158, 11, 180),
                         dash=8, gap=5, width=2)
    overlay = Image.alpha_composite(overlay, iso_layer)

    # ── Layer 6: Infrastructure Polylines ──
    infra_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    infra_draw = ImageDraw.Draw(infra_layer)
    rng = random.Random(i * 91)
    infra_colors = [(34, 197, 94, 200), (234, 179, 8, 180)]
    for j, color in enumerate(infra_colors):
        dx = (rng.random() - 0.5) * 180
        dy = (rng.random() - 0.5) * 120
        end_x = int(cx + dx)
        end_y = int(cy + dy)
        draw_dashed_line(infra_draw, (cx, cy), (end_x, end_y),
                         color, dash=8, gap=5, width=2)
        # Dot at endpoint
        dot_r = 5
        infra_draw.ellipse([end_x - dot_r, end_y - dot_r,
                            end_x + dot_r, end_y + dot_r],
                           fill=color[:3] + (255,))
    overlay = Image.alpha_composite(overlay, infra_layer)

    # ── Layer 7: School Marker (center) — ALWAYS ON TOP ──
    marker_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    marker_draw = ImageDraw.Draw(marker_layer)
    # Outer glow rings
    for ring_r, alpha in [(22, 40), (16, 80), (11, 140), (7, 200)]:
        marker_draw.ellipse([cx - ring_r, cy - ring_r,
                             cx + ring_r, cy + ring_r],
                            outline=(167, 139, 250, alpha), width=2)
    # Center dot
    marker_draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5],
                        fill=(255, 255, 255, 255),
                        outline=(167, 139, 250, 255), width=2)
    overlay = Image.alpha_composite(overlay, marker_layer)

    # ── Composite all layers ──
    result = Image.alpha_composite(base, overlay)

    # ── TEXT LABELS (drawn on top) ──
    text_layer = Image.new("RGBA", result.size, (0, 0, 0, 0))
    td = ImageDraw.Draw(text_layer)

    # School name — top-left
    text_shadow(td, (20, 18), school["name"],
                fill=(255, 255, 255, 240), font=fonts["bold_18"])

    # Kabupaten — below name
    kab_text = f"Kab. {school['kabupaten']}"
    text_shadow(td, (22, 42), kab_text,
                fill=(148, 163, 184, 210), font=fonts["regular_12"])

    # Coordinate info
    coord_text = f"{school['lat']:.4f}, {school['lon']:.4f}"
    text_shadow(td, (22, 58), coord_text,
                fill=(100, 116, 139, 180), font=fonts["regular_10"])

    # SIGAPP Index badge — top-right
    tier_color = TIER_COLORS[school["tier"]]
    badge_x1, badge_y1 = 620, 12
    badge_x2, badge_y2 = 785, 58
    draw_rounded_rect(td, (badge_x1, badge_y1, badge_x2, badge_y2),
                      radius=8,
                      fill=(*tier_color, 50),
                      outline=(*tier_color, 180))
    text_shadow(td, (badge_x1 + 14, badge_y1 + 6), "SIGAPP Index",
                fill=(*tier_color, 200), font=fonts["regular_10"])
    index_text = f"{school['index']:.2f}  {school['tier']}"
    text_shadow(td, (badge_x1 + 14, badge_y1 + 22), index_text,
                fill=(*tier_color, 255), font=fonts["bold_14"])

    # Agent run timestamp — bottom
    ts = datetime.now().strftime("%H:%M WIB")
    footer = f"SIGAPP GeoAI v1.2  |  Agent Run: {ts}  |  Simulasi Deterministik"
    text_shadow(td, (20, IMG_H - 28), footer,
                fill=(100, 116, 139, 200), font=fonts["regular_10"])

    # ── LEGEND BOX (bottom-right) ──
    legend_w = 155
    legend_h = len(LEGEND_ITEMS) * 18 + 28
    legend_x = IMG_W - legend_w - 15
    legend_y = IMG_H - legend_h - 35

    # Semi-transparent dark box
    legend_bg = Image.new("RGBA", result.size, (0, 0, 0, 0))
    legend_bg_draw = ImageDraw.Draw(legend_bg)
    draw_rounded_rect(legend_bg_draw,
                      (legend_x, legend_y, legend_x + legend_w, legend_y + legend_h),
                      radius=6,
                      fill=(13, 33, 55, 218),
                      outline=(100, 116, 139, 100))
    text_layer = Image.alpha_composite(text_layer, legend_bg)
    td = ImageDraw.Draw(text_layer)

    # Legend title
    text_shadow(td, (legend_x + 10, legend_y + 6), "LAYER LEGEND",
                fill=(200, 200, 220, 220), font=fonts["regular_10"])

    # Legend items
    for idx, (color, label) in enumerate(LEGEND_ITEMS):
        item_y = legend_y + 24 + idx * 18
        # Color swatch circle
        sw_cx = legend_x + 16
        sw_cy = item_y + 5
        td.ellipse([sw_cx - 4, sw_cy - 4, sw_cx + 4, sw_cy + 4],
                   fill=(*color, 220))
        # Label
        text_shadow(td, (sw_cx + 10, item_y - 1), label,
                    fill=(200, 210, 220, 220), font=fonts["regular_11"])

    # ── Final composite ──
    result = Image.alpha_composite(result, text_layer)

    # ── Save ──
    filename = f"map_{i+1:02d}.png"
    filepath = os.path.join(OUTPUT_DIR, filename)
    result.convert("RGB").save(filepath, quality=95)
    print(f"    [OK] {filename} saved ({IMG_W}x{IMG_H})")
    return filepath


# ═══════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("  SIGAPP GeoAI Map Generator")
    print("  Generating 10 professional map overlays for pitching")
    print("=" * 60)

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"\n[DIR] Output directory: {OUTPUT_DIR}")

    # Load fonts
    print("[FONT] Loading fonts...")
    fonts = get_fonts()

    # Generate all 10 maps
    print(f"\n[MAP] Starting map generation...\n")
    generated = []

    for i, school in enumerate(SCHOOLS):
        try:
            path = generate_map(i, school, fonts)
            generated.append(path)
        except Exception as e:
            print(f"    [X] ERROR generating map for {school['name']}: {e}")
            import traceback
            traceback.print_exc()
        print()

    # Summary
    print("=" * 60)
    if len(generated) == 10:
        print(f"[OK] {len(generated)}/10 maps saved to public/school-maps/")
    else:
        print(f"[WARN] {len(generated)}/10 maps generated (some failed)")
    print("=" * 60)

    return len(generated)


if __name__ == "__main__":
    main()
