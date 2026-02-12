import os
from PIL import Image, ImageDraw, ImageFont

# Ensure public directory exists
public_dir = os.path.join(os.getcwd(), 'public')
if not os.path.exists(public_dir):
    os.makedirs(public_dir)

def create_icon(size, filename):
    # Create image with brand color background
    img = Image.new('RGB', (size, size), color='#4F46E5')
    d = ImageDraw.Draw(img)
    
    # Draw text "LC"
    text = "LC"
    try:
        # Try to load a font, fallback to default
        font = ImageFont.truetype("arial.ttf", size // 2)
    except IOError:
        font = ImageFont.load_default()

    # Calculate text position to center it
    # Simplified centering logic
    bbox = d.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) / 2
    y = (size - text_height) / 2
    
    # Draw text in white
    d.text((x, y), text, fill="white", font=font)
    
    # Save
    path = os.path.join(public_dir, filename)
    img.save(path)
    print(f"Created {path}")

create_icon(192, 'pwa-192x192.png')
create_icon(512, 'pwa-512x512.png')
