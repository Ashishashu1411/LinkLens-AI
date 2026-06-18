import os
import sys
import subprocess

# Ensure Pillow is installed
try:
    from PIL import Image, ImageDraw
except ImportError:
    print("[*] PIL (Pillow) not found. Attempting to install it via pip...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "pillow"], check=True)
        from PIL import Image, ImageDraw
        print("[+] Pillow installed successfully!")
    except Exception as e:
        print(f"[-] Failed to install Pillow: {e}")
        print("[-] Please install pillow manually (pip install pillow) or create icons manually.")
        sys.exit(1)

def create_cyber_shield_icon(size):
    # Create an RGBA image with transparent background
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    
    # Scale variables based on size
    stroke_width = max(1, size // 12)
    center = size / 2
    
    # Draw glowing aura (soft blue-cyan circle in background)
    aura_size = int(size * 0.9)
    aura_offset = (size - aura_size) // 2
    draw.ellipse(
        [aura_offset, aura_offset, size - aura_offset, size - aura_offset],
        fill=(0, 102, 255, 15), # extremely transparent cyber blue
        outline=(0, 240, 255, 30), # transparent cyan
        width=1
    )
    
    # Define Shield Polygon coordinates (relative, 0.0 to 1.0)
    # 6 points representing a classic cyber shield
    raw_points = [
        (0.22, 0.20),  # Top-left corner
        (0.50, 0.28),  # Top-center dip
        (0.78, 0.20),  # Top-right corner
        (0.78, 0.52),  # Upper-right slope
        (0.50, 0.85),  # Bottom tip
        (0.22, 0.52)   # Upper-left slope
    ]
    
    # Scale points to size
    points = [(int(p[0] * size), int(p[1] * size)) for p in raw_points]
    
    # Draw Shield Background (Translucent Deep Cyber Slate)
    draw.polygon(points, fill=(11, 14, 20, 220))
    
    # Draw Shield Border (Glowing Neon Cyan)
    draw.polygon(points, outline=(0, 240, 255, 255), width=stroke_width)
    
    # Draw Central "Lens/Scanner" Detail (representing LinkLens AI)
    # We will draw a small glowing cyber circle inside representing the scanning core
    inner_r = max(2, size // 6)
    inner_box = [
        int(center - inner_r), 
        int(center - inner_r * 0.8), 
        int(center + inner_r), 
        int(center + inner_r * 1.2)
    ]
    
    # Fill the core lens
    draw.ellipse(inner_box, fill=(0, 240, 255, 60))
    # Border the core lens
    draw.ellipse(inner_box, outline=(0, 240, 255, 255), width=max(1, stroke_width // 2))
    
    # Draw scanning crosshair line inside
    line_y = int(center + inner_r * 0.2)
    draw.line(
        [int(center - inner_r * 1.5), line_y, int(center + inner_r * 1.5), line_y], 
        fill=(0, 240, 255, 180), 
        width=max(1, stroke_width // 3)
    )
    
    return im

def main():
    icon_dir = os.path.join(os.path.dirname(__file__), "icons")
    os.makedirs(icon_dir, exist_ok=True)
    
    sizes = [16, 32, 48, 128]
    print(f"[*] Starting icon generation inside: {icon_dir}")
    
    for size in sizes:
        try:
            icon_img = create_cyber_shield_icon(size)
            filepath = os.path.join(icon_dir, f"icon{size}.png")
            icon_img.save(filepath, "PNG")
            print(f"[+] Saved {size}x{size} icon to {filepath}")
        except Exception as e:
            print(f"[-] Error generating {size}x{size} icon: {e}")
            
    print("[+] Icon generation complete!")

if __name__ == "__main__":
    main()
