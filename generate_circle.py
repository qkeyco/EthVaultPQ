#!/usr/bin/env python3
"""Generate a 1024x1024 PNG with a white circle (80% size) on black background."""

from PIL import Image, ImageDraw

# Image dimensions
WIDTH = 1024
HEIGHT = 1024

# Circle parameters (80% of image size)
CENTER_X = WIDTH // 2
CENTER_Y = HEIGHT // 2
RADIUS = int((WIDTH * 0.80) / 2)  # 80% of width, so radius is 40% = ~410 pixels

# Create black background
image = Image.new('RGB', (WIDTH, HEIGHT), color='black')

# Draw white circle
draw = ImageDraw.Draw(image)
draw.ellipse(
    [CENTER_X - RADIUS, CENTER_Y - RADIUS, CENTER_X + RADIUS, CENTER_Y + RADIUS],
    fill='white'
)

# Save the image
output_path = 'circle.png'
image.save(output_path)

print(f"✓ Created {output_path}")
print(f"  Size: {WIDTH}x{HEIGHT}")
print(f"  Circle radius: {RADIUS}px (80% of image)")
print(f"  Border: ~{(WIDTH - RADIUS * 2) // 2}px black edge")
