#!/usr/bin/env python3
"""
Trim transparent padding from product PNG images.

For each PNG in public/products/{category}/ subdirectories:
1. Find the alpha-channel bounding box (actual content area)
2. Add 32px uniform padding (clamped to canvas edges)
3. Crop and overwrite with optimize=True

Does NOT touch root-level public/products/*.png (used by Hero mosaic).
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Run: pip3 install Pillow")
    sys.exit(1)

PRODUCTS_DIR = Path(__file__).resolve().parent.parent / "public" / "products"
PADDING = 32
SKIP_DIRS = {"_originals"}

def trim_image(filepath: Path) -> tuple[str, bool]:
    """Trim transparent padding from a PNG. Returns (summary, changed)."""
    img = Image.open(filepath).convert("RGBA")
    old_w, old_h = img.size

    alpha = img.split()[-1]
    bbox = alpha.getbbox()

    if bbox is None:
        return f"  SKIP {filepath.name}: fully transparent", False

    # Add padding, clamped to canvas edges
    left = max(0, bbox[0] - PADDING)
    upper = max(0, bbox[1] - PADDING)
    right = min(old_w, bbox[2] + PADDING)
    lower = min(old_h, bbox[3] + PADDING)

    new_w = right - left
    new_h = lower - upper

    # Skip if trim is negligible (< 2% reduction on both axes)
    if new_w > old_w * 0.98 and new_h > old_h * 0.98:
        return f"  SKIP {filepath.name}: already tight ({old_w}x{old_h})", False

    cropped = img.crop((left, upper, right, lower))
    cropped.save(filepath, "PNG", optimize=True)

    return (
        f"  TRIM {filepath.name}: {old_w}x{old_h} -> {new_w}x{new_h} "
        f"(removed L:{bbox[0]-PADDING if bbox[0]>PADDING else bbox[0]}px "
        f"T:{bbox[1]-PADDING if bbox[1]>PADDING else bbox[1]}px "
        f"R:{old_w-bbox[2]-PADDING if bbox[2]+PADDING<old_w else old_w-bbox[2]}px "
        f"B:{old_h-bbox[3]-PADDING if bbox[3]+PADDING<old_h else old_h-bbox[3]}px)"
    ), True


def main():
    trimmed = 0
    skipped = 0

    for subdir in sorted(PRODUCTS_DIR.iterdir()):
        if not subdir.is_dir() or subdir.name in SKIP_DIRS:
            continue

        pngs = sorted(subdir.glob("*.png"))
        if not pngs:
            continue

        print(f"\n[{subdir.name}]")
        for png in pngs:
            summary, changed = trim_image(png)
            print(summary)
            if changed:
                trimmed += 1
            else:
                skipped += 1

    print(f"\nDone: {trimmed} trimmed, {skipped} skipped")


if __name__ == "__main__":
    main()
