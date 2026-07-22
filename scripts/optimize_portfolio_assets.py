from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "brandbook" / "assets" / "cases"
target = root / "public" / "portfolio" / "assets"
names = [
    "caloriept-ai-live",
    "stylist-ai-showcase",
    "stylist-ai-palette",
    "psy-mind-ai-card",
    "businessmen-ai-card",
    "pulse-ai-coach-card",
]

target.mkdir(parents=True, exist_ok=True)
for name in names:
    image = Image.open(source / f"{name}.png").convert("RGB")
    image.save(target / f"{name}.webp", "WEBP", quality=84, method=6)

for stale in target.glob("*.png"):
    stale.unlink()
