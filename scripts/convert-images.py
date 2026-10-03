import os
from PIL import Image

def convert_assets_to_webp():
    src_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'Landing')
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'landing')
    os.makedirs(out_dir, exist_ok=True)

    if not os.path.exists(src_dir):
        return

    for fname in os.listdir(src_dir):
        if not fname.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
        src_path = os.path.join(src_dir, fname)
        base_name = os.path.splitext(fname)[0]
        out_name = f"{base_name}.webp" if base_name else "1.webp"
        out_path = os.path.join(out_dir, out_name)

        # Only re-convert if missing or older than source
        if not os.path.exists(out_path) or os.path.getmtime(src_path) > os.path.getmtime(out_path):
            try:
                with Image.open(src_path) as im:
                    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
                        im.save(out_path, 'WEBP', quality=88, method=6)
                    else:
                        im.convert('RGB').save(out_path, 'WEBP', quality=88, method=6)
                    print(f"Optimized {fname} -> {out_name} ({os.path.getsize(out_path)/1024:.1f} KB)")
            except Exception as e:
                print(f"Skipping {fname}: {e}")

if __name__ == '__main__':
    convert_assets_to_webp()
