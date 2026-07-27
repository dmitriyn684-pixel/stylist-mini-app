from __future__ import annotations

import math
import random
import shutil
from functools import lru_cache
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "dimkoff-brandbook-2026-visual-v2.pdf"
PUBLIC = ROOT / "public" / "portfolio" / OUT.name
CASES = ROOT / "brandbook" / "assets" / "cases"
PORTFOLIO = ROOT / "brandbook" / "assets" / "portfolio"
EXPERIENCES = ROOT / "brandbook" / "assets" / "digital-experiences"

W, H = 1400, 788
TOTAL_PAGES = 34

BLACK = HexColor("#080A0E")
BLACK_2 = HexColor("#0D1015")
GRAPHITE = HexColor("#151A22")
PANEL = HexColor("#11161D")
MINT = HexColor("#00FFD1")
MINT_DARK = HexColor("#00B99C")
BLUE = HexColor("#5D8CFF")
WHITE = HexColor("#F4F1EA")
GRAY = HexColor("#969CA7")
GRAY_DARK = HexColor("#4D5561")
GREEN = HexColor("#8FD66B")
GOLD = HexColor("#D8B35E")
RED = HexColor("#FF6B75")
LINE = HexColor("#29313D")

DISPLAY = "DFF-Display"
SEMI = "DFF-Semi"
BODY = "DFF-Body"
MONO = "DFF-Mono"


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(DISPLAY, r"C:\Windows\Fonts\bahnschrift.ttf"))
    pdfmetrics.registerFont(TTFont(SEMI, r"C:\Windows\Fonts\seguisb.ttf"))
    pdfmetrics.registerFont(TTFont(BODY, r"C:\Windows\Fonts\segoeui.ttf"))
    pdfmetrics.registerFont(TTFont(MONO, r"C:\Windows\Fonts\consola.ttf"))


def set_alpha_fill(c: canvas.Canvas, color, alpha: float) -> None:
    c.setFillColor(color)
    c.setFillAlpha(alpha)


def set_alpha_stroke(c: canvas.Canvas, color, alpha: float) -> None:
    c.setStrokeColor(color)
    c.setStrokeAlpha(alpha)


def wrap(value: str, font: str, size: float, width: float) -> list[str]:
    lines: list[str] = []
    for paragraph in value.splitlines() or [""]:
        current = ""
        for word in paragraph.split():
            candidate = f"{current} {word}".strip()
            if not current or pdfmetrics.stringWidth(candidate, font, size) <= width:
                current = candidate
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines


def copy(
    c: canvas.Canvas,
    value: str,
    x: float,
    y: float,
    width: float,
    size: float = 18,
    leading: float | None = None,
    color=WHITE,
    font: str = BODY,
    max_lines: int | None = None,
) -> float:
    leading = leading or size * 1.28
    lines = wrap(value, font, size, width)
    if max_lines:
        lines = lines[:max_lines]
    c.setFont(font, size)
    c.setFillColor(color)
    c.setFillAlpha(1)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def cap(c: canvas.Canvas, value: str, x: float, y: float, color=MINT, size: float = 10) -> None:
    c.setFont(MONO, size)
    c.setFillColor(color)
    c.setFillAlpha(1)
    c.drawString(x, y, value.upper())


def heading(
    c: canvas.Canvas,
    value: str,
    x: float,
    y: float,
    width: float,
    size: float = 58,
    color=WHITE,
    max_lines: int = 3,
) -> float:
    return copy(c, value.upper(), x, y, width, size, size * 0.98, color, DISPLAY, max_lines)


def rule(c: canvas.Canvas, x1: float, y1: float, x2: float, y2: float, color=LINE, alpha=0.8, width=1) -> None:
    c.saveState()
    set_alpha_stroke(c, color, alpha)
    c.setLineWidth(width)
    c.line(x1, y1, x2, y2)
    c.restoreState()


def panel(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    fill=PANEL,
    stroke=LINE,
    radius: float = 8,
    alpha: float = 0.94,
) -> None:
    c.saveState()
    set_alpha_fill(c, fill, alpha)
    set_alpha_stroke(c, stroke, 0.65)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)
    c.restoreState()


@lru_cache(maxsize=32)
def glow_image(red: int, green: int, blue: int, opacity: int) -> Image.Image:
    size = 320
    center = (size - 1) / 2
    alpha_values = []
    for py in range(size):
        for px in range(size):
            distance = math.hypot(px - center, py - center) / center
            strength = max(0.0, 1.0 - distance) ** 2.4
            alpha_values.append(int(opacity * strength))
    alpha_channel = Image.new("L", (size, size))
    alpha_channel.putdata(alpha_values)
    image = Image.new("RGBA", (size, size), (red, green, blue, 0))
    image.putalpha(alpha_channel)
    return image


def glow(c: canvas.Canvas, x: float, y: float, radius: float, color=MINT, alpha: float = 0.16) -> None:
    red = round(color.red * 255)
    green = round(color.green * 255)
    blue = round(color.blue * 255)
    image = glow_image(red, green, blue, round(alpha * 255))
    c.drawImage(ImageReader(image), x - radius, y - radius, radius * 2, radius * 2, mask="auto")


def tile_field(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    page_no: int,
    color=MINT,
    density: int = 12,
    alpha: float = 0.08,
) -> None:
    rng = random.Random(7310 + page_no)
    cell = max(8, w / density)
    rows = int(h / cell) + 2
    cols = int(w / cell) + 2
    c.saveState()
    for row in range(rows):
        for col in range(cols):
            if rng.random() < 0.28:
                continue
            px = x + col * cell + rng.uniform(-1.8, 1.8)
            py = y + row * cell + rng.uniform(-1.8, 1.8)
            inset = rng.uniform(1, 4)
            strength = alpha * rng.uniform(0.25, 1)
            set_alpha_fill(c, color if rng.random() > 0.25 else WHITE, strength)
            c.roundRect(px + inset, py + inset, cell - inset * 2, cell - inset * 2, 2.5, fill=1, stroke=0)
    c.restoreState()


def grain(c: canvas.Canvas, page_no: int, count: int = 780) -> None:
    rng = random.Random(9900 + page_no)
    c.saveState()
    for _ in range(count):
        color = WHITE if rng.random() > 0.18 else MINT
        set_alpha_fill(c, color, rng.uniform(0.012, 0.038))
        c.circle(rng.uniform(0, W), rng.uniform(0, H), rng.uniform(0.25, 0.8), fill=1, stroke=0)
    c.restoreState()


def page_base(c: canvas.Canvas, page_no: int, section: str, *, field: bool = True) -> None:
    c.setFillColor(BLACK)
    c.setFillAlpha(1)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    if field:
        tile_field(c, 0, 0, W, H, page_no, WHITE, 25, 0.025)
    grain(c, page_no)
    cap(c, "DIMKOFF / VISUAL SYSTEM / 2026", 34, H - 25, GRAY, 7.4)
    cap(c, section, 34, 19, GRAY, 7.4)
    cap(c, f"{page_no:02d} / {TOTAL_PAGES:02d}", W - 88, 19, MINT, 7.4)
    rule(c, 34, 33, W - 34, 33, LINE, 0.7, 0.65)


def wordmark(c: canvas.Canvas, x: float, y: float, size: float = 74, color=WHITE) -> None:
    c.setFillColor(color)
    c.setFillAlpha(1)
    c.setFont(DISPLAY, size)
    c.drawString(x, y, "DIMKOFF")
    dot_x = x + pdfmetrics.stringWidth("DIMKOFF", DISPLAY, size) + size * 0.13
    c.setFillColor(MINT if color != MINT else BLACK)
    c.circle(dot_x, y + size * 0.2, max(4, size * 0.075), fill=1, stroke=0)


def mark(c: canvas.Canvas, x: float, y: float, size: float = 100, color=MINT, boxed=True) -> None:
    c.saveState()
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setStrokeAlpha(1)
    c.setFillAlpha(1)
    c.setLineWidth(max(1.5, size * 0.018))
    if boxed:
        c.roundRect(x, y, size, size, size * 0.12, fill=0, stroke=1)
    c.setFont(DISPLAY, size * 0.34)
    c.drawCentredString(x + size / 2, y + size * 0.37, "DFF")
    c.circle(x + size * 0.76, y + size * 0.76, size * 0.04, fill=1, stroke=0)
    c.restoreState()


def selection_frame(c: canvas.Canvas, x: float, y: float, w: float, h: float, color=BLUE) -> None:
    c.saveState()
    set_alpha_stroke(c, color, 1)
    c.setLineWidth(2)
    c.rect(x, y, w, h, fill=0, stroke=1)
    for px, py in ((x, y), (x + w, y), (x, y + h), (x + w, y + h)):
        c.setFillColor(color)
        c.circle(px, py, 8, fill=1, stroke=0)
    c.restoreState()


def pill(c: canvas.Canvas, value: str, x: float, y: float, color=MINT, active=False) -> float:
    size = 8.2
    width = pdfmetrics.stringWidth(value.upper(), MONO, size) + 24
    c.saveState()
    set_alpha_fill(c, color, 1 if active else 0.1)
    set_alpha_stroke(c, color, 0.8)
    c.roundRect(x, y, width, 24, 12, fill=1, stroke=1)
    c.setFillColor(BLACK if active else color)
    c.setFillAlpha(1)
    c.setFont(MONO, size)
    c.drawCentredString(x + width / 2, y + 7.2, value.upper())
    c.restoreState()
    return width


def arrow(c: canvas.Canvas, x1: float, y1: float, x2: float, y2: float, color=MINT) -> None:
    rule(c, x1, y1, x2, y2, color, 0.9, 1.2)
    angle = math.atan2(y2 - y1, x2 - x1)
    c.saveState()
    set_alpha_stroke(c, color, 0.9)
    c.setLineWidth(1.2)
    for offset in (0.45, -0.45):
        c.line(x2, y2, x2 - 10 * math.cos(angle + offset), y2 - 10 * math.sin(angle + offset))
    c.restoreState()


def image_cover(
    c: canvas.Canvas,
    path: Path,
    x: float,
    y: float,
    w: float,
    h: float,
    radius=8,
    focal_x: float = 0.5,
    focal_y: float = 0.5,
) -> None:
    image = Image.open(path).convert("RGB")
    source_ratio = image.width / image.height
    target_ratio = w / h
    if source_ratio > target_ratio:
        new_width = int(image.height * target_ratio)
        left = int((image.width - new_width) * focal_x)
        left = max(0, min(left, image.width - new_width))
        image = image.crop((left, 0, left + new_width, image.height))
    else:
        new_height = int(image.width / target_ratio)
        top = int((image.height - new_height) * focal_y)
        top = max(0, min(top, image.height - new_height))
        image = image.crop((0, top, image.width, top + new_height))
    target_width = max(1, int(w * 1.4))
    target_height = max(1, int(h * 1.4))
    if image.width > target_width or image.height > target_height:
        image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
    c.saveState()
    path_clip = c.beginPath()
    path_clip.roundRect(x, y, w, h, radius)
    c.clipPath(path_clip, fill=0, stroke=0)
    c.drawImage(ImageReader(image), x, y, w, h, mask="auto")
    c.restoreState()
    c.saveState()
    set_alpha_stroke(c, WHITE, 0.15)
    c.roundRect(x, y, w, h, radius, fill=0, stroke=1)
    c.restoreState()


def phone(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, accent=MINT) -> None:
    c.saveState()
    glow(c, x + w / 2, y + h / 2, max(w, h) * 0.65, accent, 0.1)
    set_alpha_fill(c, BLACK_2, 1)
    set_alpha_stroke(c, WHITE, 0.28)
    c.setLineWidth(1.2)
    c.roundRect(x, y, w, h, w * 0.12, fill=1, stroke=1)
    image_cover(c, path, x + 8, y + 9, w - 16, h - 18, w * 0.09)
    c.setFillColor(BLACK)
    c.roundRect(x + w * 0.34, y + h - 18, w * 0.32, 8, 4, fill=1, stroke=0)
    c.restoreState()


def site_desktop_mockup(
    c: canvas.Canvas,
    path: Path,
    x: float,
    y: float,
    w: float,
    h: float,
    title_value: str,
    subtitle: str,
    cta: str,
    accent=MINT,
    focal_x: float = 0.5,
) -> None:
    c.saveState()
    glow(c, x + w * 0.55, y + h * 0.46, h * 0.72, accent, 0.1)
    set_alpha_fill(c, BLACK_2, 1)
    set_alpha_stroke(c, WHITE, 0.24)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=1)
    image_cover(c, path, x + 8, y + 8, w - 16, h - 42, 7, focal_x=focal_x)
    set_alpha_fill(c, BLACK, 0.56)
    c.rect(x + 8, y + 8, (w - 16) * 0.56, h - 42, fill=1, stroke=0)
    set_alpha_fill(c, BLACK_2, 0.98)
    c.roundRect(x + 8, y + h - 34, w - 16, 26, 6, fill=1, stroke=0)
    for index, color in enumerate((RED, GOLD, GREEN)):
        c.setFillColor(color)
        c.circle(x + 23 + index * 12, y + h - 21, 3, fill=1, stroke=0)
    cap(c, "DIMKOFF / CONCEPT", x + 70, y + h - 25, GRAY, 5.8)
    cap(c, "STORY   EXPERIENCE   CONTACT", x + w - 232, y + h - 25, WHITE, 5.4)
    copy(c, title_value, x + 34, y + h - 112, w * 0.47, 29, 30, WHITE, DISPLAY, 3)
    copy(c, subtitle, x + 36, y + h - 205, w * 0.42, 10, 14, WHITE, BODY, 4)
    pill(c, cta, x + 36, y + 43, accent, active=True)
    c.restoreState()


def site_mobile_mockup(
    c: canvas.Canvas,
    path: Path,
    x: float,
    y: float,
    w: float,
    h: float,
    title_value: str,
    cta: str,
    accent=MINT,
    focal_x: float = 0.5,
) -> None:
    c.saveState()
    glow(c, x + w / 2, y + h / 2, h * 0.55, accent, 0.1)
    set_alpha_fill(c, BLACK_2, 1)
    set_alpha_stroke(c, WHITE, 0.34)
    c.setLineWidth(1.2)
    c.roundRect(x, y, w, h, 28, fill=1, stroke=1)
    image_cover(c, path, x + 8, y + 10, w - 16, h - 20, 22, focal_x=focal_x)
    set_alpha_fill(c, BLACK, 0.58)
    c.roundRect(x + 8, y + 10, w - 16, h * 0.45, 22, fill=1, stroke=0)
    set_alpha_fill(c, BLACK, 1)
    c.roundRect(x + w * 0.34, y + h - 18, w * 0.32, 8, 4, fill=1, stroke=0)
    cap(c, "DFF / MOBILE", x + 24, y + h - 43, WHITE, 5.5)
    copy(c, title_value, x + 24, y + h * 0.38, w - 48, 17, 19, WHITE, DISPLAY, 3)
    pill(c, cta, x + 24, y + 32, accent, active=True)
    c.restoreState()


def small_card(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    number: str,
    head: str,
    body: str,
    accent=MINT,
) -> None:
    panel(c, x, y, w, h, PANEL, accent, 9, 0.9)
    cap(c, number, x + 16, y + h - 28, accent, 7.5)
    copy(c, head.upper(), x + 16, y + h - 57, w - 32, 15, 17, WHITE, SEMI, 2)
    copy(c, body, x + 16, y + h - 98, w - 32, 9.4, 12.6, GRAY, BODY, 5)


def texture_tile(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    color,
    name: str,
    role: str,
    page_no: int,
    index: int,
) -> None:
    c.saveState()
    c.setFillColor(color)
    c.rect(x, y, w, h, fill=1, stroke=0)
    rng = random.Random(page_no * 100 + index)
    for _ in range(520):
        shade = WHITE if rng.random() > 0.5 else BLACK
        set_alpha_fill(c, shade, rng.uniform(0.02, 0.09))
        c.circle(x + rng.random() * w, y + rng.random() * h, rng.uniform(0.4, 2.5), fill=1, stroke=0)
    c.restoreState()
    contrast = BLACK if color in (MINT, WHITE, GREEN, GOLD) else WHITE
    cap(c, name, x + 14, y + h - 25, contrast, 7.4)
    cap(c, role, x + 14, y + 15, contrast, 6.6)


def pattern_signal(c: canvas.Canvas, x: float, y: float, w: float, h: float, seed=1) -> None:
    rng = random.Random(410 + seed)
    for _ in range(70):
        px, py = x + rng.random() * w, y + rng.random() * h
        set_alpha_fill(c, MINT, rng.uniform(0.13, 0.5))
        c.circle(px, py, rng.uniform(1, 3.5), fill=1, stroke=0)
        if rng.random() > 0.67:
            rule(c, px, py, min(x + w, px + rng.uniform(25, 90)), py, MINT, 0.2, 0.6)


def pattern_code(c: canvas.Canvas, x: float, y: float, w: float, h: float, seed=1) -> None:
    rng = random.Random(520 + seed)
    values = ["01", "DFF", "AI", "{}", "[]", "NODE", "<>", "::"]
    c.setFont(MONO, 10)
    for _ in range(32):
        c.setFillColor(MINT if rng.random() > 0.4 else BLUE)
        c.setFillAlpha(rng.uniform(0.14, 0.42))
        c.drawString(x + rng.random() * (w - 40), y + rng.random() * (h - 12), rng.choice(values))


def pattern_mark(c: canvas.Canvas, x: float, y: float, w: float, h: float, seed=1) -> None:
    rng = random.Random(630 + seed)
    for _ in range(28):
        size = rng.uniform(9, 24)
        c.saveState()
        c.translate(x + rng.random() * w, y + rng.random() * h)
        c.rotate(rng.choice((0, 90, 180, 270)))
        set_alpha_stroke(c, MINT, rng.uniform(0.12, 0.4))
        c.setLineWidth(1)
        c.line(0, 0, size, 0)
        c.line(0, 0, 0, size)
        c.restoreState()


def pattern_grid(c: canvas.Canvas, x: float, y: float, w: float, h: float, seed=1) -> None:
    tile_field(c, x, y, w, h, 130 + seed, MINT, 12, 0.18)
    glow(c, x + w * 0.65, y + h * 0.48, min(w, h) * 0.6, MINT, 0.12)


def pattern_flow(c: canvas.Canvas, x: float, y: float, w: float, h: float, seed=1) -> None:
    rng = random.Random(740 + seed)
    nodes = []
    for index in range(8):
        px = x + 18 + index * (w - 52) / 7
        py = y + h * (0.34 + 0.25 * math.sin(index * 1.4))
        nodes.append((px, py))
    for index, ((x1, y1), (x2, y2)) in enumerate(zip(nodes, nodes[1:])):
        c.saveState()
        set_alpha_stroke(c, BLUE if index % 2 else MINT, 0.42)
        c.setLineWidth(1.1)
        c.bezier(x1, y1, (x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2)
        c.restoreState()
    for index, (px, py) in enumerate(nodes):
        c.saveState()
        set_alpha_fill(c, BLACK_2, 0.95)
        set_alpha_stroke(c, BLUE if index % 2 else MINT, 0.55)
        c.roundRect(px - 13, py - 9, 26, 18, 5, fill=1, stroke=1)
        c.restoreState()
        c.setFillColor(BLUE if index % 2 else MINT)
        c.setFillAlpha(rng.uniform(0.45, 0.85))
        c.circle(px, py, 2, fill=1, stroke=0)


def pattern_motion(c: canvas.Canvas, x: float, y: float, w: float, h: float, seed=1) -> None:
    rng = random.Random(850 + seed)
    for index in range(16):
        start_x = x + rng.uniform(0, w * 0.72)
        start_y = y + rng.uniform(0, h)
        length = rng.uniform(w * 0.12, w * 0.34)
        color = GREEN if index % 3 else MINT
        arrow(c, start_x, start_y, min(x + w, start_x + length), start_y + rng.uniform(-8, 18), color)


def cover(c: canvas.Canvas) -> None:
    page_base(c, 1, "COVER", field=False)
    image_cover(c, PORTFOLIO / "dimkoff-hero-sculpture-v2.png", 0, 0, W, H, 0)
    c.saveState()
    set_alpha_fill(c, BLACK, 0.58)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.restoreState()
    tile_field(c, 0, 0, W, H, 1, WHITE, 28, 0.035)
    grain(c, 1, 1100)
    cap(c, "VISUAL BRAND GUIDELINE / EDITION 02", 62, 730, MINT, 9)
    wordmark(c, 62, 584, 92, WHITE)
    copy(c, "SMM + AI PRODUCT BUILDER", 66, 514, 590, 23, 26, MINT, SEMI, 1)
    copy(c, "SIGNAL INTO SYSTEM.\nSYSTEM INTO PRODUCT.", 66, 370, 610, 35, 42, WHITE, DISPLAY, 3)
    selection_frame(c, 62, 246, 430, 62, BLUE)
    copy(c, "NOT CONTENT. INFRASTRUCTURE.", 80, 267, 390, 19, 22, WHITE, SEMI, 1)
    cap(c, "DARK DIGITAL IDENTITY / 2026", 66, 76, GOLD, 8.2)


def positioning(c: canvas.Canvas) -> None:
    page_base(c, 2, "01 / BRAND IDEA", field=False)
    glow(c, 1120, 405, 390, WHITE, 0.16)
    tile_field(c, 710, 0, 690, H, 2, WHITE, 18, 0.055)
    cap(c, "01 / BRAND IDEA", 54, 720, MINT, 9)
    heading(c, "WHERE AUDIENCE LOGIC MEETS PRODUCT LOGIC", 54, 635, 860, 66)
    copy(c, "DimkoFF connects SMM thinking, AI execution and product delivery. Built for founders, brands and teams that need a path from attention to a working digital system.", 58, 420, 610, 17, 24, GRAY, BODY, 6)
    selection_frame(c, 748, 154, 516, 146, BLUE)
    copy(c, "SMM THINKING", 782, 244, 430, 25, 28, WHITE, DISPLAY, 1)
    copy(c, "AI EXECUTION", 782, 204, 430, 25, 28, MINT, DISPLAY, 1)
    copy(c, "PRODUCT DELIVERY", 782, 164, 430, 25, 28, WHITE, DISPLAY, 1)
    cap(c, "BUILT FOR FOUNDERS / BRANDS / TEAMS", 58, 95, GOLD, 8.5)


def formula(c: canvas.Canvas) -> None:
    page_base(c, 3, "02 / CORE FORMULA", field=False)
    glow(c, 720, 390, 410, MINT, 0.14)
    cap(c, "02 / CORE FORMULA", 54, 720, MINT, 9)
    heading(c, "SIGNAL INTO PRODUCT", 54, 650, 720, 70)
    stages = [
        ("01", "SIGNAL", "NICHE / AUDIENCE / PAIN", GOLD),
        ("02", "SYSTEM", "CONTENT / FUNNEL / TELEGRAM", BLUE),
        ("03", "PRODUCT", "AI / MINI APP / AUTOMATION", MINT),
        ("04", "GROWTH", "LAUNCH / DATA / RETENTION", GREEN),
    ]
    for index, (num, head, note, accent) in enumerate(stages):
        x = 54 + index * 332
        panel(c, x, 195, 292, 246, BLACK_2, accent, 10, 0.97)
        cap(c, num, x + 18, 407, accent, 8)
        copy(c, head, x + 18, 338, 255, 32, 34, WHITE, DISPLAY, 1)
        rule(c, x + 18, 304, x + 265, 304, accent, 0.7, 1)
        copy(c, note, x + 18, 272, 250, 10, 14, GRAY, MONO, 3)
        if index < 3:
            arrow(c, x + 296, 318, x + 324, 318, accent)
    copy(c, "Strategy, interface, automation, growth.", 58, 112, 720, 24, 28, WHITE, SEMI, 1)


def identity(c: canvas.Canvas) -> None:
    page_base(c, 4, "03 / BRAND IDENTITY")
    cap(c, "03 / BRAND IDENTITY", 54, 720, MINT, 9)
    heading(c, "ONE SIGNAL. THREE MODES.", 54, 650, 780, 62)
    panel(c, 54, 180, 615, 335, BLACK_2, MINT, 12, 0.96)
    wordmark(c, 94, 350, 86, WHITE)
    cap(c, "PRIMARY WORDMARK", 94, 236, MINT, 8)
    panel(c, 704, 334, 272, 181, GRAPHITE, BLUE, 12)
    mark(c, 790, 370, 108, BLUE)
    cap(c, "COMPACT MARK / DFF", 735, 356, BLUE, 7.2)
    panel(c, 1004, 180, 342, 335, MINT, MINT, 12, 1)
    mark(c, 1110, 310, 128, BLACK)
    cap(c, "SIGNAL MODE", 1030, 215, BLACK, 7.2)
    panel(c, 704, 180, 272, 126, GRAPHITE, GOLD, 12)
    copy(c, "DFF / AI", 735, 242, 210, 27, 30, WHITE, DISPLAY, 1)
    cap(c, "PRODUCT SIGNATURE", 735, 209, GOLD, 7.2)
    copy(c, "The dot is the active signal. The container is the system. The wordmark is the public identity.", 58, 121, 850, 13.5, 18, GRAY, BODY, 3)


def construction(c: canvas.Canvas) -> None:
    page_base(c, 5, "04 / CONSTRUCTION")
    cap(c, "04 / CONSTRUCTION", 54, 720, MINT, 9)
    heading(c, "CONSTRUCTED FOR CLARITY", 54, 650, 820, 58)
    x, y, w, h = 54, 166, 790, 370
    panel(c, x, y, w, h, BLACK_2, LINE, 10)
    for index in range(13):
        rule(c, x + index * w / 12, y, x + index * w / 12, y + h, BLUE, 0.2, 0.6)
    for index in range(7):
        rule(c, x, y + index * h / 6, x + w, y + index * h / 6, BLUE, 0.2, 0.6)
    wordmark(c, x + 80, y + 153, 92, WHITE)
    selection_frame(c, x + 66, y + 127, 650, 130, BLUE)
    arrow(c, x + 720, y + 190, x + 770, y + 190, MINT)
    small_card(c, 888, 386, 458, 150, "01", "Clear space", "Minimum clear space equals the signal dot diameter around every edge.", MINT)
    small_card(c, 888, 218, 458, 150, "02", "Responsive scaling", "Wordmark for wide surfaces. DFF mark below small-display threshold.", BLUE)
    small_card(c, 888, 82, 458, 116, "03", "One active signal", "Never add a second dot, glow or decorative badge to the mark.", GOLD)


def logo_rules(c: canvas.Canvas) -> None:
    page_base(c, 6, "05 / LOGO IN CONTEXT")
    cap(c, "05 / LOGO IN CONTEXT", 54, 720, MINT, 9)
    heading(c, "CONTRAST BEFORE EFFECT", 54, 650, 790, 58)
    contexts = [
        (BLACK_2, WHITE, "PRIMARY / DARK"),
        (MINT, BLACK, "SIGNAL / LIGHT"),
        (WHITE, BLACK, "DOCUMENT / LIGHT"),
        (GRAPHITE, MINT, "PRODUCT / DARK"),
    ]
    for index, (bg, fg, name) in enumerate(contexts):
        x = 54 + index * 323
        c.setFillColor(bg)
        c.roundRect(x, 280, 285, 236, 10, fill=1, stroke=0)
        mark(c, x + 92, 345, 102, fg)
        cap(c, name, x + 16, 301, fg, 7)
    cap(c, "DO NOT", 54, 225, RED, 8)
    wrong = ["STRETCH", "ROTATE", "OUTLINE", "ADD EFFECT", "LOW CONTRAST", "CHANGE DOT"]
    x = 54
    for item in wrong:
        width = pill(c, item, x, 171, RED)
        x += width + 12
    copy(c, "If the mark cannot be read at a glance, change the surface - never compensate with decoration.", 54, 110, 940, 14, 19, GRAY, BODY, 3)


def typography_primary(c: canvas.Canvas) -> None:
    page_base(c, 7, "06 / PRIMARY TYPOGRAPHY")
    cap(c, "06 / PRIMARY TYPOGRAPHY", 54, 720, MINT, 9)
    copy(c, "BAHNSCHRIFT", 54, 628, 700, 70, 72, WHITE, DISPLAY, 1)
    cap(c, "DISPLAY / UPPERCASE / CONDENSED GEOMETRY", 58, 586, MINT, 8)
    glow(c, 840, 385, 280, MINT, 0.12)
    tile_field(c, 490, 140, 820, 410, 7, MINT, 20, 0.07)
    sample = ["Aa", "Bb", "Cc", "Dd", "Ee", "Ff", "Gg", "Hh", "Ii", "Jj", "Kk", "Ll", "Mm", "Nn", "Oo", "Pp", "Qq", "Rr", "Ss", "Tt", "Uu", "Vv", "Ww", "Xx", "Yy", "Zz", "01", "24", "AI"]
    for index, value in enumerate(sample):
        col = index % 8
        row = index // 8
        x = 520 + col * 95
        y = 470 - row * 82
        panel(c, x, y, 78, 64, BLACK_2, LINE, 7, 0.88)
        copy(c, value, x + 12, y + 20, 54, 17, 20, WHITE, DISPLAY, 1)
    panel(c, 54, 140, 380, 375, BLACK_2, LINE, 10)
    copy(c, "SIGNAL", 78, 422, 320, 47, 50, WHITE, DISPLAY, 1)
    copy(c, "SYSTEM", 78, 351, 320, 47, 50, WHITE, DISPLAY, 1)
    copy(c, "PRODUCT", 78, 280, 320, 47, 50, MINT, DISPLAY, 1)
    copy(c, "GROWTH", 78, 209, 320, 47, 50, WHITE, DISPLAY, 1)
    cap(c, "HEADLINES / POSTERS / PRODUCT NAMES", 78, 166, GRAY, 7.2)


def typography_secondary(c: canvas.Canvas) -> None:
    page_base(c, 8, "07 / SECONDARY TYPEFACE")
    cap(c, "07 / SECONDARY TYPEFACE", 54, 720, BLUE, 9)
    copy(c, "SEGOE UI", 54, 628, 680, 70, 72, WHITE, DISPLAY, 1)
    cap(c, "SYSTEM TEXT / INTERFACE / LONG-FORM CLARITY", 58, 586, BLUE, 8)
    panel(c, 54, 184, 620, 328, BLACK_2, LINE, 10)
    copy(c, "Strategy becomes useful when it turns into a repeatable action.", 82, 443, 520, 29, 35, WHITE, SEMI, 3)
    copy(c, "Use Segoe UI for body copy, explanatory notes and interface text. Keep paragraphs short. Prefer evidence, decisions and next actions over generic claims.", 82, 282, 500, 14, 20, GRAY, BODY, 6)
    panel(c, 710, 184, 636, 328, BLACK_2, MINT, 10)
    copy(c, "{ SIGNAL: ACTIVE }", 742, 432, 560, 24, 28, MINT, MONO, 1)
    copy(c, "STATUS / WORKING BUILD\nMODE / TELEGRAM-FIRST\nNEXT / SHIP + LEARN", 742, 338, 530, 16, 29, WHITE, MONO, 4)
    cap(c, "CONSOLAS / TECHNICAL LABELS / DATA / CODE", 742, 222, GRAY, 7.5)
    copy(c, "Display creates tension. System text creates trust.", 54, 116, 900, 23, 27, WHITE, SEMI, 1)


def color_architecture(c: canvas.Canvas) -> None:
    page_base(c, 9, "08 / COLOR ARCHITECTURE")
    tile_x, tile_y, tile_w, tile_h = 54, 128, 690, 548
    colors = [
        (MINT, "SIGNAL MINT", "ACTIVE ENERGY"),
        (WHITE, "WARM WHITE", "PURE SPACE"),
        (GRAY, "CANYON GRAY", "NEUTRAL BALANCE"),
        (BLACK_2, "OBSIDIAN", "DEEP FOUNDATION"),
    ]
    for index, (color, name, role) in enumerate(colors):
        x = tile_x + index * tile_w / 4
        texture_tile(c, x, tile_y, tile_w / 4, tile_h, color, name, role, 9, index)
    cap(c, "08 / COLOR ARCHITECTURE", 820, 680, MINT, 9)
    heading(c, "COLOR IS AN OPERATING SYSTEM", 820, 620, 510, 46)
    notes = [
        ("01 / SIGNAL MINT", "Actions, active states and moments of product energy.", MINT),
        ("02 / WARM WHITE", "Editorial clarity and premium breathing room.", WHITE),
        ("03 / CANYON GRAY", "Explanations, metadata and secondary hierarchy.", GRAY),
        ("04 / OBSIDIAN", "Depth, focus and the foundation of every system.", BLUE),
    ]
    for index, (head, body, accent) in enumerate(notes):
        y = 436 - index * 88
        cap(c, head, 820, y, accent, 7.2)
        copy(c, body, 820, y - 25, 490, 11.2, 15, GRAY, BODY, 2)


def color_context(c: canvas.Canvas) -> None:
    page_base(c, 10, "09 / COLOR IN CONTEXT")
    cap(c, "09 / COLOR IN CONTEXT", 846, 690, MINT, 9)
    heading(c, "FOUR MOODS. ONE WORLD.", 846, 628, 480, 47)
    tiles = [
        (54, 410, 360, 280, MINT, "DIGITAL ENERGY", "01"),
        (430, 410, 360, 280, WHITE, "PURE SPACE", "02"),
        (54, 113, 360, 280, GRAY, "NEUTRAL BALANCE", "03"),
        (430, 113, 360, 280, BLACK_2, "DEEP FOUNDATION", "04"),
    ]
    for index, (x, y, w, h, color, name, num) in enumerate(tiles):
        texture_tile(c, x, y, w, h, color, name, num, 10, index)
        c.saveState()
        set_alpha_stroke(c, BLACK if color != BLACK_2 else WHITE, 0.38)
        c.setLineWidth(3)
        c.circle(x + w - 62, y + 58, 31, fill=0, stroke=1)
        c.restoreState()
    copy(c, "Color should feel material, not decorative. Mint carries velocity. White creates control. Gray connects logic to atmosphere. Black lets every active signal breathe.", 846, 398, 450, 15, 22, GRAY, BODY, 8)
    copy(c, "The ratio is deliberate: 70% dark / 20% neutral / 10% signal.", 846, 205, 450, 18, 24, WHITE, SEMI, 3)
    cap(c, "NO ACID CYBERPUNK / NO RAINBOW UI / NO RANDOM GLOW", 846, 118, RED, 7.2)


def patterns(c: canvas.Canvas) -> None:
    page_base(c, 11, "10 / GRAPHIC PATTERNS")
    cap(c, "10 / GRAPHIC PATTERNS", 54, 720, MINT, 9)
    heading(c, "BACKGROUND INTELLIGENCE", 54, 650, 760, 58)
    entries = [
        ("01", "SIGNAL", pattern_signal, MINT),
        ("02", "CODE", pattern_code, BLUE),
        ("03", "MARK", pattern_mark, GOLD),
        ("04", "GRID", pattern_grid, MINT),
        ("05", "FLOW", pattern_flow, BLUE),
        ("06", "MOTION", pattern_motion, GREEN),
    ]
    for index, (num, name, fn, accent) in enumerate(entries):
        col, row = index % 3, index // 3
        x = 54 + col * 435
        y = 341 if row == 0 else 92
        panel(c, x, y, 405, 218, BLACK_2, accent, 8, 0.96)
        cap(c, f"{num} / {name}", x + 16, y + 188, accent, 7.2)
        fn(c, x + 16, y + 24, 373, 144, index + 1)
    cap(c, "PATTERNS SUPPORT CONTENT. THEY NEVER BECOME THE CONTENT.", 54, 64, GRAY, 7.3)


def pattern_application(c: canvas.Canvas) -> None:
    page_base(c, 12, "11 / PATTERN APPLICATION")
    cap(c, "11 / PATTERN APPLICATION", 54, 720, MINT, 9)
    heading(c, "ONE SYSTEM. MANY SURFACES.", 54, 650, 830, 58)
    panel(c, 54, 126, 554, 420, BLACK_2, MINT, 10)
    pattern_grid(c, 54, 126, 554, 420, 7)
    wordmark(c, 92, 405, 68, WHITE)
    selection_frame(c, 90, 240, 360, 86, BLUE)
    copy(c, "SIGNAL INTO PRODUCT", 112, 271, 320, 24, 28, WHITE, DISPLAY, 1)
    cap(c, "POSTER / COVER / LAUNCH", 92, 160, MINT, 7)
    panel(c, 638, 310, 330, 236, BLACK_2, BLUE, 10)
    pattern_code(c, 656, 332, 294, 176, 9)
    mark(c, 752, 367, 98, BLUE)
    cap(c, "DECK / TECHNICAL", 656, 330, BLUE, 7)
    panel(c, 996, 126, 350, 420, GRAPHITE, GOLD, 10)
    pattern_signal(c, 1016, 150, 310, 370, 8)
    phone(c, CASES / "stylist-ai-showcase.png", 1080, 170, 180, 336, GOLD)
    cap(c, "PRODUCT / UI", 1016, 148, GOLD, 7)
    panel(c, 638, 126, 330, 154, BLACK_2, GREEN, 10)
    copy(c, "DFF / AI / 01", 662, 220, 275, 23, 26, WHITE, DISPLAY, 1)
    cap(c, "STATUS / WORKING BUILD", 662, 178, GREEN, 7)


def additional(c: canvas.Canvas) -> None:
    page_base(c, 13, "12 / ADDITIONAL ELEMENTS")
    cap(c, "12 / ADDITIONAL ELEMENTS", 54, 720, BLUE, 9)
    heading(c, "MICRO SIGNALS. MACRO CONSISTENCY.", 54, 650, 950, 54)
    panel(c, 54, 350, 570, 200, BLACK_2, BLUE, 10)
    cap(c, "SELECTION FRAME", 78, 515, BLUE, 7.5)
    selection_frame(c, 110, 402, 390, 72, BLUE)
    copy(c, "ACTIVE TEXT", 136, 425, 330, 26, 30, WHITE, DISPLAY, 1)
    panel(c, 654, 350, 692, 200, BLACK_2, MINT, 10)
    cap(c, "CODE-LIKE SYNTAX", 678, 515, MINT, 7.5)
    copy(c, "{ signal: active }", 680, 435, 600, 24, 28, MINT, MONO, 1)
    copy(c, "<system />   [product:01]   ::growth", 680, 394, 600, 17, 22, WHITE, MONO, 1)
    elements = [
        ("01", "SECTION INDEX", "Navigation and sequence."),
        ("→", "DIRECTION", "Action and flow."),
        ("[ ]", "CONTAINER", "System and selection."),
        ("●", "SIGNAL DOT", "Live status only."),
    ]
    for index, (symbol, head, body) in enumerate(elements):
        x = 54 + index * 323
        small_card(c, x, 128, 286, 168, symbol, head, body, [MINT, BLUE, GOLD, GREEN][index])


def layout_grid(c: canvas.Canvas) -> None:
    page_base(c, 14, "13 / LAYOUT SYSTEM")
    cap(c, "13 / LAYOUT SYSTEM", 54, 720, MINT, 9)
    heading(c, "12 COLUMNS. POSTER RHYTHM.", 54, 650, 920, 58)
    x, y, w, h = 54, 116, 820, 430
    gutter = 9
    col_w = (w - gutter * 11) / 12
    for index in range(12):
        c.saveState()
        set_alpha_fill(c, BLUE, 0.06 if index % 2 else 0.11)
        c.rect(x + index * (col_w + gutter), y, col_w, h, fill=1, stroke=0)
        c.restoreState()
    rule(c, x, y + 340, x + w, y + 340, MINT, 0.55, 1)
    rule(c, x, y + 120, x + w, y + 120, MINT, 0.32, 1)
    copy(c, "LARGE\nIDEA", x + 28, y + 245, 500, 64, 62, WHITE, DISPLAY, 2)
    copy(c, "One dominant message. Supporting evidence sits in narrow system zones.", x + 30, y + 88, 470, 13, 18, GRAY, BODY, 3)
    panel(c, x + 590, y + 40, 190, 180, BLACK_2, BLUE, 8)
    cap(c, "SYSTEM PANEL", x + 606, y + 188, BLUE, 7)
    copy(c, "GRID\nNOTE\nSTATUS", x + 606, y + 144, 150, 14, 24, WHITE, MONO, 4)
    notes = [
        ("01", "DOMINANT HEADLINE", "6-8 columns"),
        ("02", "EVIDENCE ZONE", "3-5 columns"),
        ("03", "TECHNICAL LABEL", "1 line / mono"),
        ("04", "ACTIVE SIGNAL", "one accent only"),
    ]
    for index, (num, head, note) in enumerate(notes):
        small_card(c, 914, 418 - index * 108, 432, 92, num, head, note, [MINT, BLUE, GOLD, GREEN][index])


def adaptive(c: canvas.Canvas) -> None:
    page_base(c, 15, "14 / ADAPTIVE COMPOSITION")
    cap(c, "14 / ADAPTIVE COMPOSITION", 54, 720, BLUE, 9)
    heading(c, "SAME LOGIC. NEW PROPORTION.", 54, 650, 900, 58)
    formats = [
        (54, 146, 500, 370, "16:9 / DECK", 16 / 9, MINT),
        (598, 146, 228, 370, "9:16 / STORY", 9 / 16, BLUE),
        (870, 146, 370, 370, "1:1 / SOCIAL", 1, GOLD),
    ]
    for index, (x, y, outer_w, outer_h, label_value, ratio, accent) in enumerate(formats):
        panel(c, x, y, outer_w, outer_h, BLACK_2, accent, 9)
        margin = 22
        inner_w, inner_h = outer_w - margin * 2, outer_h - margin * 2
        if inner_w / inner_h > ratio:
            frame_h = inner_h
            frame_w = frame_h * ratio
        else:
            frame_w = inner_w
            frame_h = frame_w / ratio
        fx = x + (outer_w - frame_w) / 2
        fy = y + (outer_h - frame_h) / 2
        set_alpha_stroke(c, accent, 0.8)
        c.rect(fx, fy, frame_w, frame_h, fill=0, stroke=1)
        copy(c, "SIGNAL", fx + 12, fy + frame_h - 42, frame_w - 24, min(32, frame_w / 7), 34, WHITE, DISPLAY, 1)
        rule(c, fx + 12, fy + 32, fx + frame_w - 12, fy + 32, accent, 0.65, 1)
        cap(c, label_value, x + 16, y + 15, accent, 7)
    copy(c, "Scale the hierarchy, not the decoration. Preserve the dominant idea, the evidence zone and one active signal.", 54, 91, 960, 15, 21, GRAY, BODY, 3)


def ecosystem(c: canvas.Canvas) -> None:
    page_base(c, 16, "15 / PRODUCT ECOSYSTEM", field=False)
    glow(c, 1020, 380, 390, MINT, 0.18)
    tile_field(c, 700, 0, 700, H, 16, MINT, 19, 0.07)
    cap(c, "15 / PRODUCT ECOSYSTEM", 54, 720, MINT, 9)
    heading(c, "FROM ATTENTION TO INFRASTRUCTURE", 54, 650, 820, 57)
    nodes = [
        ("SMM", "SIGNAL", GOLD),
        ("CONTENT", "TRUST", GOLD),
        ("TELEGRAM", "ROUTE", BLUE),
        ("AI BOT", "UTILITY", MINT),
        ("MINI APP", "PRODUCT", MINT),
        ("BACKEND", "SYSTEM", BLUE),
        ("ANALYTICS", "LEARNING", GREEN),
    ]
    for index, (head, role, accent) in enumerate(nodes):
        angle = math.pi + index * math.pi * 1.35 / (len(nodes) - 1)
        cx = 1000 + math.cos(angle) * 290
        cy = 360 + math.sin(angle) * 250
        panel(c, cx - 78, cy - 34, 156, 68, BLACK_2, accent, 8)
        copy(c, head, cx - 60, cy + 7, 120, 12, 14, WHITE, SEMI, 1)
        cap(c, role, cx - 60, cy - 17, accent, 6.3)
        if index:
            previous_angle = math.pi + (index - 1) * math.pi * 1.35 / (len(nodes) - 1)
            px = 1000 + math.cos(previous_angle) * 290
            py = 360 + math.sin(previous_angle) * 250
            arrow(c, px + 72, py, cx - 82, cy, accent)
    copy(c, "Portfolio / decks / Telegram / Mini Apps / AI products / product showcases", 58, 146, 560, 17, 25, WHITE, SEMI, 4)


def digital_experiences_overview(c: canvas.Canvas) -> None:
    page_base(c, 17, "16 / DIGITAL EXPERIENCES")
    cap(c, "16 / DIGITAL EXPERIENCES", 54, 720, MINT, 9)
    heading(c, "3 TYPES OF DIGITAL EXPERIENCES WE CREATE", 54, 650, 1110, 54)
    cap(c, "CONCEPT DIRECTIONS / DEMO CONCEPTS", 54, 600, GOLD, 7.5)
    concepts = [
        (
            "01",
            "PREMIUM HOSPITALITY",
            "Sells atmosphere into booking.",
            EXPERIENCES / "hospitality-riverside-concept.jpg",
            GOLD,
            0.58,
        ),
        (
            "02",
            "AI PRODUCT",
            "Makes a complex system feel simple.",
            EXPERIENCES / "ai-product-concept.jpg",
            MINT,
            0.58,
        ),
        (
            "03",
            "PERSONAL BRAND",
            "Turns a person into a platform.",
            EXPERIENCES / "personal-brand-concept.jpg",
            BLUE,
            0.68,
        ),
    ]
    for index, (num, title, body, image, accent, focal_x) in enumerate(concepts):
        x = 54 + index * 435
        panel(c, x, 92, 405, 466, BLACK_2, accent, 10)
        image_cover(c, image, x + 12, 282, 381, 264, 7, focal_x=focal_x)
        c.saveState()
        set_alpha_fill(c, BLACK, 0.42)
        c.rect(x + 12, 282, 381, 92, fill=1, stroke=0)
        c.restoreState()
        cap(c, num, x + 18, 523, accent, 7)
        copy(c, title, x + 18, 330, 355, 20, 22, WHITE, DISPLAY, 2)
        copy(c, body, x + 18, 218, 350, 13, 17, GRAY, BODY, 3)
        pill(c, "DEMO CONCEPT", x + 18, 120, accent, active=True)


def concept_detail_panel(
    c: canvas.Canvas,
    accent,
    features: list[str],
    palette: list[tuple[str, str]],
    business_problem: str,
) -> None:
    panel(c, 1088, 92, 258, 516, BLACK_2, accent, 10)
    cap(c, "KEY FEATURES", 1110, 574, accent, 7)
    for index, item in enumerate(features):
        y = 530 - index * 50
        cap(c, f"0{index + 1}", 1110, y, GRAY, 6.4)
        copy(c, item, 1140, y - 2, 178, 10.5, 13, WHITE, SEMI, 2)
    cap(c, "VISUAL PALETTE", 1110, 298, accent, 7)
    for index, (name, color_hex) in enumerate(palette):
        x = 1110 + index * 53
        c.setFillColor(HexColor(color_hex))
        c.circle(x + 10, 262, 10, fill=1, stroke=0)
        cap(c, name, x, 238, GRAY, 5.2)
    cap(c, "BUSINESS PROBLEM", 1110, 202, accent, 7)
    copy(c, business_problem, 1110, 172, 212, 8.7, 10.7, GRAY, BODY, 7)


def hospitality_concept(c: canvas.Canvas) -> None:
    page_base(c, 18, "17 / CONCEPT / PREMIUM HOSPITALITY", field=False)
    glow(c, 1060, 390, 380, GOLD, 0.13)
    cap(c, "17 / CONCEPT DIRECTION / DEMO CONCEPT", 54, 720, GOLD, 9)
    heading(c, "RIVERSIDE LOUNGE EXPERIENCE", 54, 650, 960, 57)
    site_desktop_mockup(
        c,
        EXPERIENCES / "hospitality-riverside-concept.jpg",
        54,
        142,
        770,
        452,
        "RIVERSIDE",
        "LOUNGE / DINING / EVENTS",
        "BOOK A TABLE",
        GOLD,
        focal_x=0.53,
    )
    site_mobile_mockup(
        c,
        EXPERIENCES / "hospitality-riverside-concept.jpg",
        850,
        142,
        206,
        452,
        "RIVERSIDE",
        "BOOK A TABLE",
        GOLD,
        focal_x=0.72,
    )
    concept_detail_panel(
        c,
        GOLD,
        ["3D / parallax hero", "Interactive hall map", "Animated dish card", "Glass light effect", "Floating booking CTA"],
        [("INK", "#080B10"), ("GOLD", "#C6A15B"), ("GLASS", "#D8D0C4"), ("WARM", "#8B5E3C")],
        "Сайт для премиального пространства, который продаёт не квадратные метры и меню, а состояние: вечер, свет, вкус, статус и желание забронировать.",
    )
    cap(c, "PREMIUM RESTAURANT / HOTEL / BAR / LOUNGE", 54, 100, GOLD, 7)


def ai_product_concept(c: canvas.Canvas) -> None:
    page_base(c, 19, "18 / CONCEPT / AI PRODUCT", field=False)
    glow(c, 1050, 390, 400, MINT, 0.16)
    cap(c, "18 / CONCEPT DIRECTION / DEMO CONCEPT", 54, 720, MINT, 9)
    heading(c, "CALORIEPT AI / PRODUCT LAUNCH WEBSITE", 54, 650, 1050, 55)
    site_desktop_mockup(
        c,
        EXPERIENCES / "ai-product-concept.jpg",
        54,
        142,
        770,
        452,
        "AI HEALTH COMPANION",
        "PHOTO → INSIGHT → PROGRESS",
        "OPEN IN TELEGRAM",
        MINT,
        focal_x=0.55,
    )
    site_mobile_mockup(
        c,
        EXPERIENCES / "ai-product-concept.jpg",
        850,
        142,
        206,
        452,
        "CALORIEPT AI",
        "OPEN IN TELEGRAM",
        MINT,
        focal_x=0.58,
    )
    concept_detail_panel(
        c,
        MINT,
        ["3D device mockup", "Floating UI screens", "Interactive feature cards", "Animated calorie ring", "Embedded Telegram CTA"],
        [("INK", "#080B10"), ("MINT", "#64F2C4"), ("BLUE", "#42A5F5"), ("GREEN", "#35D07F")],
        "Лендинг для AI-продукта, который объясняет сложную технологию через простой сценарий пользователя: открыл, сфотографировал, понял, улучшил.",
    )
    cap(c, "AI PRODUCT / TELEGRAM-FIRST / PRODUCT WALKTHROUGH", 54, 100, MINT, 7)


def personal_brand_concept(c: canvas.Canvas) -> None:
    page_base(c, 20, "19 / CONCEPT / PERSONAL BRAND", field=False)
    glow(c, 1040, 390, 390, BLUE, 0.14)
    cap(c, "19 / CONCEPT DIRECTION / DEMO CONCEPT", 54, 720, BLUE, 9)
    heading(c, "FOUNDER SIGNAL WEBSITE", 54, 650, 880, 59)
    site_desktop_mockup(
        c,
        EXPERIENCES / "personal-brand-concept.jpg",
        54,
        142,
        770,
        452,
        "FROM PERSON",
        "TO A BRAND PLATFORM",
        "DISCUSS A PROJECT",
        BLUE,
        focal_x=0.62,
    )
    site_mobile_mockup(
        c,
        EXPERIENCES / "personal-brand-concept.jpg",
        850,
        142,
        206,
        452,
        "FOUNDER SIGNAL",
        "DISCUSS A PROJECT",
        BLUE,
        focal_x=0.75,
    )
    concept_detail_panel(
        c,
        BLUE,
        ["Portrait depth / parallax", "Glow signature orbit", "Journey timeline", "Case + product cards", "AI personality module"],
        [("INK", "#080B10"), ("WHITE", "#F4F5F7"), ("MINT", "#64F2C4"), ("BLUE", "#42A5F5")],
        "Сайт для личного бренда, где человек представлен не просто как эксперт, а как система: идеи, продукты, медиа, кейсы и коммерческие направления.",
    )
    cap(c, "FOUNDER / EXPERT / CREATOR / AI PERSONALITY", 54, 100, BLUE, 7)


def technology_layer(c: canvas.Canvas) -> None:
    page_base(c, 21, "20 / TECHNOLOGY LAYER")
    cap(c, "20 / CAPABILITY SYSTEM", 54, 720, MINT, 9)
    heading(c, "NOT TEMPLATES. PRODUCTIZED DIGITAL EXPERIENCES.", 54, 650, 1170, 51)
    panel(c, 54, 126, 568, 450, BLACK_2, BLUE, 12)
    selection_frame(c, 80, 344, 510, 166, BLUE)
    copy(c, "DIGITAL", 108, 438, 450, 34, 38, WHITE, DISPLAY, 1)
    copy(c, "SCENES", 108, 384, 450, 34, 38, MINT, DISPLAY, 1)
    copy(
        c,
        "Мы создаём не просто сайты-визитки. Мы проектируем цифровые сцены, в которых бренд, продукт и пользовательский сценарий соединяются в одну premium-систему.",
        82,
        250,
        490,
        15,
        20,
        GRAY,
        BODY,
        6,
    )
    technologies = [
        ("01", "REACT / NEXT.JS"),
        ("02", "THREE.JS / WEBGL"),
        ("03", "GSAP / FRAMER MOTION"),
        ("04", "TELEGRAM MINI APP INTEGRATIONS"),
        ("05", "AI MODULES"),
        ("06", "CRM / FORMS / PAYMENTS"),
        ("07", "ANALYTICS"),
        ("08", "SEO FOUNDATION"),
        ("09", "MOBILE-FIRST PERFORMANCE"),
    ]
    for index, (num, name) in enumerate(technologies):
        col, row = index % 3, index // 3
        x = 664 + col * 220
        y = 422 - row * 144
        panel(c, x, y, 198, 118, BLACK_2, [MINT, BLUE, GOLD][col], 8)
        cap(c, num, x + 14, y + 90, GRAY, 6)
        copy(c, name, x + 14, y + 42, 168, 12, 14, WHITE, SEMI, 3)
    cap(c, "TECHNOLOGY FOLLOWS THE EXPERIENCE AND THE BUSINESS GOAL", 664, 100, GOLD, 7)


def client_outcomes(c: canvas.Canvas) -> None:
    page_base(c, 22, "21 / WHAT THE CLIENT GETS")
    cap(c, "21 / CLIENT OUTCOMES", 54, 720, GOLD, 9)
    heading(c, "WHAT THE CLIENT GETS", 54, 650, 860, 63)
    copy(c, "A launch-ready digital surface connected to a commercial scenario.", 58, 592, 850, 17, 22, GRAY, BODY, 2)
    outcomes = [
        ("01", "PREMIUM SITE", "A coherent high-value visual system.", GOLD),
        ("02", "VISUAL WOW", "A memorable first interaction.", MINT),
        ("03", "SALES SCENARIO", "Clear path from interest to action.", BLUE),
        ("04", "MOBILE FIRST", "The core experience survives the small screen.", GREEN),
        ("05", "LEAD INTEGRATION", "Forms, CRM, booking or payments.", MINT),
        ("06", "AI + TELEGRAM", "Product logic beyond the landing page.", BLUE),
        ("07", "PRODUCT PACKAGING", "Message, interface and proof in one story.", GOLD),
        ("08", "PARTNER PRESENTATION", "A system ready to explain and sell.", GREEN),
    ]
    for index, (num, head, body, accent) in enumerate(outcomes):
        col, row = index % 4, index // 4
        x = 54 + col * 323
        y = 342 if row == 0 else 116
        small_card(c, x, y, 286, 190, num, head, body, accent)
    selection_frame(c, 1006, 579, 312, 65, BLUE)
    copy(c, "DISCUSS THE NEXT SCENE", 1028, 601, 270, 15, 17, WHITE, SEMI, 1)
    cap(c, "ALL THREE DIRECTIONS ARE DEMO CONCEPTS / NOT LAUNCHED CLIENT SITES", 54, 78, RED, 7)


def calorie_hero(c: canvas.Canvas) -> None:
    page_base(c, 23, "22 / CASE / CALORIEPT AI", field=False)
    glow(c, 1090, 385, 360, GREEN, 0.18)
    cap(c, "22 / CASE 01 / WORKING PRODUCT", 54, 720, GREEN, 9)
    heading(c, "CALORIEPT AI", 54, 640, 620, 78)
    copy(c, "TELEGRAM NUTRITION PRODUCT", 58, 558, 600, 20, 24, MINT, SEMI, 1)
    copy(c, "Food photo analysis, calorie and macro diary, day summary, fridge recipes, frequent meals and shopping list in one Telegram-first flow.", 58, 470, 530, 15, 22, GRAY, BODY, 6)
    phone(c, CASES / "caloriept-ai-live.png", 828, 98, 274, 548, GREEN)
    selection_frame(c, 775, 154, 378, 420, BLUE)
    stages = ["PHOTO", "ANALYSIS", "DIARY", "SUMMARY", "RETURN"]
    x = 58
    for index, stage in enumerate(stages):
        width = pill(c, stage, x, 249, GREEN)
        if index < len(stages) - 1:
            arrow(c, x + width + 5, 261, x + width + 28, 261, GREEN)
        x += width + 36
    cap(c, "REAL PRODUCT / NO UNVERIFIED METRICS", 58, 151, GRAY, 7.4)


def calorie_system(c: canvas.Canvas) -> None:
    page_base(c, 24, "23 / CALORIEPT PRODUCT SYSTEM")
    cap(c, "23 / PRODUCT SYSTEM", 54, 720, GREEN, 9)
    heading(c, "A REPEATABLE ACTION, NOT A FEATURE LIST", 54, 650, 1020, 52)
    flow = [
        ("01", "PHOTO", "INPUT"),
        ("02", "AI ANALYSIS", "VISION"),
        ("03", "DIARY", "MEMORY"),
        ("04", "DAY SUMMARY", "FEEDBACK"),
        ("05", "FRIDGE", "UTILITY"),
        ("06", "RETURN", "RETENTION"),
    ]
    for index, (num, head, role) in enumerate(flow):
        x = 54 + index * 216
        panel(c, x, 350, 184, 130, BLACK_2, GREEN if index >= 3 else MINT, 9)
        cap(c, num, x + 14, 452, GRAY, 6.5)
        copy(c, head, x + 14, 416, 150, 14, 16, WHITE, SEMI, 2)
        cap(c, role, x + 14, 374, GREEN if index >= 3 else MINT, 6.5)
        if index < len(flow) - 1:
            arrow(c, x + 186, 415, x + 210, 415, MINT)
    evidence = [
        ("TELEGRAM BOT", "Entry and recurring use"),
        ("MINI APP", "Premium mobile interface"),
        ("BACKEND", "Data and product logic"),
        ("CONTROLLED FALLBACKS", "Quota-safe user states"),
    ]
    for index, (head, body) in enumerate(evidence):
        small_card(c, 54 + index * 323, 116, 286, 168, f"0{index+1}", head, body, [GOLD, MINT, BLUE, GREEN][index])


def stylist_hero(c: canvas.Canvas) -> None:
    page_base(c, 25, "24 / CASE / STYLIST AI", field=False)
    glow(c, 965, 390, 430, GOLD, 0.15)
    tile_field(c, 685, 0, 715, H, 25, GOLD, 20, 0.035)
    cap(c, "24 / CASE 02 / WORKING BUILD", 54, 720, GOLD, 9)
    heading(c, "STYLIST AI", 54, 640, 620, 78)
    copy(c, "PREMIUM PERSONAL STYLING SYSTEM", 58, 558, 600, 20, 24, GOLD, SEMI, 1)
    copy(c, "Wardrobe, stylist selection, one quick chat, personal palette and recommendation logic in an editorial Telegram Mini App.", 58, 470, 540, 15, 22, GRAY, BODY, 6)
    phone(c, CASES / "stylist-ai-showcase.png", 712, 108, 222, 500, GOLD)
    phone(c, CASES / "stylist-ai-palette.png", 965, 82, 238, 536, MINT)
    selection_frame(c, 938, 122, 300, 460, BLUE)
    cap(c, "SHOWCASE / CHAT / PALETTE / PROFILE DATA", 58, 176, MINT, 7.5)
    copy(c, "Audience logic becomes product logic.", 58, 128, 620, 23, 27, WHITE, SEMI, 2)


def stylist_system(c: canvas.Canvas) -> None:
    page_base(c, 26, "25 / STYLIST PRODUCT SYSTEM")
    cap(c, "25 / PRODUCT SYSTEM", 54, 720, GOLD, 9)
    heading(c, "PREMIUM UX IS A SYSTEM", 54, 650, 880, 58)
    phone(c, CASES / "stylist-ai-quick-chat.png", 54, 108, 204, 454, MINT)
    phone(c, CASES / "stylist-ai-rachel.png", 286, 108, 204, 454, GOLD)
    principles = [
        ("01", "SHOWCASE, THEN CHAT", "AI Stylist is selection. QuickStylistChat is the only conversation surface.", GOLD),
        ("02", "STYLIST ID", "Frontend sends a selected ID. Server owns the real system prompt.", MINT),
        ("03", "USER CONTEXT", "Profile, palette, figure type, measurements, wardrobe and catalog enrich the answer.", BLUE),
        ("04", "EDITORIAL CONTROL", "Dark surfaces, focused actions and clear loading states preserve the premium feel.", GREEN),
    ]
    for index, (num, head, body, accent) in enumerate(principles):
        col, row = index % 2, index // 2
        x = 554 + col * 398
        y = 356 if row == 0 else 108
        small_card(c, x, y, 368, 206, num, head, body, accent)


def bot_portfolio(c: canvas.Canvas) -> None:
    page_base(c, 27, "26 / AI BOT PORTFOLIO")
    cap(c, "26 / AI BOT PORTFOLIO", 54, 720, MINT, 9)
    heading(c, "THREE NICHES. ONE DELIVERY LOGIC.", 54, 650, 980, 56)
    bots = [
        ("PSY MIND AI", "PSYCHOLOGY / SELF-REFLECTION", "Sensitive conversation design.", "psy-mind-ai-card.png", MINT_DARK),
        ("BUSINESSMENTORAI_BOT", "BUSINESS EDUCATION / AI MENTOR", "Expert knowledge into a Telegram product.", "businessmen-ai-card.png", GOLD),
        ("PULSE AI COACH", "COACHING / HABITS / PERFORMANCE", "Recurring actions and guided progress.", "pulse-ai-coach-card.png", BLUE),
    ]
    for index, (name, niche, body, image, accent) in enumerate(bots):
        x = 54 + index * 435
        panel(c, x, 104, 405, 452, BLACK_2, accent, 10)
        image_cover(c, CASES / image, x + 14, 304, 377, 234, 7)
        cap(c, niche, x + 18, 277, accent, 6.5)
        copy(c, name, x + 18, 237, 365, 20, 22, WHITE, DISPLAY, 2)
        copy(c, body, x + 18, 176, 350, 11, 15, GRAY, BODY, 3)
        pill(c, "REAL", x + 18, 122, accent, active=True)


def demo_lab(c: canvas.Canvas) -> None:
    page_base(c, 28, "27 / DEMO LAB", field=False)
    glow(c, 1050, 390, 390, BLUE, 0.16)
    pattern_code(c, 700, 70, 620, 590, 28)
    cap(c, "27 / DEMO LAB", 54, 720, BLUE, 9)
    heading(c, "IDEAS BECOME INTERFACES", 54, 650, 820, 61)
    copy(c, "A controlled space for testing product hypotheses, conversation mechanics, interface systems and launch narratives before they become full products.", 58, 485, 560, 16, 23, GRAY, BODY, 7)
    real = ["CALORIEPT AI", "STYLIST AI", "PSY MIND AI", "BUSINESSMENTOR", "PULSE AI COACH"]
    cap(c, "WORKING PRODUCTS", 58, 344, GREEN, 7.5)
    x = 58
    for item in real:
        width = pill(c, item, x, 296, GREEN)
        x += width + 10
        if x > 600:
            x = 58
    concepts = ["AI DIRECTOR", "EXPERTOS", "BRIEFPILOT", "LAUNCHKIT"]
    cap(c, "CONCEPTS / IN PLANNING", 58, 235, BLUE, 7.5)
    x = 58
    for item in concepts:
        width = pill(c, item, x, 187, BLUE)
        x += width + 10
    selection_frame(c, 760, 220, 480, 246, BLUE)
    copy(c, "HYPOTHESIS", 795, 390, 390, 30, 34, WHITE, DISPLAY, 1)
    copy(c, "PROTOTYPE", 795, 342, 390, 30, 34, MINT, DISPLAY, 1)
    copy(c, "EVIDENCE", 795, 294, 390, 30, 34, WHITE, DISPLAY, 1)


def ai_director(c: canvas.Canvas) -> None:
    page_base(c, 29, "28 / AI DIRECTOR / IN PLANNING", field=False)
    glow(c, 1040, 380, 420, MINT, 0.17)
    tile_field(c, 710, 0, 690, H, 29, MINT, 18, 0.07)
    cap(c, "28 / NEXT PRODUCT CONCEPT / IN PLANNING", 54, 720, MINT, 9)
    heading(c, "AI DIRECTOR", 54, 640, 620, 78)
    copy(c, "A Telegram-first business pulse concept for money, tasks, sales, risks and next actions. Presented as a product direction - not a finished product.", 58, 518, 560, 16, 23, GRAY, BODY, 7)
    panel(c, 730, 164, 570, 430, BLACK_2, MINT, 12)
    cap(c, "DAILY BUSINESS PULSE", 764, 554, MINT, 7.5)
    metrics = [("REVENUE", "STATUS", GREEN), ("RISKS", "03", RED), ("TASKS", "07", BLUE)]
    for index, (head, value, accent) in enumerate(metrics):
        x = 764 + index * 168
        cap(c, head, x, 480, GRAY, 6.7)
        copy(c, value, x, 435, 130, 25, 28, accent, DISPLAY, 1)
    points = [(765, 306), (830, 330), (900, 314), (975, 360), (1050, 344), (1135, 404), (1230, 388)]
    for start, end in zip(points, points[1:]):
        rule(c, start[0], start[1], end[0], end[1], MINT, 0.8, 2)
    for px, py in points:
        c.setFillColor(MINT)
        c.circle(px, py, 4, fill=1, stroke=0)
    pill(c, "CONCEPT / IN PLANNING", 58, 205, RED)
    copy(c, "From operational noise to one clear next action.", 58, 143, 590, 22, 27, WHITE, SEMI, 2)


def route_page(c: canvas.Canvas, page_no: int, route: str, headline: str, accent, cards: list[tuple[str, str]]) -> None:
    page_base(c, page_no, route)
    cap(c, route, 54, 720, accent, 9)
    heading(c, headline, 54, 650, 940, 58)
    for index, (head, body) in enumerate(cards):
        x = 54 + (index % 3) * 435
        y = 342 if index < 3 else 116
        small_card(c, x, y, 405, 190, f"0{index+1}", head, body, accent if index % 2 == 0 else BLUE)
    selection_frame(c, 968, 110, 350, 70, BLUE)
    copy(c, "DISCUSS THE NEXT SYSTEM", 990, 134, 310, 16, 19, WHITE, SEMI, 1)


def clients(c: canvas.Canvas) -> None:
    route_page(
        c,
        30,
        "29 / CLIENT ROUTE",
        "BUILT FOR FOUNDERS, BRANDS AND TEAMS",
        MINT,
        [
            ("SMM SYSTEM", "Positioning, content, nurture and Telegram funnel."),
            ("AI BOT", "Consultation, knowledge, applications and retention."),
            ("TELEGRAM MINI APP", "Account, service, subscription and analytics."),
            ("ONLINE PRODUCT", "Landing, bot, Mini App, CRM, AI and payments."),
            ("AI AUTOMATION", "Summaries, reports, leads, tasks and routine."),
        ],
    )


def employers(c: canvas.Canvas) -> None:
    route_page(
        c,
        31,
        "30 / EMPLOYER ROUTE",
        "SMM SPECIALIST AMPLIFIED BY PRODUCT THINKING",
        BLUE,
        [
            ("AUDIENCE", "Research, positioning and message architecture."),
            ("CONTENT", "Short-form, Telegram, nurture and funnel logic."),
            ("PRODUCT", "AI mechanics, Mini Apps and working prototypes."),
            ("DELIVERY", "Responsive UI, backend integration and deployment."),
            ("LEARNING", "Evidence, analytics and iteration after launch."),
        ],
    )


def proof(c: canvas.Canvas) -> None:
    page_base(c, 32, "31 / PROOF SYSTEM", field=False)
    glow(c, 1020, 390, 410, GREEN, 0.13)
    cap(c, "31 / PROOF SYSTEM", 54, 720, GREEN, 9)
    heading(c, "EVIDENCE BEFORE PROMISES", 54, 650, 850, 62)
    proofs = [
        ("01", "CALORIEPT AI", "Telegram product / AI vision / retention / backend", GREEN),
        ("02", "STYLIST AI", "Premium interface / AI stylist system / production delivery", GOLD),
        ("03", "AI BOT PORTFOLIO", "Three niches / conversation design / Telegram delivery", MINT),
        ("04", "PORTFOLIO + DECKS", "Packaging / route / product narrative / outreach", BLUE),
    ]
    for index, (num, head, body, accent) in enumerate(proofs):
        x = 54 + (index % 2) * 646
        y = 342 if index < 2 else 116
        panel(c, x, y, 610, 192, BLACK_2, accent, 10)
        cap(c, num, x + 20, y + 158, accent, 8)
        copy(c, head, x + 20, y + 110, 565, 22, 25, WHITE, DISPLAY, 1)
        copy(c, body, x + 20, y + 66, 565, 11.5, 15, GRAY, MONO, 2)
    cap(c, "NO UNVERIFIED METRICS / NO 'BEST' / NO 'UNIQUE'", 54, 80, RED, 7.4)


def contact(c: canvas.Canvas) -> None:
    page_base(c, 33, "32 / CONTACT", field=False)
    image_cover(c, PORTFOLIO / "dimkoff-hero-sculpture-v2.png", 700, 0, 700, H, 0)
    c.saveState()
    set_alpha_fill(c, BLACK, 0.3)
    c.rect(700, 0, 700, H, fill=1, stroke=0)
    c.restoreState()
    cap(c, "32 / CONTACT", 54, 720, MINT, 9)
    heading(c, "LET'S TURN THE NEXT SIGNAL INTO A PRODUCT", 54, 635, 690, 60)
    copy(c, "Strategy, interface, automation and growth - connected in one delivery logic.", 58, 400, 540, 17, 24, GRAY, BODY, 5)
    selection_frame(c, 58, 244, 520, 92, BLUE)
    copy(c, "OPEN PORTFOLIO", 86, 279, 450, 22, 25, WHITE, DISPLAY, 1)
    copy(c, "dmitriyn684-pixel.github.io/stylist-mini-app/portfolio/", 58, 185, 585, 11, 15, MINT, MONO, 2)
    copy(c, "github.com/dmitriyn684-pixel", 58, 143, 520, 11, 15, GRAY, MONO, 1)
    cap(c, "DIMKOFF / SMM + AI PRODUCT BUILDER", 58, 80, GOLD, 8)


def final(c: canvas.Canvas) -> None:
    page_base(c, 34, "FINAL POSTER", field=False)
    glow(c, 700, 390, 520, MINT, 0.19)
    tile_field(c, 0, 0, W, H, 34, MINT, 25, 0.06)
    grain(c, 34, 1400)
    wordmark(c, 54, 636, 78, WHITE)
    copy(c, "NOT CONTENT.", 54, 474, 900, 64, 65, WHITE, DISPLAY, 1)
    selection_frame(c, 48, 378, 760, 78, BLUE)
    copy(c, "INFRASTRUCTURE.", 70, 401, 710, 46, 50, MINT, DISPLAY, 1)
    copy(c, "SIGNAL → SYSTEM → PRODUCT → GROWTH", 58, 294, 800, 24, 28, WHITE, SEMI, 1)
    mark(c, 1120, 465, 155, MINT)
    cap(c, "SMM THINKING / AI EXECUTION / PRODUCT DELIVERY", 58, 104, GOLD, 8.4)


def build_pages():
    return [
        cover,
        positioning,
        formula,
        identity,
        construction,
        logo_rules,
        typography_primary,
        typography_secondary,
        color_architecture,
        color_context,
        patterns,
        pattern_application,
        additional,
        layout_grid,
        adaptive,
        ecosystem,
        digital_experiences_overview,
        hospitality_concept,
        ai_product_concept,
        personal_brand_concept,
        technology_layer,
        client_outcomes,
        calorie_hero,
        calorie_system,
        stylist_hero,
        stylist_system,
        bot_portfolio,
        demo_lab,
        ai_director,
        clients,
        employers,
        proof,
        contact,
        final,
    ]


def main() -> None:
    register_fonts()
    pages = build_pages()
    if len(pages) != TOTAL_PAGES:
        raise RuntimeError(f"Expected {TOTAL_PAGES} pages, got {len(pages)}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(OUT), pagesize=(W, H), pageCompression=1)
    pdf.setTitle("DimkoFF Visual Brand Guideline 2026 - Edition 02")
    pdf.setAuthor("DimkoFF")
    pdf.setSubject("SMM + AI Product Builder / Premium Visual Brand System")
    for renderer in pages:
        renderer(pdf)
        pdf.showPage()
    pdf.save()
    shutil.copy2(OUT, PUBLIC)
    print(OUT)
    print(PUBLIC)


if __name__ == "__main__":
    main()
