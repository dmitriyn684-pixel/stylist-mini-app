from __future__ import annotations

import math
import random
import shutil
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "dimkoff-brandbook-2026-visual.pdf"
PUBLIC = ROOT / "public" / "portfolio" / OUT.name
ASSETS = ROOT / "brandbook" / "assets" / "cases"

W, H = 960, 540

OBSIDIAN = HexColor("#080A0F")
GRAPHITE = HexColor("#11151D")
VOLCANIC = HexColor("#050608")
MINT = HexColor("#00FFD1")
DEEP_MINT = HexColor("#00BFA6")
BLUE = HexColor("#5D8CFF")
WHITE = HexColor("#F5F0E8")
GRAY = HexColor("#8D929C")
GREEN = HexColor("#8FD66B")
GOLD = HexColor("#D8B35E")
RED = HexColor("#FF6B75")
LINE = HexColor("#27303D")

DISPLAY = "DFF-Bold"
BODY = "DFF-Regular"
MONO = "DFF-Mono"


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(BODY, r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont(DISPLAY, r"C:\Windows\Fonts\arialbd.ttf"))
    pdfmetrics.registerFont(TTFont(MONO, r"C:\Windows\Fonts\consola.ttf"))


def alpha_fill(c: canvas.Canvas, color, alpha: float) -> None:
    c.setFillColor(color)
    c.setFillAlpha(alpha)


def alpha_stroke(c: canvas.Canvas, color, alpha: float) -> None:
    c.setStrokeColor(color)
    c.setStrokeAlpha(alpha)


def wrapped_lines(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if not current or pdfmetrics.stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def text(c: canvas.Canvas, value: str, x: float, y: float, width: float, size: float = 14,
         leading: float | None = None, color=WHITE, font: str = BODY, max_lines: int | None = None) -> float:
    leading = leading or size * 1.32
    lines = wrapped_lines(value, font, size, width)
    if max_lines:
        lines = lines[:max_lines]
    c.setFont(font, size)
    c.setFillColor(color)
    c.setFillAlpha(1)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def label(c: canvas.Canvas, value: str, x: float, y: float, color=MINT, size: float = 8.5) -> None:
    c.setFont(MONO, size)
    c.setFillColor(color)
    c.setFillAlpha(1)
    c.drawString(x, y, value.upper())


def title(c: canvas.Canvas, value: str, x: float = 54, y: float = 442, width: float = 800,
          size: float = 38, color=WHITE, max_lines: int = 3) -> float:
    return text(c, value.upper(), x, y, width, size, size * 1.02, color, DISPLAY, max_lines)


def round_panel(c: canvas.Canvas, x: float, y: float, w: float, h: float, fill=GRAPHITE,
                stroke=LINE, radius: float = 16, alpha: float = 0.96) -> None:
    c.saveState()
    alpha_fill(c, fill, alpha)
    alpha_stroke(c, stroke, 0.85)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)
    c.restoreState()


def pill(c: canvas.Canvas, value: str, x: float, y: float, color=MINT, dark=False) -> float:
    size = 8.3
    w = pdfmetrics.stringWidth(value.upper(), MONO, size) + 22
    c.saveState()
    alpha_fill(c, color, 1 if dark else 0.12)
    alpha_stroke(c, color, 0.75)
    c.roundRect(x, y, w, 23, 11.5, fill=1, stroke=1)
    c.setFont(MONO, size)
    c.setFillColor(OBSIDIAN if dark else color)
    c.setFillAlpha(1)
    c.drawCentredString(x + w / 2, y + 7, value.upper())
    c.restoreState()
    return w


def card(c: canvas.Canvas, x: float, y: float, w: float, h: float, head: str, body: str,
         accent=MINT, kicker: str | None = None, head_size: float = 17) -> None:
    round_panel(c, x, y, w, h)
    c.saveState()
    alpha_fill(c, accent, 0.9)
    c.roundRect(x + 14, y + h - 8, 54, 3, 1.5, fill=1, stroke=0)
    c.restoreState()
    if kicker:
        label(c, kicker, x + 16, y + h - 28, accent, 7.4)
        hy = y + h - 54
    else:
        hy = y + h - 35
    text(c, head, x + 16, hy, w - 32, head_size, head_size * 1.08, WHITE, DISPLAY, 2)
    text(c, body, x + 16, hy - 48, w - 32, 10.7, 14.3, GRAY, BODY, 6)


def glow(c: canvas.Canvas, x: float, y: float, radius: float, color=MINT, alpha: float = 0.13) -> None:
    c.saveState()
    for i in range(9, 0, -1):
        r = radius * i / 9
        alpha_fill(c, color, alpha * (1 - i / 10) / 1.8)
        c.circle(x, y, r, fill=1, stroke=0)
    c.restoreState()


def ghost(c: canvas.Canvas, value: str, x: float, y: float, size: float,
          color=MINT, alpha: float = 0.055, rotate: float = 0) -> None:
    c.saveState()
    c.translate(x, y)
    c.rotate(rotate)
    c.setFont(DISPLAY, size)
    alpha_fill(c, color, alpha)
    c.drawString(0, 0, value)
    c.restoreState()


def grid(c: canvas.Canvas, step: int = 48, alpha: float = 0.08) -> None:
    c.saveState()
    alpha_stroke(c, BLUE, alpha)
    c.setLineWidth(0.35)
    for x in range(0, W + 1, step):
        c.line(x, 0, x, H)
    for y in range(0, H + 1, step):
        c.line(0, y, W, y)
    c.restoreState()


def grain(c: canvas.Canvas, page_no: int, count: int = 260) -> None:
    rng = random.Random(8200 + page_no)
    c.saveState()
    for _ in range(count):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        r = rng.choice((0.25, 0.35, 0.45, 0.6))
        alpha_fill(c, WHITE if rng.random() > 0.25 else MINT, rng.uniform(0.018, 0.055))
        c.circle(x, y, r, fill=1, stroke=0)
    c.restoreState()


def page_base(c: canvas.Canvas, page_no: int, section: str, grid_on=True) -> None:
    c.setFillColor(OBSIDIAN)
    c.setFillAlpha(1)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    if grid_on:
        grid(c)
    grain(c, page_no)
    label(c, "DIMKOFF / VISUAL BRAND GUIDELINE / 2026", 36, H - 28, GRAY, 7.3)
    label(c, section, 36, 23, GRAY, 7.3)
    label(c, f"{page_no:02d} / 40", W - 86, 23, MINT, 7.3)
    c.saveState()
    alpha_stroke(c, LINE, 0.7)
    c.line(36, 38, W - 36, 38)
    c.restoreState()


def draw_arrow(c: canvas.Canvas, x1: float, y1: float, x2: float, y2: float, color=MINT, alpha=1) -> None:
    c.saveState()
    alpha_stroke(c, color, alpha)
    c.setLineWidth(1.2)
    c.line(x1, y1, x2, y2)
    angle = math.atan2(y2 - y1, x2 - x1)
    for offset in (2.6, -2.6):
        a = angle + math.pi + offset
        c.line(x2, y2, x2 + 8 * math.cos(a), y2 + 8 * math.sin(a))
    c.restoreState()


def draw_wordmark(c: canvas.Canvas, x: float, y: float, size: float = 64, color=WHITE) -> None:
    c.setFont(DISPLAY, size)
    c.setFillColor(color)
    c.setFillAlpha(1)
    c.drawString(x, y, "DIMKOFF")
    dot_x = x + pdfmetrics.stringWidth("DIMKOFF", DISPLAY, size) + 10
    c.setFillColor(MINT if color != MINT else WHITE)
    c.circle(dot_x, y + size * 0.18, max(3.5, size * 0.07), fill=1, stroke=0)


def draw_mark(c: canvas.Canvas, x: float, y: float, size: float = 72, color=MINT, boxed=True) -> None:
    c.saveState()
    c.setFillColor(color)
    c.setStrokeColor(color)
    c.setFillAlpha(1)
    c.setStrokeAlpha(1)
    c.setLineWidth(max(1.3, size * 0.025))
    if boxed:
        c.roundRect(x, y, size, size, size * 0.18, fill=0, stroke=1)
    c.setFont(DISPLAY, size * 0.34)
    c.drawCentredString(x + size / 2, y + size * 0.39, "DFF")
    c.circle(x + size * 0.76, y + size * 0.74, size * 0.045, fill=1, stroke=0)
    c.restoreState()


def draw_image_cover(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, radius=14) -> None:
    image = Image.open(path)
    iw, ih = image.size
    target_ratio, source_ratio = w / h, iw / ih
    if source_ratio > target_ratio:
        crop_w = int(ih * target_ratio)
        left = (iw - crop_w) // 2
        image = image.crop((left, 0, left + crop_w, ih))
    else:
        crop_h = int(iw / target_ratio)
        top = (ih - crop_h) // 2
        image = image.crop((0, top, iw, top + crop_h))
    c.saveState()
    p = c.beginPath()
    p.roundRect(x, y, w, h, radius)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(ImageReader(image), x, y, w, h, mask="auto")
    c.restoreState()
    c.saveState()
    alpha_stroke(c, WHITE, 0.18)
    c.roundRect(x, y, w, h, radius, fill=0, stroke=1)
    c.restoreState()


def phone(c: canvas.Canvas, path: Path, x: float, y: float, w: float = 170, h: float = 360) -> None:
    c.saveState()
    alpha_fill(c, VOLCANIC, 1)
    alpha_stroke(c, WHITE, 0.34)
    c.setLineWidth(1.2)
    c.roundRect(x, y, w, h, 25, fill=1, stroke=1)
    draw_image_cover(c, path, x + 8, y + 9, w - 16, h - 18, 18)
    alpha_fill(c, VOLCANIC, 1)
    c.roundRect(x + w * 0.33, y + h - 17, w * 0.34, 8, 4, fill=1, stroke=0)
    c.restoreState()


def pattern_signal(c: canvas.Canvas, x: float, y: float, w: float, h: float, alpha=0.7) -> None:
    c.saveState()
    rng = random.Random(210)
    for _ in range(24):
        px, py = x + rng.random() * w, y + rng.random() * h
        r = rng.choice((1.5, 2.2, 3.0))
        alpha_fill(c, MINT, 0.25 * alpha)
        c.circle(px, py, r, fill=1, stroke=0)
        if rng.random() > 0.55:
            alpha_stroke(c, MINT, 0.18 * alpha)
            c.line(px, py, min(x + w, px + rng.uniform(25, 80)), py)
    c.restoreState()


def pattern_system(c: canvas.Canvas, x: float, y: float, w: float, h: float, alpha=0.7) -> None:
    c.saveState()
    c.setFont(MONO, 15)
    symbols = ["[]", "{}", "DFF", "AI", "01", "NODE"]
    rng = random.Random(320)
    for _ in range(16):
        alpha_fill(c, BLUE, 0.18 * alpha)
        c.drawString(x + rng.random() * max(1, w - 40), y + rng.random() * max(1, h - 18), rng.choice(symbols))
    c.restoreState()


def pattern_product(c: canvas.Canvas, x: float, y: float, w: float, h: float, alpha=0.7) -> None:
    c.saveState()
    rng = random.Random(430)
    for _ in range(13):
        pw, ph = rng.uniform(28, 62), rng.uniform(16, 36)
        px, py = x + rng.random() * max(1, w - pw), y + rng.random() * max(1, h - ph)
        alpha_stroke(c, GOLD, 0.24 * alpha)
        c.roundRect(px, py, pw, ph, 5, fill=0, stroke=1)
        alpha_fill(c, GOLD, 0.18 * alpha)
        c.circle(px + 8, py + ph - 8, 2, fill=1, stroke=0)
    c.restoreState()


def pattern_growth(c: canvas.Canvas, x: float, y: float, w: float, h: float, alpha=0.7) -> None:
    c.saveState()
    rng = random.Random(540)
    for _ in range(9):
        px, py = x + rng.random() * (w - 80), y + rng.random() * (h - 40)
        draw_arrow(c, px, py, px + rng.uniform(35, 75), py + rng.uniform(12, 38), GREEN, 0.28 * alpha)
    c.restoreState()


def pattern_ai(c: canvas.Canvas, x: float, y: float, w: float, h: float, alpha=0.7) -> None:
    c.saveState()
    rng = random.Random(650)
    nodes = [(x + rng.random() * w, y + rng.random() * h) for _ in range(22)]
    for i, (px, py) in enumerate(nodes):
        for j in range(i + 1, min(len(nodes), i + 4)):
            qx, qy = nodes[j]
            if (px - qx) ** 2 + (py - qy) ** 2 < (w * 0.28) ** 2:
                alpha_stroke(c, MINT, 0.10 * alpha)
                c.line(px, py, qx, qy)
        alpha_fill(c, MINT if i % 3 else BLUE, 0.32 * alpha)
        c.circle(px, py, 2.2 if i % 4 else 3.8, fill=1, stroke=0)
    c.restoreState()


def pattern_telegram(c: canvas.Canvas, x: float, y: float, w: float, h: float, alpha=0.7) -> None:
    c.saveState()
    rng = random.Random(760)
    for i in range(10):
        bw, bh = rng.uniform(34, 62), rng.uniform(20, 34)
        px, py = x + rng.random() * (w - bw), y + rng.random() * (h - bh)
        alpha_stroke(c, BLUE if i % 2 else MINT, 0.25 * alpha)
        c.roundRect(px, py, bw, bh, 8, fill=0, stroke=1)
        c.setFont(MONO, 7)
        alpha_fill(c, BLUE if i % 2 else MINT, 0.22 * alpha)
        c.drawCentredString(px + bw / 2, py + bh / 2 - 2, "TG" if i % 3 == 0 else "..." )
    c.restoreState()


def palette_tile(c: canvas.Canvas, x: float, y: float, w: float, h: float, color, name: str, role: str) -> None:
    c.setFillColor(color)
    c.setFillAlpha(1)
    c.roundRect(x, y, w, h, 15, fill=1, stroke=0)
    c.saveState()
    alpha_stroke(c, WHITE, 0.16)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, 15, fill=0, stroke=1)
    c.restoreState()
    contrast = OBSIDIAN if color in (MINT, WHITE, GREEN, GOLD) else WHITE
    c.setFillColor(contrast)
    c.setFont(DISPLAY, 13)
    c.drawString(x + 14, y + h - 25, name.upper())
    c.setFont(MONO, 7.7)
    c.drawString(x + 14, y + 15, role.upper())


def section_page(c: canvas.Canvas, page_no: int, number: str, heading: str, sub: str, color=MINT) -> None:
    page_base(c, page_no, heading, False)
    glow(c, W * 0.77, H * 0.55, 230, color, 0.22)
    ghost(c, number, 500, 95, 330, color, 0.075, -6)
    label(c, f"SECTION {number}", 54, 450, color, 9)
    title(c, heading, 54, 380, 760, 62, WHITE, 2)
    text(c, sub, 58, 245, 520, 17, 24, GRAY, BODY, 4)
    draw_mark(c, 790, 60, 96, color)


def cover(c: canvas.Canvas) -> None:
    page_base(c, 1, "COVER", False)
    glow(c, 710, 290, 250, MINT, 0.28)
    pattern_ai(c, 550, 110, 330, 320, 1.2)
    ghost(c, "DFF", 430, 35, 260, MINT, 0.07, -4)
    label(c, "VISUAL BRAND GUIDELINE / DIGITAL PRODUCT IDENTITY", 56, 465, MINT, 8.4)
    draw_wordmark(c, 54, 335, 85, WHITE)
    text(c, "SMM + AI PRODUCT BUILDER", 58, 287, 600, 24, 27, MINT, DISPLAY, 1)
    text(c, "PERSONAL BRAND SYSTEM / DIGITAL PRODUCT IDENTITY", 58, 245, 600, 11, 15, GRAY, MONO, 2)
    text(c, "Signal into system. System into product. Product into growth.", 58, 153, 505, 18, 25, WHITE, BODY, 3)
    draw_mark(c, 762, 355, 105, MINT)
    label(c, "EDITION 01 / 2026", 58, 72, GOLD, 8)


def positioning(c: canvas.Canvas) -> None:
    page_base(c, 2, "1.0 POSITIONING")
    ghost(c, "POSITIONING", 280, 85, 94, MINT, 0.045, 5)
    label(c, "1.0 POSITIONING", 54, 466, MINT, 9)
    title(c, "DIMKOFF - SMM + AI PRODUCT BUILDER", 54, 420, 760, 43)
    text(c, "Я соединяю SMM, AI и разработку, чтобы запускать digital-продукты, Telegram-воронки и автоматизации под бизнес-задачи.", 56, 308, 600, 17, 23, GRAY, BODY, 4)
    steps = ["MARKETING", "SMM", "TELEGRAM", "AI", "PRODUCT", "LAUNCH"]
    x = 54
    for i, item in enumerate(steps):
        w = pill(c, item, x, 118, [GOLD, GOLD, BLUE, MINT, MINT, GREEN][i])
        if i < len(steps) - 1:
            draw_arrow(c, x + w + 5, 129, x + w + 27, 129, GRAY, 0.8)
        x += w + 34
    card(c, 692, 205, 210, 130, "Not a title stack", "Не обычный дизайнер. Не разработчик ради разработки. Система вокруг бизнес-логики.", BLUE, "CORE FILTER", 15)


def core_idea(c: canvas.Canvas) -> None:
    page_base(c, 3, "2.0 THE CORE IDEA", False)
    glow(c, 778, 268, 230, MINT, 0.26)
    pattern_signal(c, 590, 95, 300, 330, 1.5)
    ghost(c, "SIGNAL", 430, 90, 132, MINT, 0.06, -8)
    label(c, "2.0 THE CORE IDEA", 54, 466, MINT, 9)
    title(c, "I TURN BUSINESS SIGNALS INTO DIGITAL PRODUCTS.", 54, 400, 690, 46)
    text(c, "Я превращаю бизнес-сигналы в SMM-системы, AI-продукты и Telegram-воронки.", 58, 255, 585, 20, 27, WHITE, DISPLAY, 3)
    text(c, "Сначала смысл и точка роста. Затем контент, Telegram, AI-логика, интерфейс и запуск.", 58, 165, 525, 14, 20, GRAY, BODY, 3)


def who(c: canvas.Canvas) -> None:
    page_base(c, 4, "3.0 WHO WE WORK WITH")
    ghost(c, "AUDIENCE", 440, 78, 118, BLUE, 0.05, 6)
    label(c, "3.0 WHO WE WORK WITH", 54, 466, BLUE, 9)
    title(c, "NOT JUST CONTENT. A SYSTEM.", 54, 420, 700, 42)
    text(c, "Работаю с предпринимателями, экспертами и командами, которым нужен путь от внимания до удержания.", 56, 328, 620, 15, 21, GRAY, BODY, 4)
    flow = ["ATTENTION", "TRUST", "LEAD", "PRODUCT", "RETENTION"]
    for i, item in enumerate(flow):
        x = 55 + i * 168
        round_panel(c, x, 205, 142, 62, GRAPHITE, BLUE if i < 2 else MINT, 12)
        label(c, f"0{i+1}", x + 12, 246, GRAY, 6.5)
        text(c, item, x + 12, 224, 118, 11, 13, WHITE, DISPLAY, 1)
        if i < 4:
            draw_arrow(c, x + 144, 236, x + 164, 236, MINT, 0.8)
    audiences = ["EXPERTS", "ONLINE SCHOOLS", "SMM / DIGITAL", "TELEGRAM PROJECTS", "AI PRODUCTS", "SMALL BUSINESS", "FOUNDER-LED"]
    x, y = 56, 118
    for item in audiences:
        pw = pill(c, item, x, y, BLUE)
        x += pw + 10
        if x > 780:
            x, y = 56, y - 34


def pillars(c: canvas.Canvas) -> None:
    page_base(c, 5, "4.0 BRAND PILLARS")
    glow(c, 795, 390, 180, MINT, 0.16)
    ghost(c, "DFF", 610, 62, 260, MINT, 0.06, -7)
    label(c, "4.0 BRAND PILLARS", 54, 466, MINT, 9)
    title(c, "FIVE OPERATING PRINCIPLES", 54, 420, 760, 43)
    items = [
        ("01", "SIGNAL THINKING", "Рыночные сигналы, боли и точки роста.", GOLD),
        ("02", "SYSTEM BUILDER", "SMM, Telegram, AI и продукт в одной логике.", BLUE),
        ("03", "PRODUCT SPEED", "Идея быстро превращается в проверяемый MVP.", MINT),
        ("04", "HUMAN + AI", "AI усиливает человека, а не заменяет смысл.", DEEP_MINT),
        ("05", "LAUNCH MINDSET", "Каждое решение думает запуском и данными.", GREEN),
    ]
    for i, (num, head, body, accent) in enumerate(items):
        x = 54 + (i % 3) * 292
        y = 222 if i < 3 else 82
        card(c, x, y, 274, 118, head, body, accent, num, 15)


def metaphors(c: canvas.Canvas) -> None:
    page_base(c, 6, "CONCEPT METAPHORS", False)
    glow(c, 232, 275, 210, MINT, 0.25)
    draw_mark(c, 142, 185, 180, MINT)
    ghost(c, "{}", 75, 65, 270, BLUE, 0.07, 8)
    label(c, "CONCEPT METAPHORS", 465, 466, MINT, 9)
    title(c, "FROM SIGNAL TO GROWTH", 465, 424, 430, 36)
    items = [
        ("01 SIGNAL", "Поиск сильного рыночного сигнала и скрытой возможности."),
        ("02 SYSTEM", "Превращение хаоса маркетинга и инструментов в структуру."),
        ("03 PRODUCT", "Упаковка идеи в bot, Mini App, landing или automation."),
        ("04 GROWTH", "Запуск, данные, улучшение и масштабирование."),
        ("05 AI LAYER", "Усиление человека, ускорение решений и снятие рутины."),
    ]
    y = 318
    for head, body in items:
        label(c, head, 468, y, MINT if "AI" in head else GRAY, 7.8)
        text(c, body, 468, y - 20, 410, 11, 14.5, WHITE, BODY, 2)
        y -= 65


def method_intro(c: canvas.Canvas) -> None:
    section_page(c, 7, "05", "THE DIMKOFF METHOD", "SIGNAL -> SYSTEM -> PRODUCT -> GROWTH. Четыре режима одной операционной системы.", MINT)


def method_page(c: canvas.Canvas, page_no: int, word: str, number: str, accent, left_items: list[str], statement: str) -> None:
    page_base(c, page_no, f"METHOD / {word}", False)
    glow(c, 750, 300, 225, accent, 0.22)
    ghost(c, number, 520, 70, 320, accent, 0.08, -4)
    label(c, f"METHOD / {number}", 54, 466, accent, 9)
    title(c, word, 54, 410, 660, 76)
    text(c, statement, 58, 307, 520, 18, 25, WHITE, DISPLAY, 4)
    x, y = 58, 188
    for item in left_items:
        pw = pill(c, item, x, y, accent)
        x += pw + 10
        if x > 520:
            x, y = 58, y - 35
    pattern_signal(c, 650, 125, 235, 300, 1.0) if word == "SIGNAL" else None
    pattern_system(c, 650, 125, 235, 300, 1.0) if word == "SYSTEM" else None
    pattern_product(c, 650, 125, 235, 300, 1.0) if word == "PRODUCT" else None
    pattern_growth(c, 650, 125, 235, 300, 1.0) if word == "GROWTH" else None


def visual_divider(c: canvas.Canvas) -> None:
    section_page(c, 12, "06", "VISUAL SYSTEM", "Wordmark, mark, color, typography, layouts, patterns and display modes.", BLUE)


def logo_anatomy(c: canvas.Canvas) -> None:
    page_base(c, 13, "LOGO ANATOMY")
    label(c, "LOGO ANATOMY", 54, 466, MINT, 9)
    title(c, "ONE NAME. THREE MODES.", 54, 420, 710, 42)
    round_panel(c, 54, 250, 852, 120, GRAPHITE, MINT, 18)
    draw_wordmark(c, 86, 285, 61, WHITE)
    label(c, "WORDMARK / PRIMARY", 86, 268, GRAY, 7)
    draw_mark(c, 635, 267, 82, MINT)
    label(c, "MONOGRAM / DFF", 628, 248, GRAY, 7)
    round_panel(c, 754, 267, 120, 82, OBSIDIAN, BLUE, 15)
    label(c, "DFF / AI", 776, 318, MINT, 12)
    label(c, "SIGNAL", 778, 291, BLUE, 8)
    label(c, "PRODUCT MARK", 758, 248, GRAY, 7)
    text(c, "Primary wordmark uses a signal dot. The monogram is the compact system mark. Product marks combine DFF with a clear functional label.", 56, 178, 780, 13, 19, GRAY, BODY, 4)
    pill(c, "CONCEPT IDENTITY", 56, 92, GOLD)


def construction(c: canvas.Canvas) -> None:
    page_base(c, 14, "GEOMETRIC CONSTRUCTION")
    label(c, "GEOMETRIC CONSTRUCTION", 54, 466, MINT, 9)
    title(c, "THE MARK LIVES ON AN 8X8 GRID", 54, 420, 780, 39)
    x, y, size = 94, 95, 310
    c.saveState()
    alpha_stroke(c, BLUE, 0.35)
    for i in range(9):
        c.line(x + i * size / 8, y, x + i * size / 8, y + size)
        c.line(x, y + i * size / 8, x + size, y + i * size / 8)
    c.restoreState()
    draw_mark(c, x + 35, y + 35, size - 70, MINT)
    alpha_stroke(c, GOLD, 0.8)
    c.circle(x + size * 0.76, y + size * 0.74, size * 0.17, fill=0, stroke=1)
    card(c, 485, 265, 380, 112, "Module", "Base module X = one grid cell. Corners use a controlled radius; the signal dot anchors the upper-right quadrant.", BLUE, "01", 16)
    card(c, 485, 125, 380, 112, "Construction logic", "Square container = system. DFF = identity. Signal dot = energy and active state.", MINT, "02", 16)


def clearance(c: canvas.Canvas) -> None:
    page_base(c, 15, "CONSTRUCTION & RESPONSIVE SCALING")
    label(c, "CLEARANCE / RESPONSIVE", 54, 466, MINT, 9)
    title(c, "SPACE MAKES THE SIGNAL LEGIBLE", 54, 420, 790, 39)
    round_panel(c, 54, 205, 420, 170, GRAPHITE, BLUE, 18)
    alpha_stroke(c, MINT, 0.7)
    c.setDash(4, 4)
    c.rect(90, 239, 350, 102, fill=0, stroke=1)
    c.setDash()
    draw_wordmark(c, 120, 273, 43, WHITE)
    label(c, "X", 70, 285, GOLD, 9)
    label(c, "X", 447, 285, GOLD, 9)
    text(c, "Minimum clearance = height of the signal dot x 4.", 72, 174, 400, 10.5, 14, GRAY, BODY, 2)
    scales = [("LARGE", 42, 520, 305), ("MEDIUM", 30, 520, 215), ("SMALL", 20, 520, 140)]
    for name, sz, x, y in scales:
        draw_wordmark(c, x, y, sz, WHITE)
        label(c, name, x, y - 18, GRAY, 7)
    draw_mark(c, 790, 260, 74, MINT)
    label(c, "AVATAR", 799, 241, GRAY, 7)


def compatibility(c: canvas.Canvas) -> None:
    page_base(c, 16, "BACKGROUND & IMAGERY COMPATIBILITY")
    label(c, "BACKGROUND / IMAGERY", 54, 466, MINT, 9)
    title(c, "CONTRAST BEFORE EFFECT", 54, 420, 670, 42)
    panels = [(OBSIDIAN, WHITE, "WHITE ON BLACK"), (OBSIDIAN, MINT, "MINT ON BLACK"), (MINT, OBSIDIAN, "BLACK ON MINT"), (GRAPHITE, WHITE, "WHITE ON GRAPHITE")]
    for i, (bg, fg, note) in enumerate(panels):
        x = 54 + (i % 2) * 430
        y = 232 if i < 2 else 80
        round_panel(c, x, y, 410, 126, bg, LINE, 16)
        draw_wordmark(c, x + 23, y + 54, 35, fg)
        label(c, note, x + 24, y + 20, GRAY if bg != MINT else OBSIDIAN, 7)
    pattern_ai(c, 695, 248, 160, 90, 1.2)
    text(c, "On imagery: reserve a calm dark zone or add a controlled graphite veil. Never place the wordmark over a high-frequency focal area.", 500, 183, 365, 10.4, 14, GRAY, BODY, 5)


def prohibited(c: canvas.Canvas) -> None:
    page_base(c, 17, "PROHIBITED APPLICATIONS")
    label(c, "PROHIBITED APPLICATIONS", 54, 466, RED, 9)
    title(c, "DO NOT BREAK THE SYSTEM", 54, 420, 740, 42)
    errors = [
        ("STRETCH", "No distortion"), ("RANDOM COLOR", "No arbitrary palette"),
        ("CHEAP SHADOW", "No hard glow or drop shadow"), ("LOW CONTRAST", "No noise behind the mark"),
        ("TILT", "No decorative rotation"), ("CROWD", "No dense text around it"),
    ]
    for i, (head, body) in enumerate(errors):
        x = 54 + (i % 3) * 292
        y = 235 if i < 3 else 80
        round_panel(c, x, y, 274, 124, GRAPHITE, RED, 14)
        label(c, head, x + 16, y + 96, RED, 8)
        text(c, "DIMKOFF", x + 18, y + 58, 210, 22, 24, GRAY, DISPLAY, 1)
        c.saveState()
        alpha_stroke(c, RED, 0.85)
        c.setLineWidth(2)
        c.line(x + 225, y + 30, x + 253, y + 58)
        c.line(x + 253, y + 30, x + 225, y + 58)
        c.restoreState()
        text(c, body, x + 16, y + 19, 210, 9.2, 12, GRAY, BODY, 1)


def app_icons(c: canvas.Canvas) -> None:
    page_base(c, 18, "APP ICON / DISPLAY MODES")
    label(c, "APP ICON / DISPLAY MODES", 54, 466, MINT, 9)
    title(c, "ONE MARK ACROSS SURFACES", 54, 420, 760, 42)
    modes = [(OBSIDIAN, MINT, "DEFAULT"), (GRAPHITE, WHITE, "DARK"), (WHITE, OBSIDIAN, "LIGHT"), (MINT, OBSIDIAN, "TINTED"), (VOLCANIC, WHITE, "MONO"), (BLUE, WHITE, "TELEGRAM")]
    for i, (bg, fg, name) in enumerate(modes):
        x = 70 + i * 142
        c.setFillColor(bg)
        c.roundRect(x, 240, 108, 108, 24, fill=1, stroke=0)
        draw_mark(c, x + 19, 259, 70, fg)
        label(c, name, x + 22, 217, GRAY, 7)
    round_panel(c, 70, 90, 818, 82, GRAPHITE, LINE, 16)
    draw_mark(c, 91, 105, 52, MINT)
    text(c, "APP ICON", 165, 137, 115, 12, 14, WHITE, DISPLAY, 1)
    text(c, "Default for products and favicon.", 165, 116, 190, 9.5, 12, GRAY, BODY, 2)
    draw_mark(c, 390, 105, 52, WHITE)
    text(c, "TG AVATAR", 464, 137, 115, 12, 14, WHITE, DISPLAY, 1)
    text(c, "Use a calm solid background.", 464, 116, 170, 9.5, 12, GRAY, BODY, 2)
    c.setFillColor(MINT)
    c.roundRect(665, 99, 72, 64, 14, fill=1, stroke=0)
    draw_mark(c, 675, 105, 52, OBSIDIAN)
    text(c, "LIGHT MODE", 749, 137, 120, 12, 14, WHITE, DISPLAY, 1)
    text(c, "Mint container, black mark.", 749, 116, 120, 9.5, 12, GRAY, BODY, 2)


def color_context(c: canvas.Canvas) -> None:
    page_base(c, 19, "COLOR IN CONTEXT")
    label(c, "COLOR IN CONTEXT", 54, 466, MINT, 9)
    title(c, "COLOR IS A FUNCTION", 54, 420, 680, 44)
    tiles = [
        (MINT, "SIGNAL MINT", "DIGITAL ENERGY"), (WHITE, "WARM WHITE", "PURE SPACE"),
        (GRAY, "CANYON GRAY", "NEURAL BALANCE"), (OBSIDIAN, "OBSIDIAN", "DEEP FOUNDATION"),
        (BLUE, "DIGITAL BLUE", "PRODUCT LOGIC"), (GREEN, "GROWTH GREEN", "ACTION"),
    ]
    for i, (col, name, role) in enumerate(tiles):
        x = 54 + (i % 3) * 292
        y = 228 if i < 3 else 70
        palette_tile(c, x, y, 274, 132, col, name, role)


def color_architecture(c: canvas.Canvas) -> None:
    page_base(c, 20, "COLOR ARCHITECTURE")
    label(c, "COLOR ARCHITECTURE", 54, 466, MINT, 9)
    title(c, "PRIMARY. SUPPORT. VALUE.", 54, 420, 760, 42)
    colors = [
        (OBSIDIAN, "OBSIDIAN", "#080A0F", "8 10 15", "BASE"),
        (GRAPHITE, "GRAPHITE", "#11151D", "17 21 29", "SURFACE"),
        (MINT, "SIGNAL MINT", "#00FFD1", "0 255 209", "PRIMARY"),
        (DEEP_MINT, "DEEP MINT", "#00BFA6", "0 191 166", "ENERGY"),
        (BLUE, "DIGITAL BLUE", "#5D8CFF", "93 140 255", "LOGIC"),
        (WHITE, "WARM WHITE", "#F5F0E8", "245 240 232", "TEXT"),
        (GREEN, "GROWTH GREEN", "#8FD66B", "143 214 107", "ACTION"),
        (GOLD, "WARM GOLD", "#D8B35E", "216 179 94", "PREMIUM"),
    ]
    for i, (col, name, hexv, rgb, role) in enumerate(colors):
        x = 54 + i * 106
        c.setFillColor(col)
        c.rect(x, 150, 92, 190, fill=1, stroke=0)
        contrast = OBSIDIAN if col in (MINT, WHITE, GREEN, GOLD) else WHITE
        c.setFillColor(contrast)
        c.setFont(MONO, 7.1)
        c.drawString(x + 8, 318, role)
        c.drawString(x + 8, 173, hexv)
        c.drawString(x + 8, 160, rgb)
        c.saveState()
        c.translate(x + 18, 190)
        c.rotate(90)
        c.setFont(DISPLAY, 10.5)
        c.drawString(0, 0, name)
        c.restoreState()
    text(c, "Gold is never a primary signal. Use it only for premium value, selected proof and small highlights.", 54, 100, 650, 11, 15, GRAY, BODY, 3)


def color_dynamics(c: canvas.Canvas) -> None:
    page_base(c, 21, "LOGO COLOR DYNAMICS")
    label(c, "LOGO COLOR DYNAMICS", 54, 466, MINT, 9)
    title(c, "THE MARK ADAPTS. THE SIGNAL STAYS.", 54, 420, 830, 38)
    combos = [
        ("PRIMARY", OBSIDIAN, MINT, "Digital product / active signal"),
        ("EDITORIAL", OBSIDIAN, WHITE, "Long-form / calm premium"),
        ("INVERSE", MINT, OBSIDIAN, "CTA / icon / high visibility"),
        ("MONO", GRAPHITE, WHITE, "Documents / low-color output"),
        ("PREMIUM", OBSIDIAN, GOLD, "Small value accent only"),
    ]
    for i, (name, bg, fg, note) in enumerate(combos):
        x = 54 + i * 170
        c.setFillColor(bg)
        c.roundRect(x, 205, 150, 148, 16, fill=1, stroke=0)
        draw_mark(c, x + 39, 248, 72, fg)
        label(c, name, x + 12, 224, fg if bg != MINT else OBSIDIAN, 7)
        text(c, note, x, 165, 150, 9.2, 12, GRAY, BODY, 3)
    round_panel(c, 54, 80, 830, 55, GRAPHITE, RED, 12)
    label(c, "CONTRAST RULE", 70, 113, RED, 7.5)
    text(c, "If the mark cannot be read at a glance, change the background - never add a decorative effect to compensate.", 190, 112, 670, 10, 13, WHITE, BODY, 2)


def typography(c: canvas.Canvas) -> None:
    page_base(c, 22, "TYPOGRAPHY SYSTEM")
    label(c, "TYPOGRAPHY SYSTEM", 54, 466, MINT, 9)
    title(c, "HIERARCHY IS THE VOICE", 54, 420, 760, 44)
    c.setFont(DISPLAY, 64)
    c.setFillColor(WHITE)
    c.drawString(54, 292, "SIGNAL / 01")
    label(c, "DISPLAY / ARIAL BOLD / UPPERCASE / 64", 58, 270, MINT, 7.4)
    text(c, "Смысл раньше инструмента.", 56, 220, 480, 28, 32, WHITE, DISPLAY, 1)
    label(c, "HEADLINE / ARIAL BOLD / 28", 58, 196, BLUE, 7.4)
    text(c, "DimkoFF работает на стыке маркетинга, AI и продукта. Основной текст короткий, ясный и функциональный.", 56, 145, 430, 13, 18, GRAY, BODY, 4)
    label(c, "BODY / ARIAL / 13", 58, 83, GRAY, 7.4)
    round_panel(c, 575, 112, 310, 228, GRAPHITE, MINT, 18)
    label(c, "TECHNICAL NOTE", 598, 308, MINT, 8)
    c.setFont(MONO, 12)
    c.setFillColor(WHITE)
    for i, line in enumerate(["GRID: 12 COL", "MARGIN: 54", "TITLE: 38-76", "BODY: 10-17", "TRACKING: +", "CASE: UPPER"]):
        c.drawString(600, 275 - i * 28, line)


def layout_system(c: canvas.Canvas) -> None:
    page_base(c, 23, "LAYOUT SYSTEM")
    label(c, "LAYOUT SYSTEM", 54, 466, BLUE, 9)
    title(c, "12 COLUMNS. POSTER RHYTHM.", 54, 420, 760, 42)
    x0, y0, gw, gh = 54, 88, 852, 260
    gutter = 8
    colw = (gw - gutter * 11) / 12
    for i in range(12):
        c.saveState()
        alpha_fill(c, BLUE, 0.06 if i % 2 else 0.11)
        c.rect(x0 + i * (colw + gutter), y0, colw, gh, fill=1, stroke=0)
        c.restoreState()
    c.saveState()
    alpha_stroke(c, MINT, 0.7)
    c.rect(x0, y0, gw, gh, fill=0, stroke=1)
    c.restoreState()
    label(c, "TITLE ZONE / 8 COL", 72, 310, MINT, 7)
    c.setFillColor(WHITE)
    c.setFont(DISPLAY, 31)
    c.drawString(72, 260, "LARGE IDEA")
    text(c, "One dominant message. Supporting notes live in narrow technical zones.", 72, 225, 470, 12, 16, GRAY, BODY, 3)
    round_panel(c, 650, 130, 220, 160, GRAPHITE, BLUE, 12)
    label(c, "SYSTEM PANEL", 670, 260, BLUE, 7)
    text(c, "Cards align to the same grid and never compete with the headline.", 670, 225, 180, 11, 15, WHITE, BODY, 5)


def patterns_intro(c: canvas.Canvas) -> None:
    section_page(c, 24, "07", "GRAPHIC PATTERNS", "Background intelligence. Low contrast. Always supporting the message.", MINT)


def two_patterns(c: canvas.Canvas, page_no: int, left_name: str, right_name: str, left_fn, right_fn, left_color, right_color, left_note: str, right_note: str) -> None:
    page_base(c, page_no, f"PATTERNS / {left_name} + {right_name}")
    label(c, "GRAPHIC PATTERNS", 54, 466, MINT, 9)
    title(c, f"{left_name} / {right_name}", 54, 420, 760, 42)
    round_panel(c, 54, 122, 410, 240, GRAPHITE, left_color, 18)
    round_panel(c, 496, 122, 410, 240, GRAPHITE, right_color, 18)
    left_fn(c, 72, 142, 374, 190, 1.25)
    right_fn(c, 514, 142, 374, 190, 1.25)
    label(c, left_name, 72, 330, left_color, 8)
    label(c, right_name, 514, 330, right_color, 8)
    text(c, left_note, 54, 88, 410, 9.5, 12, GRAY, BODY, 2)
    text(c, right_note, 496, 88, 410, 9.5, 12, GRAY, BODY, 2)


def funnel_map(c: canvas.Canvas) -> None:
    page_base(c, 28, "FUNNEL MAP / PATTERN APPLICATION")
    label(c, "FUNNEL MAP", 54, 466, MINT, 9)
    title(c, "ATTENTION BECOMES RETENTION", 54, 420, 780, 41)
    stages = [("01", "ATTENTION", GOLD), ("02", "TRUST", BLUE), ("03", "LEAD", MINT), ("04", "PRODUCT", DEEP_MINT), ("05", "RETENTION", GREEN)]
    for i, (num, head, accent) in enumerate(stages):
        x = 54 + i * 170
        round_panel(c, x, 225, 146, 115, GRAPHITE, accent, 14)
        label(c, num, x + 14, 312, accent, 7)
        text(c, head, x + 14, 278, 118, 13, 15, WHITE, DISPLAY, 2)
        if i < 4:
            draw_arrow(c, x + 147, 282, x + 166, 282, accent, 0.8)
    round_panel(c, 54, 82, 826, 92, GRAPHITE, LINE, 16)
    pattern_signal(c, 70, 95, 150, 62, 0.9)
    pattern_system(c, 230, 95, 150, 62, 0.9)
    pattern_product(c, 390, 95, 150, 62, 0.9)
    pattern_growth(c, 550, 95, 150, 62, 0.9)
    pattern_ai(c, 710, 95, 150, 62, 0.9)
    text(c, "Keep patterns in the background, low contrast, so they support content and never fight the message.", 245, 191, 470, 10, 13, GRAY, BODY, 2)


def real_products(c: canvas.Canvas) -> None:
    section_page(c, 29, "08", "REAL PRODUCTS", "Working products prove that the identity can move from signal to interface, backend and launch.", GREEN)


def calorie_case(c: canvas.Canvas) -> None:
    page_base(c, 30, "CASE / CALORIEPT AI", False)
    glow(c, 770, 290, 210, GREEN, 0.18)
    ghost(c, "KCAL", 430, 75, 180, GREEN, 0.06, -5)
    label(c, "CASE 01 / LIVE PRODUCT", 54, 466, GREEN, 9)
    title(c, "CALORIEPT AI", 54, 420, 560, 58)
    text(c, "AI nutrition product inside Telegram", 58, 355, 530, 19, 23, MINT, DISPLAY, 2)
    text(c, "Telegram Mini App: фото еды, КБЖУ, дневник, AI-итог дня, рецепты из холодильника и список покупок.", 58, 293, 480, 13.5, 19, WHITE, BODY, 4)
    phone(c, ASSETS / "caloriept-ai-live.png", 666, 85, 182, 365)
    card(c, 54, 112, 250, 118, "Context", "Ручной ввод быстро надоедает и не создаёт персонального сопровождения.", GOLD, "01", 15)
    card(c, 322, 112, 250, 118, "Solution", "Фото -> анализ -> дневник -> summary -> recipes -> retention.", GREEN, "02", 15)


def calorie_system(c: canvas.Canvas) -> None:
    page_base(c, 31, "CALORIEPT / PRODUCT SYSTEM")
    label(c, "PRODUCT SYSTEM", 54, 466, GREEN, 9)
    title(c, "FROM PHOTO TO REPEAT ACTION", 54, 420, 760, 42)
    flow = ["PHOTO", "AI ANALYSIS", "DIARY", "AI SUMMARY", "FRIDGE", "SHOPPING", "RETENTION"]
    for i, item in enumerate(flow):
        x = 46 + i * 128
        round_panel(c, x, 285, 112, 64, GRAPHITE, GREEN if i > 2 else MINT, 12)
        label(c, f"0{i+1}", x + 10, 327, GRAY, 6.2)
        text(c, item, x + 10, 305, 94, 9.5, 11, WHITE, DISPLAY, 2)
        if i < len(flow) - 1:
            draw_arrow(c, x + 113, 317, x + 125, 317, MINT, 0.75)
    created = ["Telegram bot", "Mini App", "AI vision", "products.db", "fridge flow", "shopping list", "frequent foods", "day summary", "quota protection", "premium mobile UI"]
    x, y = 54, 215
    for item in created:
        pw = pill(c, item, x, y, GREEN)
        x += pw + 9
        if x > 820:
            x, y = 54, y - 34
    card(c, 54, 78, 852, 92, "What it proves", "AI product logic, Telegram Mini App, backend, retention UX, controlled fallbacks, quota protection and production ownership.", BLUE, "EVIDENCE", 16)


def stylist_case(c: canvas.Canvas) -> None:
    page_base(c, 32, "CASE / STYLIST AI", False)
    glow(c, 750, 300, 220, GOLD, 0.14)
    ghost(c, "STYLE", 390, 66, 170, GOLD, 0.05, -6)
    label(c, "CASE 02 / WORKING BUILD", 54, 466, GOLD, 9)
    title(c, "STYLIST AI", 54, 420, 500, 58)
    text(c, "AI fashion assistant for premium personal styling", 58, 355, 520, 18, 23, GOLD, DISPLAY, 3)
    text(c, "Premium Mini App с гардеробом, AI-стилистом, палитрой, look recommendations и editorial aesthetics.", 58, 275, 455, 13.5, 19, WHITE, BODY, 5)
    phone(c, ASSETS / "stylist-ai-showcase.png", 590, 92, 146, 342)
    phone(c, ASSETS / "stylist-ai-palette.png", 752, 92, 146, 342)
    card(c, 54, 104, 450, 116, "Premium product logic", "Wardrobe -> stylist -> looks -> recommendations -> premium experience.", GOLD, "FLOW", 15)


def stylist_system(c: canvas.Canvas) -> None:
    page_base(c, 33, "STYLIST / PRODUCT SYSTEM")
    label(c, "PRODUCT SYSTEM", 54, 466, GOLD, 9)
    title(c, "PREMIUM UX IS A SYSTEM", 54, 420, 750, 43)
    phone(c, ASSETS / "stylist-ai-quick-chat.png", 54, 91, 146, 324)
    phone(c, ASSETS / "stylist-ai-rachel.png", 218, 91, 146, 324)
    items = [
        ("SHOWCASE", "Выбор AI-стилиста как витрина, без лишнего чата.", GOLD),
        ("QUICK CHAT", "Единый разговор с выбранным stylistId.", MINT),
        ("PROFILE DATA", "Палитра, тип фигуры, мерки, гардероб и каталог.", BLUE),
        ("PREMIUM UI", "Editorial rhythm, dark surfaces, focused actions.", GOLD),
    ]
    for i, (head, body, accent) in enumerate(items):
        x = 418 + (i % 2) * 240
        y = 260 if i < 2 else 102
        card(c, x, y, 222, 132, head, body, accent, f"0{i+1}", 14)


def bot_portfolio(c: canvas.Canvas) -> None:
    page_base(c, 34, "AI BOT PORTFOLIO")
    label(c, "DIGITAL ECOSYSTEM", 54, 466, MINT, 9)
    title(c, "THREE NICHES. ONE DELIVERY LOGIC.", 54, 420, 820, 38)
    bots = [
        ("Psy Mind AI", "PSYCHOLOGY", "Self-reflection / sensitive conversation design.", "psy-mind-ai-card.png", DEEP_MINT),
        ("BusinessMentorAI_bot", "BUSINESS EDUCATION", "AI mentor / expert Telegram product.", "businessmen-ai-card.png", GOLD),
        ("Pulse AI Coach", "COACHING", "Habits / performance / recurring scenarios.", "pulse-ai-coach-card.png", BLUE),
    ]
    for i, (name, niche, body, image, accent) in enumerate(bots):
        x = 54 + i * 292
        round_panel(c, x, 84, 274, 285, GRAPHITE, accent, 18)
        draw_image_cover(c, ASSETS / image, x + 12, 207, 250, 146, 12)
        label(c, niche, x + 16, 185, accent, 7)
        text(c, name, x + 16, 157, 242, 16, 18, WHITE, DISPLAY, 2)
        text(c, body, x + 16, 117, 242, 10.2, 13.5, GRAY, BODY, 3)
        pill(c, "REAL", x + 16, 93, accent)


def demo_lab(c: canvas.Canvas) -> None:
    page_base(c, 35, "DEMO LAB")
    label(c, "7.0 DEMO LAB", 54, 466, BLUE, 9)
    title(c, "REAL PRODUCTS / NEXT CONCEPTS", 54, 420, 820, 40)
    real = ["CALORIEPT AI", "STYLIST AI", "PSY MIND AI", "BUSINESSMENTOR", "PULSE AI COACH"]
    concepts = ["AI DIRECTOR", "EXPERTOS", "BRIEFPILOT", "LAUNCHKIT", "SIGNAL HOUSE", "SIGNAL FIELD 3D"]
    label(c, "A / REAL PRODUCTS", 54, 340, GREEN, 8)
    for i, item in enumerate(real):
        x = 54 + (i % 3) * 286
        y = 240 if i < 3 else 158
        round_panel(c, x, y, 268, 62, GRAPHITE, GREEN, 12)
        text(c, item, x + 15, y + 24, 220, 11.5, 13, WHITE, DISPLAY, 1)
        pill(c, "REAL", x + 195, y + 20, GREEN)
    label(c, "B / NEXT CONCEPTS", 54, 125, BLUE, 8)
    x = 54
    for item in concepts:
        pw = pill(c, item, x, 79, BLUE)
        x += pw + 10
        if x > 820:
            x = 54


def ai_director(c: canvas.Canvas) -> None:
    page_base(c, 36, "AI DIRECTOR / IN PLANNING", False)
    glow(c, 730, 280, 235, MINT, 0.24)
    pattern_ai(c, 610, 110, 280, 320, 1.3)
    label(c, "NEXT PRODUCT CONCEPT / IN PLANNING", 54, 466, MINT, 9)
    title(c, "AI DIRECTOR", 54, 420, 560, 62)
    text(c, "Telegram-система для собственника: деньги, задачи, продажи, риски и рекомендации в ежедневной бизнес-сводке.", 58, 333, 500, 15, 21, WHITE, BODY, 5)
    round_panel(c, 600, 180, 290, 212, GRAPHITE, MINT, 18)
    label(c, "DAILY BUSINESS PULSE", 620, 365, MINT, 7)
    for i, (head, value, accent) in enumerate([("REVENUE", "+12%", GREEN), ("RISKS", "03", RED), ("TASKS", "07", BLUE)]):
        x = 620 + i * 86
        label(c, head, x, 321, GRAY, 6)
        text(c, value, x, 292, 70, 18, 20, accent, DISPLAY, 1)
    alpha_stroke(c, MINT, 0.6)
    points = [(622, 235), (655, 252), (690, 243), (728, 270), (766, 260), (806, 294), (850, 286)]
    for a, b in zip(points, points[1:]):
        c.line(a[0], a[1], b[0], b[1])
    for px, py in points:
        c.setFillColor(MINT)
        c.circle(px, py, 3, fill=1, stroke=0)
    card(c, 54, 120, 505, 140, "Entry offer hypothesis", "Бесплатный AI-аудит бизнеса за 7 минут: где теряются деньги, какие задачи тормозят рост и что сделать в ближайшие 72 часа.", GOLD, "MVP ENTRY", 17)
    pill(c, "NOT A FINISHED PRODUCT", 600, 120, RED)


def for_clients(c: canvas.Canvas) -> None:
    page_base(c, 37, "FOR CLIENTS")
    label(c, "FOR CLIENTS", 54, 466, MINT, 9)
    title(c, "WHAT WE CAN BUILD FOR YOUR BUSINESS", 54, 420, 840, 39)
    services = [
        ("SMM SYSTEM", "Positioning, content, nurture, Telegram funnel.", GOLD),
        ("AI BOT", "Consultation, applications, knowledge and retention.", MINT),
        ("TELEGRAM MINI APP", "Account, service, subscription and analytics.", BLUE),
        ("ONLINE BUSINESS", "Landing, bot, Mini App, CRM, AI and payments.", DEEP_MINT),
        ("AI AUTOMATION", "Summaries, reports, leads, tasks and routine.", GREEN),
    ]
    for i, (head, body, accent) in enumerate(services):
        x = 54 + (i % 3) * 292
        y = 232 if i < 3 else 82
        card(c, x, y, 274, 126, head, body, accent, f"0{i+1}", 15)
    pill(c, "CTA / DISCUSS A PROJECT", 638, 102, MINT, True)


def for_employers(c: canvas.Canvas) -> None:
    page_base(c, 38, "FOR EMPLOYERS")
    label(c, "FOR EMPLOYERS", 54, 466, BLUE, 9)
    title(c, "SMM SPECIALIST AMPLIFIED BY AI PRODUCTS", 54, 420, 830, 38)
    roles = ["SMM SPECIALIST", "DIGITAL MARKETING", "AI MARKETING", "TELEGRAM MARKETING", "PRODUCT MARKETING", "CREATIVE DIGITAL", "AI PRODUCT BUILDER"]
    x, y = 54, 325
    for role in roles:
        pw = pill(c, role, x, y, BLUE)
        x += pw + 10
        if x > 810:
            x, y = 54, y - 34
    card(c, 54, 102, 400, 155, "Marketing layer", "Аудитория, positioning, content strategy, short-form, Telegram, funnel и analytics.", GOLD, "CAN LEAD", 18)
    card(c, 478, 102, 428, 155, "Product layer", "AI-механики, Mini Apps, automation, prototype, responsive UI, backend и deploy.", MINT, "CAN BUILD", 18)


def proof(c: canvas.Canvas) -> None:
    page_base(c, 39, "PROOF SYSTEM")
    label(c, "PROOF SYSTEM", 54, 466, GREEN, 9)
    title(c, "EVIDENCE BEFORE PROMISES", 54, 420, 760, 44)
    proofs = [
        ("CALORIEPT AI", "AI product, vision, retention, backend, quota protection.", GREEN),
        ("STYLIST AI", "Premium product design, fashion positioning and UI.", GOLD),
        ("AI BOT PORTFOLIO", "Conversation design across three different niches.", MINT),
        ("OUTREACH PACK", "Launch, sales, GTM and evidence-based qualification.", BLUE),
        ("AI DIRECTOR", "Next level: a business system, not just a bot.", DEEP_MINT),
    ]
    for i, (head, body, accent) in enumerate(proofs):
        x = 54 + (i % 3) * 292
        y = 230 if i < 3 else 82
        card(c, x, y, 274, 126, head, body, accent, f"0{i+1}", 15)


def final(c: canvas.Canvas) -> None:
    page_base(c, 40, "FINAL POSTER", False)
    glow(c, 735, 265, 260, MINT, 0.28)
    ghost(c, "DFF", 390, 35, 290, MINT, 0.08, -5)
    pattern_ai(c, 630, 85, 270, 340, 1.2)
    draw_wordmark(c, 54, 398, 78, WHITE)
    text(c, "SIGNAL INTO SYSTEM", 58, 310, 560, 28, 33, MINT, DISPLAY, 1)
    text(c, "SYSTEM INTO PRODUCT", 58, 268, 600, 28, 33, WHITE, DISPLAY, 1)
    text(c, "PRODUCT INTO GROWTH", 58, 226, 600, 28, 33, WHITE, DISPLAY, 1)
    label(c, "SMM + AI PRODUCT BUILDER / 2026", 58, 172, GOLD, 9)
    text(c, "Portfolio: dmitriyn684-pixel.github.io/stylist-mini-app/portfolio/", 58, 117, 560, 10.5, 14, GRAY, MONO, 2)
    text(c, "Telegram: [confirm]   Email: [confirm]", 58, 86, 500, 10.5, 14, GRAY, MONO, 1)
    draw_mark(c, 766, 358, 106, MINT)


def build_pages():
    return [
        cover, positioning, core_idea, who, pillars, metaphors, method_intro,
        lambda c: method_page(c, 8, "SIGNAL", "01", GOLD, ["NICHE", "AUDIENCE", "PAIN", "OFFER", "POSITIONING", "CONTENT SIGNALS"], "Find the strongest market signal before choosing the channel."),
        lambda c: method_page(c, 9, "SYSTEM", "02", BLUE, ["SMM STRATEGY", "CONTENT", "TELEGRAM FUNNEL", "LEAD MAGNET", "ANALYTICS"], "Turn scattered activities into a clear route with one next action."),
        lambda c: method_page(c, 10, "PRODUCT", "03", MINT, ["AI BOT", "MINI APP", "LANDING", "BACKEND", "DATABASE", "AUTOMATION"], "Package the idea into a useful digital instrument, not a feature list."),
        lambda c: method_page(c, 11, "GROWTH", "04", GREEN, ["LAUNCH", "TEST", "DATA", "UX", "RETENTION", "SCALE"], "Release, observe, improve and repeat the action that creates value."),
        visual_divider, logo_anatomy, construction, clearance, compatibility, prohibited, app_icons,
        color_context, color_architecture, color_dynamics, typography, layout_system, patterns_intro,
        lambda c: two_patterns(c, 25, "SIGNAL PATTERN", "SYSTEM PATTERN", pattern_signal, pattern_system, MINT, BLUE, "Dots, pulses and arrows reveal active market energy.", "Brackets, nodes and grids express structure and operating logic."),
        lambda c: two_patterns(c, 26, "PRODUCT PATTERN", "GROWTH PATTERN", pattern_product, pattern_growth, GOLD, GREEN, "Interface blocks show ideas becoming tangible tools.", "Cycles and rising arrows represent learning, not vanity growth."),
        lambda c: two_patterns(c, 27, "AI GRID", "TELEGRAM FLOW", pattern_ai, pattern_telegram, MINT, BLUE, "Neural nodes support AI product contexts at low contrast.", "Chat bubbles and flow nodes support Telegram-first stories."),
        funnel_map, real_products, calorie_case, calorie_system, stylist_case, stylist_system,
        bot_portfolio, demo_lab, ai_director, for_clients, for_employers, proof, final,
    ]


def main() -> None:
    register_fonts()
    pages = build_pages()
    if len(pages) != 40:
        raise RuntimeError(f"Expected 40 pages, got {len(pages)}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(W, H), pageCompression=1)
    c.setTitle("DimkoFF Visual Brand Guideline 2026")
    c.setAuthor("DimkoFF")
    c.setSubject("SMM + AI Product Builder / Visual Brand System")
    for render in pages:
        render(c)
        c.showPage()
    c.save()
    shutil.copy2(OUT, PUBLIC)
    print(OUT)
    print(PUBLIC)


if __name__ == "__main__":
    main()
