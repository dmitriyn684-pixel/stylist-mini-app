from pathlib import Path
from PIL import Image, ImageDraw
import sys

root = Path(__file__).resolve().parents[1]
source = root / "tmp" / "pdfs" / (sys.argv[1] if len(sys.argv) > 1 else "dimkoff-brandbook")
pages = sorted(source.glob("page-*.png"))

for group_start in range(0, len(pages), 5):
    group = pages[group_start:group_start + 5]
    thumbs = []
    for page in group:
        image = Image.open(page).convert("RGB")
        image.thumbnail((720, 405), Image.Resampling.LANCZOS)
        thumbs.append((page, image.copy()))
    sheet = Image.new("RGB", (760, 5 * 445), "#090b0e")
    draw = ImageDraw.Draw(sheet)
    for index, (page, image) in enumerate(thumbs):
        y = index * 445
        draw.text((20, y + 8), page.stem, fill="#c8ff4d")
        sheet.paste(image, (20, y + 32))
    sheet.save(source / f"contact-{group_start + 1:02d}-{group_start + len(group):02d}.jpg", quality=92)
