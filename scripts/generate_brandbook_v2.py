from __future__ import annotations

from pathlib import Path
from reportlab.pdfgen import canvas

import generate_brandbook_pdf as b


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"
PUBLIC = ROOT / "public" / "portfolio"


def cover_v2(c):
    c.setFillColor(b.BG)
    c.rect(0, 0, b.W, b.H, fill=1, stroke=0)
    c.setFillColor(b.PANEL)
    c.circle(b.W - 70, b.H + 30, 270, fill=1, stroke=0)
    c.setStrokeColor(b.LINE)
    for i in range(6):
        c.circle(b.W - 70, b.H + 30, 90 + i * 29, fill=0, stroke=1)
    b.label(c, "BRANDBOOK V2 / COMMERCIAL SYSTEM / 2026", 58, b.H - 58)
    c.setFont("Georgia-Bold", 56)
    c.setFillColor(b.TEXT)
    c.drawString(58, b.H - 145, "DimkoFF")
    b.text_block(c, "SMM + AI Product Builder", 60, b.H - 190, 650, 25, 30, b.LIME, "Arial-Bold")
    b.text_block(c, "Создаю AI-системы и digital-продукты, которые помогают бизнесу получать клиентов, автоматизировать процессы и запускать онлайн-продукты под ключ.", 60, b.H - 245, 650, 17, 24, b.TEXT)
    b.flow(c, ["SMM", "Воронка", "Telegram", "AI", "Продукт", "Запуск"], 60, 80, 735, b.GOLD)


def positioning_v2(c):
    b.page_base(c, 1, "POSITIONING")
    b.title(c, "Не обычный SMM. Не разработка ради разработки.", size=29)
    b.card(c, 54, 220, 270, 188, "Бизнес-задача", "Начинаю с аудитории, боли, оффера и следующего измеримого действия.", b.GOLD, "SIGNAL")
    b.card(c, 344, 220, 270, 188, "Система роста", "Соединяю контент, прогрев, Telegram-воронку и события аналитики.", b.BLUE, "SYSTEM")
    b.card(c, 634, 220, 270, 188, "Digital-продукт", "Создаю AI-бот, Mini App, web, backend и automation под сценарий.", b.LIME, "PRODUCT")
    b.text_block(c, "Результат упаковки: понятный путь от маркетингового сигнала до работающего инструмента и данных.", 54, 158, 840, 16, 22, b.TEXT, "Arial-Bold")


def three_directions(c):
    b.page_base(c, 1, "THREE DIRECTIONS")
    b.title(c, "Три направления одной компетенции")
    b.card(c, 54, 205, 270, 220, "AI-продукты", "Telegram Mini Apps, AI-боты, RAG-системы, backend и automation.", b.LIME, "01", 22)
    b.card(c, 344, 205, 270, 220, "SMM и рост", "Позиционирование, контент, прогревы, воронки и лидогенерация.", b.GOLD, "02", 22)
    b.card(c, 634, 205, 270, 220, "Business Systems", "CRM, аналитика, Telegram-сценарии и автоматизация процессов.", b.BLUE, "03", 22)
    b.text_block(c, "Сила DimkoFF - не список инструментов, а умение собрать их вокруг одной бизнес-логики.", 54, 145, 850, 15, 21, b.MUTED)


def method_v2(c):
    b.page_base(c, 1, "DIMKOFF METHOD")
    b.title(c, "Signal -> System -> Product -> Growth")
    data = [
        ("Signal", "Ниша, аудитория, боль, оффер, позиционирование, контентные смыслы.", b.GOLD),
        ("System", "SMM-стратегия, контент, funnel, Telegram, лид-магнит, analytics.", b.BLUE),
        ("Product", "AI-бот, Mini App, сайт, backend, база, automation, deploy.", b.LIME),
        ("Growth", "Тест, данные, UX, конверсия, удержание и новые функции.", b.TEAL),
    ]
    for i, (head, body, accent) in enumerate(data):
        b.card(c, 54 + i * 213, 192, 196, 236, head, body, accent, f"0{i + 1}", 18)
    b.text_block(c, "Я не просто делаю посты или код. Я соединяю стратегию, упаковку, продукт и запуск.", 54, 135, 850, 16, 22, b.TEXT, "Arial-Bold")


def client_value(c):
    b.page_base(c, 1, "FOR CLIENTS")
    b.title(c, "Что можно собрать под ваш бизнес")
    cards = [
        ("SMM-система", "Позиционирование, контент, прогревы, Telegram-воронка."),
        ("AI-бот", "Консультации, заявки, ответы, база знаний, удержание."),
        ("Mini App", "Личный кабинет, сервис, продукт, подписка, аналитика."),
        ("Full system", "Landing, bot, Mini App, CRM, AI, платежи, запуск."),
        ("Automation", "Сводки, отчёты, заявки, задачи, аналитика, рутина."),
    ]
    for i, (head, body) in enumerate(cards):
        x = 54 + (i % 3) * 286
        y = 255 if i < 3 else 88
        b.card(c, x, y, 268, 148, head, body, [b.GOLD, b.LIME, b.BLUE, b.TEAL, b.ROSE][i], f"0{i+1}", 16)


def employer_value(c):
    b.page_base(c, 1, "FOR EMPLOYERS")
    b.title(c, "SMM-специалист, который усиливает маркетинг AI-продуктами", size=27)
    b.card(c, 54, 145, 410, 244, "Marketing layer", "Аудитория, positioning, content strategy, short-form, Telegram, funnel и analytics.", b.GOLD, "CAN LEAD", 22)
    b.card(c, 484, 145, 420, 244, "Product layer", "AI-механики, Mini Apps, automation, prototype, responsive UI, backend и deploy.", b.BLUE, "CAN BUILD", 22)
    b.text_block(c, "Подходящие роли: SMM / Digital Marketing / AI Marketing / Telegram Marketing / Product Marketing / AI Product Builder.", 54, 94, 850, 13, 18, b.MUTED, "Arial-Bold")


def calorie_story_1(c):
    b.page_base(c, 1, "CASE 01 / CALORIEPT AI")
    b.label(c, "MAIN CASE STUDY / LIVE PRODUCT", 54, b.H - 78, b.GOLD)
    b.title(c, "CaloriePT AI - AI-нутрициолог в Telegram Mini App", width=535, size=26)
    b.phone(c, b.ASSETS / "caloriept-ai-live.png", 626, 64, 240, 380)
    b.card(c, 54, 245, 250, 145, "Контекст", "Считать калории, понимать КБЖУ и удерживать дисциплину сложно в ежедневном режиме.", b.GOLD)
    b.card(c, 322, 245, 250, 145, "Проблема", "Ручной ввод быстро надоедает и не создаёт персонального сопровождения.", b.ROSE)
    b.card(c, 54, 80, 518, 145, "Решение", "Telegram Mini App: фото еды, КБЖУ, дневник, AI-итог дня, рецепты из холодильника, список покупок и частые блюда.", b.LIME)


def calorie_story_2(c):
    b.page_base(c, 1, "CASE 01 / DELIVERY")
    b.title(c, "Что создано и что это доказывает")
    created = ["Telegram bot", "Mini App", "Food photo recognition", "products.db", "Fridge recipe flow", "Shopping list", "Frequent foods", "AI day summary", "Quota protection", "Premium mobile UI"]
    b.bullet_list(c, created[:5], 60, 350, 400, 13, 15, b.GOLD)
    b.bullet_list(c, created[5:], 500, 350, 400, 13, 15, b.LIME)
    b.card(c, 54, 102, 850, 110, "Компетенция DimkoFF", "AI product logic, Telegram Mini App, retention UX, backend, fallback, работа с лимитами и production ownership. Масштабирование: wellness, nutrition services и expert products.", b.BLUE)


def stylist_story_1(c):
    b.page_base(c, 1, "CASE 02 / STYLIST AI")
    b.label(c, "MAIN CASE STUDY / WORKING BUILD", 54, b.H - 78, b.ROSE)
    b.title(c, "Stylist AI - premium fashion Mini App", size=31)
    b.phone(c, b.ASSETS / "stylist-ai-showcase.png", 600, 66, 142, 356)
    b.phone(c, b.ASSETS / "stylist-ai-palette.png", 758, 66, 142, 356)
    b.card(c, 54, 270, 230, 145, "Контекст", "Пользователю сложно собирать образы, понимать стиль, цвета и гардероб.", b.GOLD)
    b.card(c, 302, 270, 230, 145, "Проблема", "Fashion-приложения часто не создают ощущения личного стилиста.", b.ROSE)
    b.card(c, 54, 105, 478, 145, "Решение", "Premium Mini App: гардероб, AI-стилисты, look recommendations, palette, profile и editorial aesthetics.", b.LIME)


def stylist_story_2(c):
    b.page_base(c, 1, "CASE 02 / DELIVERY")
    b.title(c, "Продукт под визуальную premium-аудиторию")
    b.card(c, 54, 218, 270, 196, "Что создано", "Frontend screens, premium UI, wardrobe logic, stylist page, quick chat, look recommendations и visual direction.", b.ROSE)
    b.card(c, 344, 218, 270, 196, "Что доказывает", "Product design, premium interfaces, SMM / visual thinking и AI fashion positioning.", b.GOLD)
    b.card(c, 634, 218, 270, 196, "Масштабирование", "Fashion experts, beauty, premium consumer services и персональные product catalogs.", b.BLUE)
    b.text_block(c, "Production URL публикуется после подтверждения владельцем. Неподтверждённые метрики не используются.", 54, 150, 850, 13, 18, b.MUTED)


def bot_line(c):
    b.page_base(c, 1, "AI BOT PORTFOLIO")
    b.title(c, "Широта ниш без конкуренции с главными кейсами", size=29)
    bots = [
        ("PsyMind AI", "PSYCHOLOGY", "Self-reflection and sensitive conversation design.", "psy-mind-ai-card.png", b.TEAL),
        ("BusinessMentorAI_bot", "BUSINESS EDUCATION", "AI mentor and expert Telegram product.", "businessmen-ai-card.png", b.GOLD),
        ("Pulse AI Coach", "COACHING", "Habits, performance and recurring scenarios.", "pulse-ai-coach-card.png", b.BLUE),
    ]
    for i, (name, niche, body, image, accent) in enumerate(bots):
        x = 54 + i * 286
        b.draw_image_cover(c, b.ASSETS / image, x, 230, 268, 150, 12)
        b.label(c, niche, x, 204, accent)
        b.text_block(c, name, x, 178, 268, 16, 20, b.TEXT, "Arial-Bold", 2)
        b.text_block(c, body, x, 144, 268, 10.5, 14, b.MUTED, max_lines=2)
    b.text_block(c, "Публичные карточки подтверждают доступность. Функции и результаты требуют отдельного evidence audit.", 54, 95, 850, 11, 15, b.MUTED)


def demo_real(c):
    b.page_base(c, 1, "DEMO LAB / REAL")
    b.title(c, "Real products - доказательство delivery")
    items = ["CaloriePT AI", "Stylist AI", "PsyMind AI", "BusinessMentorAI_bot", "Pulse AI Coach"]
    for i, item in enumerate(items):
        x = 54 + (i % 3) * 286
        y = 285 if i < 3 else 130
        b.card(c, x, y, 268, 130, item, ["Nutrition / Mini App", "Fashion / premium UX", "Psychology", "Business education", "Coaching / performance"][i], [b.GOLD, b.ROSE, b.TEAL, b.LIME, b.BLUE][i], "REAL", 16)


def demo_concepts(c):
    b.page_base(c, 1, "DEMO LAB / CONCEPTS")
    b.title(c, "Concept products - направления для клиентских решений")
    items = [
        ("ExpertOS", "AI operating system для эксперта"),
        ("BriefPilot", "AI assistant для SMM-брифа"),
        ("LaunchKit", "Набор запуска онлайн-продукта"),
        ("Signal House", "AI marketing signal analytics"),
        ("Signal Field 3D", "Interactive premium portfolio"),
    ]
    for i, (head, body) in enumerate(items):
        x = 54 + (i % 3) * 286
        y = 255 if i < 3 else 100
        b.card(c, x, y, 268, 130, head, body, b.BLUE, "CONCEPT", 16)


def ai_director(c):
    b.page_base(c, 1, "NEXT PRODUCT CONCEPT")
    b.label(c, "AI DIRECTOR / IN PLANNING", 54, b.H - 78, b.BLUE)
    b.title(c, "AI-copilot для собственника", 54, b.H - 115, 520, 35)
    b.text_block(c, "Telegram-система, которая собирает деньги, задачи, продажи, риски и рекомендации в одну понятную бизнес-сводку.", 54, b.H - 180, 500, 16, 23, b.MUTED)
    b.card(c, 594, 220, 310, 210, "MVP", "AI-аудит, daily summary, tasks, простая финансовая панель, recommendations и Telegram Mini App.", b.BLUE, "IN PLANNING", 22)
    b.card(c, 54, 108, 500, 150, "Entry offer hypothesis", "Бесплатный AI-аудит бизнеса за 7 минут: где теряются деньги, что тормозит рост и что сделать в ближайшие 72 часа.", b.LIME)
    b.text_block(c, "Это продуктовая гипотеза, а не заявление о готовом продукте или гарантированном результате.", 594, 160, 310, 11, 15, b.MUTED)


def contact_v2(c):
    b.page_base(c, 1, "NEXT STEP")
    b.label(c, "NEXT SIGNAL", 54, b.H - 84, b.LIME)
    b.title(c, "Соберём бизнес-задачу в следующий digital-продукт.", 54, b.H - 130, 760, 35)
    b.card(c, 54, 185, 260, 145, "Brandbook v2", "Полная система бренда, кейсов, Demo Lab и routes.", b.LIME)
    b.card(c, 334, 185, 260, 145, "Client Deck", "Короткий маршрут от business problem к project scope.", b.GOLD)
    b.card(c, 614, 185, 290, 145, "Employer Deck", "Профиль, evidence, роли и 30 / 60 / 90.", b.BLUE)
    b.text_block(c, "Portfolio: dmitriyn684-pixel.github.io/stylist-mini-app/portfolio/", 54, 120, 850, 13, 18, b.TEXT, "Arial-Bold")
    b.text_block(c, "GitHub: github.com/dmitriyn684-pixel", 54, 95, 850, 11, 15, b.MUTED)


def deck_cover(c, subtitle):
    c.setFillColor(b.BG)
    c.rect(0, 0, b.W, b.H, fill=1, stroke=0)
    b.label(c, "DIMKOFF / 2026", 58, b.H - 60)
    c.setFont("Georgia-Bold", 55)
    c.setFillColor(b.TEXT)
    c.drawString(58, b.H - 160, "DimkoFF")
    b.text_block(c, "SMM + AI Product Builder", 60, b.H - 205, 700, 25, 30, b.LIME, "Arial-Bold")
    b.text_block(c, subtitle, 60, b.H - 270, 720, 18, 26, b.TEXT)


def deck_page(title_text, eyebrow, cards):
    def render(c):
        b.page_base(c, 1, eyebrow)
        b.title(c, title_text, size=29)
        count = len(cards)
        cols = 3 if count == 3 or count > 4 else 2
        cell_w = 410 if cols == 2 else 268
        for i, (head, body, accent) in enumerate(cards):
            x = 54 + (i % cols) * (430 if cols == 2 else 286)
            y = 275 if i < cols else 110
            b.card(c, x, y, cell_w, 145, head, body, accent, f"0{i+1}", 17)
    return render


def render_pdf(filename, pages):
    path = OUT / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    original = b.page_base
    current = [1]

    def numbered(c, ignored, section, total=len(pages)):
        return original(c, current[0], section, total)

    b.page_base = numbered
    c = canvas.Canvas(str(path), pagesize=b.PAGE, pageCompression=1)
    c.setTitle(filename.replace(".pdf", ""))
    c.setAuthor("DimkoFF")
    for index, render in enumerate(pages, 1):
        current[0] = index
        render(c)
        c.showPage()
    c.save()
    b.page_base = original
    (PUBLIC / filename).write_bytes(path.read_bytes())
    print(path)


def main():
    b.register_fonts()
    v2_pages = [
        cover_v2, positioning_v2, three_directions, b.page_5, b.page_6, client_value,
        employer_value, b.page_9, b.page_10, method_v2, b.page_12, b.page_13, b.page_14,
        calorie_story_1, calorie_story_2, stylist_story_1, stylist_story_2, bot_line,
        b.page_18, demo_real, demo_concepts, ai_director, b.page_19, b.page_20, b.page_21,
        b.page_22, b.page_23, b.page_24, contact_v2,
    ]
    render_pdf("dimkoff-brandbook-2026-v2.pdf", v2_pages)

    client_pages = [
        lambda c: deck_cover(c, "Client Deck - digital-системы и AI-продукты для бизнеса."),
        deck_page("Что я делаю", "WHAT I DO", [("SMM", "Positioning, content, funnels, Telegram.", b.GOLD), ("AI / Product", "Bots, Mini Apps, backend, automation.", b.LIME), ("Launch", "Landing, analytics, deploy, iteration.", b.BLUE)]),
        deck_page("Бизнесу нужна система, а не набор подрядчиков", "BUSINESS PROBLEM", [("Внимание", "Контент и рекламный сигнал.", b.GOLD), ("Доверие", "Оффер, proof и nurture.", b.BLUE), ("Действие", "Telegram flow и заявка.", b.LIME), ("Продукт", "Полезный сценарий и retention.", b.TEAL)]),
        method_v2,
        client_value,
        deck_page("Главные доказательства", "CASES", [("CaloriePT AI", "Nutrition Mini App, AI logic, backend, fallback.", b.GOLD), ("Stylist AI", "Premium fashion UX and visual product design.", b.ROSE), ("AI Bot Portfolio", "Psychology, business education, coaching.", b.BLUE)]),
        b.page_14,
        b.page_18,
        deck_page("Следующий шаг", "PROJECT", [("Диагностика", "Задача, аудитория, ограничения, риск.", b.GOLD), ("Scope", "Путь, артефакты, acceptance criteria.", b.LIME), ("Launch", "Prototype, QA, production, learning.", b.BLUE)]),
        contact_v2,
    ]
    render_pdf("dimkoff-client-deck-2026.pdf", client_pages)

    employer_pages = [
        lambda c: deck_cover(c, "Employer Deck - SMM-специалист на стыке marketing, AI и product."),
        employer_value,
        deck_page("Skills x evidence", "SKILLS", [("SMM", "Strategy, content, short-form, funnel, analytics.", b.GOLD), ("Telegram", "Bots, Mini Apps, deep links, retention.", b.LIME), ("AI", "Conversation design, RAG, fallback, quotas.", b.BLUE), ("Product", "CJM, MVP, activation, retention, deploy.", b.TEAL)]),
        deck_page("Почему это важно команде", "VALUE", [("Marketing", "Идея становится measurable mechanic.", b.GOLD), ("Product", "Promise совпадает с experience.", b.LIME), ("Delivery", "Prototype быстрее доходит до данных.", b.BLUE)]),
        deck_page("Cases", "EVIDENCE", [("CaloriePT AI", "Product logic, backend, fallback, production.", b.GOLD), ("Stylist AI", "Premium UX, personalization, visual direction.", b.ROSE), ("AI Bot Portfolio", "Нишевые Telegram AI-сценарии.", b.BLUE)]),
        deck_page("Подходящие роли", "ROLES", [("SMM Specialist", "SMM + Telegram + analytics.", b.GOLD), ("AI Marketing", "Campaign mechanics and automation.", b.LIME), ("Product Marketing", "Offer, onboarding, activation.", b.BLUE), ("AI Product Builder", "MVP, backend, deploy.", b.TEAL)]),
        method_v2,
        deck_page("30 / 60 / 90", "PLAN", [("30", "Audit, audience, offer, gaps, hypotheses.", b.GOLD), ("60", "Content system and first Telegram / AI prototype.", b.LIME), ("90", "Repeatable cycle: content -> product -> data -> iteration.", b.BLUE)]),
        contact_v2,
    ]
    render_pdf("dimkoff-employer-deck-2026.pdf", employer_pages)


if __name__ == "__main__":
    main()
