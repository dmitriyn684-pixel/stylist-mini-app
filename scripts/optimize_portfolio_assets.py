from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
cases = root / "brandbook" / "assets" / "cases"
portfolio = root / "brandbook" / "assets" / "portfolio"
experiences = root / "output" / "screenshots" / "digital-experiences"
target = root / "public" / "portfolio" / "assets"
items = [
    (cases / "caloriept-ai-live.png", "caloriept-ai-live"),
    (cases / "stylist-ai-showcase.png", "stylist-ai-showcase"),
    (cases / "stylist-ai-palette.png", "stylist-ai-palette"),
    (cases / "psy-mind-ai-card.png", "psy-mind-ai-card"),
    (cases / "businessmen-ai-card.png", "businessmen-ai-card"),
    (cases / "pulse-ai-coach-card.png", "pulse-ai-coach-card"),
    (portfolio / "dimkoff-hero-sculpture-v2.png", "dimkoff-hero-sculpture"),
    (experiences / "02-premium-hospitality.png", "experience-hospitality"),
    (experiences / "03-ai-product.png", "experience-ai-product"),
    (experiences / "04-personal-brand.png", "experience-personal-brand"),
    (experiences / "07-premium-ai-founder-site.png", "brandbook-founder-site"),
]

target.mkdir(parents=True, exist_ok=True)
for source, name in items:
    image = Image.open(source).convert("RGB")
    image.save(target / f"{name}.webp", "WEBP", quality=84, method=6)

for stale in target.glob("*.png"):
    stale.unlink()
