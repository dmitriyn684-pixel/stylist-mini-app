from __future__ import annotations

import os
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "dimkoff-brandbook-2026.pdf"
ASSETS = ROOT / "brandbook" / "assets" / "cases"
PUBLIC_PDF = ROOT / "public" / "portfolio" / OUT.name

PAGE = landscape((13.333 * inch, 7.5 * inch))
W, H = PAGE

BG = HexColor("#0B0E12")
PANEL = HexColor("#151A21")
PANEL_2 = HexColor("#1D242D")
TEXT = HexColor("#F4F1E8")
MUTED = HexColor("#9BA6B2")
LINE = HexColor("#2A3440")
LIME = HexColor("#C8FF4D")
GOLD = HexColor("#E4B765")
BLUE = HexColor("#72A7FF")
TEAL = HexColor("#5BD6C7")
ROSE = HexColor("#F19AB7")


def register_fonts() -> None:
    fonts = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
    pdfmetrics.registerFont(TTFont("Arial", str(fonts / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("Arial-Bold", str(fonts / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("Georgia", str(fonts / "georgia.ttf")))
    pdfmetrics.registerFont(TTFont("Georgia-Bold", str(fonts / "georgiab.ttf")))


def words(text: str, font: str, size: float, max_width: float) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        if not paragraph:
            lines.append("")
            continue
        current = ""
        for token in paragraph.split():
            candidate = token if not current else f"{current} {token}"
            if pdfmetrics.stringWidth(candidate, font, size) <= max_width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = token
        if current:
            lines.append(current)
    return lines


def text_block(c, text, x, y, width, size=16, leading=None, color=TEXT, font="Arial", max_lines=None):
    leading = leading or size * 1.35
    lines = words(text, font, size, width)
    if max_lines:
        lines = lines[:max_lines]
    c.setFont(font, size)
    c.setFillColor(color)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def label(c, text, x, y, color=LIME):
    c.setFont("Arial-Bold", 9)
    c.setFillColor(color)
    c.drawString(x, y, text.upper())


def title(c, text, x=54, y=H - 105, width=820, size=31, color=TEXT):
    return text_block(c, text, x, y, width, size=size, leading=size * 1.08, color=color, font="Georgia-Bold")


def page_base(c, number, section):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(54, H - 42, W - 54, H - 42)
    label(c, f"DIMKOFF / {section}", 54, H - 31, MUTED)
    c.setFont("Arial", 8)
    c.setFillColor(MUTED)
    c.drawRightString(W - 54, 24, f"{number:02d} / 25")
    c.setFillColor(LIME)
    c.circle(W - 38, H - 28, 3, fill=1, stroke=0)


def accent_rule(c, x, y, width=52, color=LIME):
    c.setFillColor(color)
    c.roundRect(x, y, width, 4, 2, fill=1, stroke=0)


def card(c, x, y, w, h, heading, body, accent=LIME, meta=None, heading_size=17):
    c.setFillColor(PANEL)
    c.roundRect(x, y, w, h, 14, fill=1, stroke=0)
    c.setFillColor(accent)
    c.roundRect(x + 16, y + h - 22, 30, 4, 2, fill=1, stroke=0)
    if meta:
        label(c, meta, x + 16, y + h - 42, MUTED)
        hy = y + h - 67
    else:
        hy = y + h - 48
    text_block(c, heading, x + 16, hy, w - 32, size=heading_size, leading=heading_size * 1.12, font="Arial-Bold")
    text_block(c, body, x + 16, hy - 46, w - 32, size=10.5, leading=14.5, color=MUTED, max_lines=5)


def bullet_list(c, items, x, y, width, size=13, gap=18, accent=LIME):
    for item in items:
        c.setFillColor(accent)
        c.circle(x + 3, y + 4, 2.5, fill=1, stroke=0)
        y = text_block(c, item, x + 14, y + 9, width - 14, size=size, leading=size * 1.32, color=TEXT) - gap
    return y


def draw_image_cover(c, path: Path, x, y, w, h, radius=14):
    img = ImageReader(str(path))
    iw, ih = img.getSize()
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    dx, dy = x + (w - dw) / 2, y + (h - dh) / 2
    c.saveState()
    clip = c.beginPath()
    clip.roundRect(x, y, w, h, radius)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(img, dx, dy, width=dw, height=dh, mask="auto")
    c.restoreState()
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, radius, fill=0, stroke=1)


def phone(c, path: Path, x, y, w, h):
    c.setFillColor(HexColor("#050608"))
    c.roundRect(x - 6, y - 6, w + 12, h + 12, 24, fill=1, stroke=0)
    draw_image_cover(c, path, x, y, w, h, 19)


def flow(c, labels, x, y, total_w, accent=LIME):
    gap = 10
    cell_w = (total_w - gap * (len(labels) - 1)) / len(labels)
    for idx, item in enumerate(labels):
        cx = x + idx * (cell_w + gap)
        c.setFillColor(PANEL if idx % 2 == 0 else PANEL_2)
        c.roundRect(cx, y, cell_w, 58, 12, fill=1, stroke=0)
        label(c, f"0{idx + 1}", cx + 12, y + 40, accent)
        text_block(c, item, cx + 12, y + 23, cell_w - 24, size=10.5, leading=12, font="Arial-Bold", max_lines=2)


def cover(c):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(PANEL)
    c.circle(W - 80, H + 40, 265, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    for i in range(6):
        c.circle(W - 80, H + 40, 92 + i * 28, fill=0, stroke=1)
    label(c, "PERSONAL BRAND SYSTEM / 2026", 58, H - 62)
    c.setFont("Georgia-Bold", 63)
    c.setFillColor(TEXT)
    c.drawString(58, H - 162, "DimkoFF")
    text_block(c, "SMM + AI Product Builder", 62, H - 205, 650, 25, 30, LIME, "Arial-Bold")
    text_block(c, "Соединяю SMM, AI и разработку, чтобы запускать онлайн-продукты под ключ.", 62, H - 272, 610, 18, 26, TEXT, "Arial")
    flow(c, ["SIGNAL", "SYSTEM", "PRODUCT", "LAUNCH"], 62, 82, 670)
    c.setFont("Arial", 9)
    c.setFillColor(MUTED)
    c.drawRightString(W - 56, 28, "Brandbook / Portfolio / Commercial system")


def page_2(c):
    page_base(c, 2, "BRAND IDEA")
    label(c, "THE CORE", 54, H - 76)
    title(c, "Не контент отдельно. Не код отдельно.")
    text_block(c, "DimkoFF связывает сообщение, путь клиента и техническую реализацию в одной системе.", 54, H - 196, 620, 18, 25, MUTED)
    flow(c, ["Внимание", "Доверие", "Действие", "Digital-инструмент", "Данные"], 54, 102, W - 108, GOLD)
    c.setFont("Georgia-Bold", 44)
    c.setFillColor(PANEL_2)
    c.drawRightString(W - 58, 205, "SMM x AI x PRODUCT")


def page_3(c):
    page_base(c, 3, "POSITIONING")
    title(c, "SMM-мышление + AI-продуктовая разработка + запуск под ключ", size=26)
    card(c, 54, 190, 270, 170, "Стратег", "Начинает с аудитории, задачи, оффера и измеримого следующего действия.", GOLD, "ARCHETYPE")
    card(c, 344, 190, 270, 170, "Создатель", "Переводит идею в интерфейс, Telegram-сценарий, AI-логику и рабочий MVP.", LIME, "ARCHETYPE")
    card(c, 634, 190, 270, 170, "Проводник", "Объясняет технологии через пользовательскую и бизнес-ценность, без AI-hype.", BLUE, "ARCHETYPE")
    text_block(c, "Ключевая разница: один владелец логики от позиционирования до production.", 54, 145, 820, 17, 23, TEXT, "Arial-Bold")


def page_4(c):
    page_base(c, 4, "ONE-LINER SYSTEM")
    title(c, "Один бренд - три режима разговора")
    card(c, 54, 242, 270, 176, "Универсальный", "Соединяю SMM, AI и разработку, чтобы запускать онлайн-продукты под ключ.", LIME)
    card(c, 344, 242, 270, 176, "Для клиента", "От позиционирования и контента до Telegram-бота, Mini App, сайта и запуска.", GOLD)
    card(c, 634, 242, 270, 176, "Для работодателя", "Усиливаю SMM и product-команды digital-механиками, AI и быстрыми MVP.", BLUE)
    label(c, "RULE", 54, 177, MUTED)
    text_block(c, "Меняется акцент, но не категория: SMM + AI Product Builder.", 54, 152, 820, 18, 24, TEXT, "Arial-Bold")


def page_5(c):
    page_base(c, 5, "ABOUT")
    title(c, "От сигнала рынка до работающего продукта")
    flow(c, ["Ниша", "Позиционирование", "Контент", "Воронка", "Продукт", "Запуск"], 54, 330, W - 108, LIME)
    bullet_list(c, [
        "SMM - фундамент: анализ, сообщение, контент, short-form, Telegram, прогрев и аналитика.",
        "Product - способ сделать обещание полезным: CJM, onboarding, activation, retention и fallback.",
        "AI и разработка - слой реализации: бот, Mini App, web, backend, данные и deploy.",
    ], 54, 255, 780, 14, 16, GOLD)


def page_6(c):
    page_base(c, 6, "AUDIENCES")
    title(c, "Два маршрута доверия")
    card(c, 54, 165, 402, 264, "Клиенты", "Эксперты, малый бизнес, онлайн-школы, Telegram-проекты. Задача - упаковать идею, привлечь аудиторию и запустить digital-продукт.", GOLD, "ROUTE A", 23)
    card(c, 476, 165, 428, 264, "Работодатели", "SMM, marketing, AI-product и digital-команды. Задача - соединить контент, воронку, MVP и техническую реализацию.", BLUE, "ROUTE B", 23)
    text_block(c, "Обе аудитории видят одни доказательства, но получают разный следующий шаг.", 54, 116, 820, 15, 21, MUTED)


def page_7(c):
    page_base(c, 7, "FOR CLIENTS")
    title(c, "Из экспертизы или идеи - в связный коммерческий маршрут")
    left = ["Позиционирование и message house", "Контентная система и short-form", "Telegram-воронка и лид-магнит"]
    right = ["AI-бот или Mini App", "Landing, автоматизация и события", "Запуск, QA и итерация"]
    bullet_list(c, left, 64, 352, 390, 14, 21, GOLD)
    bullet_list(c, right, 500, 352, 390, 14, 21, LIME)
    card(c, 54, 105, 850, 104, "Коммерческий принцип", "Технология подключается только там, где сокращает путь, персонализирует опыт, возвращает пользователя или убирает ручную работу.", TEAL)


def page_8(c):
    page_base(c, 8, "FOR EMPLOYERS")
    title(c, "T-shaped профиль для SMM, product marketing и AI-команд", size=27)
    roles = [
        ("SMM Specialist", "Стратегия, контент, Telegram, аналитика"),
        ("AI Marketing", "Кампании, AI-механики, automation"),
        ("Product Marketing", "Оффер, onboarding, activation, retention"),
        ("AI Product Builder", "MVP, backend, integrations, deploy"),
    ]
    for i, (head, body) in enumerate(roles):
        x = 54 + (i % 2) * 430
        y = 272 - (i // 2) * 126
        card(c, x, y, 410, 112, head, body, BLUE if i % 2 else LIME, heading_size=16)


def page_9(c):
    page_base(c, 9, "DIRECTIONS")
    title(c, "Восемь направлений. Одна система результата.")
    items = ["SMM", "BRAND", "CONTENT", "TELEGRAM", "AI", "WEB", "AUTOMATION", "LAUNCH"]
    for i, item in enumerate(items):
        x = 54 + (i % 4) * 212
        y = 316 - (i // 4) * 124
        c.setFillColor(PANEL if i < 4 else PANEL_2)
        c.roundRect(x, y, 194, 94, 14, fill=1, stroke=0)
        label(c, f"0{i + 1}", x + 14, y + 64, GOLD if i < 4 else LIME)
        c.setFont("Arial-Bold", 17)
        c.setFillColor(TEXT)
        c.drawString(x + 14, y + 26, item)


def page_10(c):
    page_base(c, 10, "SMM COMPETENCIES")
    title(c, "SMM - не дополнение к разработке, а первая половина продукта", size=26)
    items = [
        "Анализ ниши и аудитории", "Позиционирование и оффер", "Контент-стратегия",
        "Short-form и storytelling", "Telegram и прогрев", "Лид-магниты и воронки",
        "Рекламные связки", "Аналитика и итерации",
    ]
    for i, item in enumerate(items):
        x = 54 + (i % 2) * 430
        y = 320 - (i // 2) * 67
        c.setFillColor(PANEL)
        c.roundRect(x, y, 410, 54, 10, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.circle(x + 22, y + 27, 5, fill=1, stroke=0)
        text_block(c, item, x + 40, y + 33, 350, 13, 16, TEXT, "Arial-Bold")


def page_11(c):
    page_base(c, 11, "SMM SYSTEM")
    title(c, "SIGNAL -> SYSTEM -> PRODUCT")
    card(c, 54, 200, 270, 220, "SIGNAL", "Ниша, аудитория, конкуренты, tension, JTBD, сообщение и приоритетная гипотеза.", GOLD, "01", 24)
    card(c, 344, 200, 270, 220, "SYSTEM", "Контентные территории, short-form, Telegram, лид-магнит, nurture и события аналитики.", BLUE, "02", 24)
    card(c, 634, 200, 270, 220, "PRODUCT", "Бот, Mini App или web-инструмент, который превращает обещание контента в полезное действие.", LIME, "03", 24)
    text_block(c, "Контент создаёт ожидание. Продукт выполняет обещание. Данные возвращаются в систему.", 54, 142, 850, 16, 22, TEXT, "Arial-Bold")


def page_12(c):
    page_base(c, 12, "AI / PRODUCT")
    title(c, "AI-механика ценна только внутри понятного пользовательского пути")
    flow(c, ["CJM", "Prototype", "AI logic", "Backend", "QA", "Deploy"], 54, 330, W - 108, BLUE)
    bullet_list(c, [
        "Conversation design, system prompts, RAG и контролируемые ответы.",
        "Telegram Mini Apps, responsive web, data layer и integrations.",
        "Loading, empty, quota, cooldown, retry и fallback states.",
        "Privacy, observability и проверяемая production-сборка.",
    ], 54, 252, 820, 14, 16, LIME)


def page_13(c):
    page_base(c, 13, "FULL-CYCLE")
    title(c, "Онлайн-бизнес под ключ - как service blueprint")
    flow(c, ["Упаковка", "Контент", "Воронка", "Bot / Mini App", "AI", "Заявка", "Аналитика"], 54, 326, W - 108, GOLD)
    card(c, 54, 122, 850, 134, "Один владелец связности", "DimkoFF отвечает за то, чтобы обещание рекламы совпадало с landing, Telegram-сценарием, продуктовым действием и способом измерения. Scope и границы фиксируются до сборки.", TEAL)


def page_14(c):
    page_base(c, 14, "SERVICES")
    title(c, "Четыре точки входа")
    data = [
        ("Signal", "Исследование, позиционирование, message house, roadmap"),
        ("Launch", "Контентная система, landing, Telegram-воронка, analytics"),
        ("Product", "CJM, prototype, bot / Mini App, backend, deploy"),
        ("Full System", "Стратегия, SMM, продукт, запуск и первая итерация"),
    ]
    for i, (head, body) in enumerate(data):
        card(c, 54 + i * 213, 192, 196, 236, head, body, [GOLD, BLUE, LIME, TEAL][i], f"0{i+1}", 18)
    text_block(c, "Стоимость и сроки появляются после discovery и подтверждённого scope.", 54, 134, 850, 14, 20, MUTED)


def page_15(c):
    page_base(c, 15, "CASE 01 / CALORIEPT AI")
    label(c, "MAIN CASE STUDY / LIVE PRODUCT", 54, H - 78, GOLD)
    title(c, "CaloriePT AI", 54, H - 112, 430, 36)
    text_block(c, "AI nutrition / food recognition / Telegram Mini App", 54, H - 163, 430, 14, 19, MUTED, "Arial-Bold")
    phone(c, ASSETS / "caloriept-ai-live.png", 600, 66, 258, 402)
    bullet_list(c, [
        "Задача: сделать анализ питания доступным в повседневном мобильном сценарии.",
        "Слой SMM: прикладной вход для образовательного контента и повторных касаний.",
        "Слой продукта: Mini App, AI-анализ, данные, controlled errors и production flow.",
        "Доказательство: публичный live-экран; метрики добавляются только после подтверждения.",
    ], 54, 325, 485, 13.5, 15, GOLD)
    label(c, "LIVE", 54, 100, LIME)
    text_block(c, "caloriept.ru/webapp.html", 54, 78, 430, 11, 14, TEXT, "Arial-Bold")


def page_16(c):
    page_base(c, 16, "CASE 02 / STYLIST AI")
    label(c, "MAIN CASE STUDY / WORKING BUILD", 54, H - 78, ROSE)
    title(c, "Stylist AI", 54, H - 112, 360, 36)
    text_block(c, "AI stylist / wardrobe / palette / quick chat", 54, H - 163, 420, 14, 19, MUTED, "Arial-Bold")
    phone(c, ASSETS / "stylist-ai-showcase.png", 515, 92, 164, 356)
    phone(c, ASSETS / "stylist-ai-quick-chat.png", 704, 92, 164, 356)
    bullet_list(c, [
        "Витрина из трёх AI-стилистов с разными задачами и манерой.",
        "Один quick chat передаёт stylistId и сохраняет понятный пользовательский маршрут.",
        "Палитра, профиль, гардероб и server-side AI-персоны собираются в premium UX.",
        "Production URL фиксируется после финального подтверждения владельцем.",
    ], 54, 315, 402, 13, 14, ROSE)


def page_17(c):
    page_base(c, 17, "AI BOT PORTFOLIO")
    title(c, "Три ниши. Три Telegram AI-продукта.")
    bots = [
        ("Psy Mind AI", "psychology / self-reflection", "psy-mind-ai-card.png", "t.me/psy_mind_rf_bot", TEAL),
        ("BusinessMentorAI_bot", "business education / AI mentor", "businessmen-ai-card.png", "t.me/businessmen_ai_bot", GOLD),
        ("Pulse AI Coach", "coaching / habits / performance", "pulse-ai-coach-card.png", "t.me/PulseAICoach_bot", BLUE),
    ]
    for i, (name, niche, image, link, accent) in enumerate(bots):
        x = 54 + i * 286
        draw_image_cover(c, ASSETS / image, x, 208, 268, 178, 12)
        label(c, niche, x, 181, accent)
        text_block(c, name, x, 155, 268, 16, 19, TEXT, "Arial-Bold", 2)
        text_block(c, link, x, 117, 268, 10, 13, MUTED, "Arial", 2)
    text_block(c, "Публичные карточки проверены 22.07.2026. Они подтверждают доступность, но не заменяют аудит функций и метрик.", 54, 74, 850, 11, 15, MUTED)


def page_18(c):
    page_base(c, 18, "PROCESS")
    title(c, "Сложная работа становится предсказуемой")
    flow(c, ["Диагностика", "Архитектура", "Прототип", "Сборка", "QA", "Запуск", "Итерация"], 54, 327, W - 108, LIME)
    card(c, 54, 126, 410, 134, "Checkpoints", "Scope, согласованный пользовательский путь, acceptance criteria, mobile QA, privacy и rollback plan.", GOLD)
    card(c, 484, 126, 420, 134, "Evidence", "Live URL, screen recording, проверяемый flow, подтверждённая метрика или честно описанное продуктовое состояние.", BLUE)


def page_19(c):
    page_base(c, 19, "VISUAL STYLE")
    title(c, "Premium tech / dark / clean / confident / human")
    c.setFillColor(PANEL)
    c.roundRect(54, 130, 520, 284, 20, fill=1, stroke=0)
    for i, color in enumerate([BG, PANEL_2, TEXT, GOLD, LIME, BLUE]):
        c.setFillColor(color)
        c.circle(105 + i * 80, 326, 25, fill=1, stroke=0)
    text_block(c, "Глубокий фон, редакционная типографика, точечные сигнальные цвета, живые интерфейсы и строгая иерархия доказательств.", 82, 250, 460, 15, 22, TEXT)
    card(c, 604, 130, 300, 284, "Принцип", "Эффект не должен мешать чтению. 3D и motion используются как proof of craft, а не как обязательный вход.", LIME, "FUNCTION FIRST", 22)


def page_20(c):
    page_base(c, 20, "TOKENS")
    title(c, "Цвет и типографика работают как интерфейс")
    palette = [("Obsidian", "#0B0E12", BG), ("Graphite", "#1D242D", PANEL_2), ("Paper", "#F4F1E8", TEXT), ("Signal", "#C8FF4D", LIME), ("Gold", "#E4B765", GOLD)]
    for i, (name, code, color) in enumerate(palette):
        x = 54 + i * 170
        c.setFillColor(color)
        c.roundRect(x, 320, 150, 82, 12, fill=1, stroke=0)
        text_block(c, name, x, 294, 150, 11, 14, TEXT if color != TEXT else MUTED, "Arial-Bold")
        text_block(c, code, x, 276, 150, 9, 12, MUTED)
    c.setFont("Georgia-Bold", 32)
    c.setFillColor(TEXT)
    c.drawString(54, 190, "Editorial confidence")
    text_block(c, "Georgia для ключевой мысли", 54, 158, 360, 12, 16, MUTED)
    c.setFont("Arial-Bold", 27)
    c.setFillColor(TEXT)
    c.drawString(505, 190, "SYSTEM CLARITY")
    text_block(c, "Arial для структуры, данных и UI", 505, 158, 360, 12, 16, MUTED)


def page_21(c):
    page_base(c, 21, "UI / MOTION")
    title(c, "Motion подтверждает причинность")
    principles = [
        ("Purpose", "Анимация показывает переход, статус или связь между действиями."),
        ("Performance", "Primary content загружается первым; heavy chunks остаются lazy."),
        ("Access", "Reduced motion, keyboard path и static fallback обязательны."),
    ]
    for i, (head, body) in enumerate(principles):
        card(c, 54 + i * 286, 198, 268, 218, head, body, [LIME, GOLD, BLUE][i], f"0{i+1}", 22)
    text_block(c, "Wow - это управляемый слой, а не цена доступа к смыслу.", 54, 139, 850, 16, 21, TEXT, "Arial-Bold")


def page_22(c):
    page_base(c, 22, "TONE OF VOICE")
    title(c, "Ясно. Конкретно. Спокойно.")
    card(c, 54, 185, 410, 238, "DO", "Говорить через задачу, решение, роль и доказательство. Объяснять термин через пользу. Честно маркировать Live / MVP / Concept.", LIME, "VOICE", 25)
    card(c, 484, 185, 420, 238, "DON'T", "Не использовать AI-hype, неподтверждённые метрики, превосходные степени и обещания результата без источника.", ROSE, "BOUNDARY", 25)
    text_block(c, "Уверенность создаётся точностью, а не громкостью.", 54, 130, 850, 17, 23, TEXT, "Georgia-Bold")


def page_23(c):
    page_base(c, 23, "PORTFOLIO MVP")
    title(c, "Сайт - маршрутизатор доверия")
    flow(c, ["Hero", "Method", "Cases", "Bot portfolio", "Routes", "Contact"], 54, 331, W - 108, BLUE)
    card(c, 54, 132, 266, 130, "Main cases", "CaloriePT AI и Stylist AI - большие case studies.", GOLD)
    card(c, 344, 132, 266, 130, "AI bots", "Три real-project cards с публичными ссылками.", LIME)
    card(c, 634, 132, 270, 130, "Demo Lab", "Будущие эксперименты только со статусом Concept.", BLUE)


def page_24(c):
    page_base(c, 24, "ROUTES")
    title(c, "Одна система - два коммерческих входа")
    card(c, 54, 156, 410, 278, "Client route", "Pain -> offer -> packages -> cases -> process -> boundaries -> brief. Главный CTA: обсудить запуск продукта для конкретной ниши.", GOLD, "PROJECT", 25)
    card(c, 484, 156, 420, 278, "Employer route", "Role -> skills x evidence -> two main cases -> AI Bot Portfolio -> collaboration -> availability. Главный CTA: обсудить роль.", BLUE, "TEAM", 25)
    text_block(c, "Разные CTA, единая категория и единый стандарт доказательств.", 54, 108, 850, 14, 19, MUTED)


def page_25(c):
    page_base(c, 25, "CONTACT")
    label(c, "NEXT SIGNAL", 54, H - 86, LIME)
    title(c, "Есть идея, аудитория или продукт - соберём следующий шаг.", 54, H - 132, 760, 35)
    text_block(c, "SMM strategy / Telegram AI products / Mini Apps / Product marketing / Full-cycle MVP", 54, H - 238, 760, 16, 22, MUTED, "Arial-Bold")
    card(c, 54, 135, 410, 128, "Portfolio MVP", "dmitriyn684-pixel.github.io/stylist-mini-app/portfolio/", LIME, "OPEN")
    card(c, 484, 135, 420, 128, "GitHub", "github.com/dmitriyn684-pixel", BLUE, "VERIFY")
    text_block(c, "Персональные Telegram и email добавляются после подтверждения владельцем.", 54, 94, 850, 10.5, 14, MUTED)


PAGES = [cover, page_2, page_3, page_4, page_5, page_6, page_7, page_8, page_9, page_10,
         page_11, page_12, page_13, page_14, page_15, page_16, page_17, page_18, page_19,
         page_20, page_21, page_22, page_23, page_24, page_25]


def main() -> None:
    register_fonts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_PDF.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=PAGE, pageCompression=1)
    c.setTitle("DimkoFF - SMM + AI Product Builder")
    c.setAuthor("DimkoFF")
    c.setSubject("Personal brandbook and portfolio system")
    for render in PAGES:
        render(c)
        c.showPage()
    c.save()
    PUBLIC_PDF.write_bytes(OUT.read_bytes())
    print(OUT)


if __name__ == "__main__":
    main()
