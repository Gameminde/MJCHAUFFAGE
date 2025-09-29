const fs = require('fs');
const path = require('path');

// Simple 1x1 blue pixel PNG in base64
const bluePNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';

// Create a simple colored PNG data (this is a minimal 1x1 blue pixel)
function createSimplePNG() {
    return Buffer.from(bluePNG, 'base64');
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'frontend', 'public', 'icons');

console.log('Creating simple PNG icons...');

// Generate main app icons
sizes.forEach(size => {
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    const pngData = createSimplePNG();
    fs.writeFileSync(filepath, pngData);
    console.log(`Created ${filename}`);
});

// Generate shortcut icons
const shortcuts = ['products-96x96.png', 'services-96x96.png', 'cart-96x96.png'];

shortcuts.forEach(filename => {
    const filepath = path.join(iconsDir, filename);
    const pngData = createSimplePNG();
    fs.writeFileSync(filepath, pngData);
    console.log(`Created ${filename}`);
});

console.log('Basic PNG icons created successfully!');
console.log('These are minimal 1x1 blue pixels. For better icons, use a proper image generation tool.');
