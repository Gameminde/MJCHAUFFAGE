const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bg)"/>
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Flame icon -->
    <path d="M0,${size*0.2} C-${size*0.13},${size*0.1} -${size*0.2},-${size*0.1} 0,-${size*0.2} C${size*0.2},-${size*0.1} ${size*0.13},${size*0.1} 0,${size*0.2}Z" fill="white"/>
    <path d="M0,${size*0.1} C-${size*0.07},0 -${size*0.1},-${size*0.07} 0,-${size*0.13} C${size*0.1},-${size*0.07} ${size*0.07},0 0,${size*0.1}Z" fill="#fbbf24"/>
  </g>
</svg>`;

const createShortcutSVG = (size, text) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bg)"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.5}" fill="white" text-anchor="middle" dominant-baseline="central">${text}</text>
</svg>`;

// Generate main icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'frontend', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating icons...');

// Generate main app icons
sizes.forEach(size => {
    const svg = createSVG(size);
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    // For now, just create a simple colored square as PNG data
    // In a real scenario, you'd use a library like sharp to convert SVG to PNG
    const canvas = createCanvas(size);
    fs.writeFileSync(filepath.replace('.png', '.svg'), svg);
    console.log(`Generated ${filename}`);
});

// Generate shortcut icons
const shortcuts = [
    { name: 'products-96x96.png', text: '🛒' },
    { name: 'services-96x96.png', text: '🔧' },
    { name: 'cart-96x96.png', text: '🛍️' }
];

shortcuts.forEach(shortcut => {
    const svg = createShortcutSVG(96, shortcut.text);
    const filepath = path.join(iconsDir, shortcut.name);
    fs.writeFileSync(filepath.replace('.png', '.svg'), svg);
    console.log(`Generated ${shortcut.name}`);
});

// Create a simple canvas-based PNG generator
function createCanvas(size) {
    // Simple base64 PNG data for a blue square
    const canvas = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        // ... (this would be a complete PNG file in a real implementation)
    ]);
    return canvas;
}

console.log('Icon generation complete!');
console.log('Note: SVG files have been created. For production, convert them to PNG using a tool like sharp or imagemagick.');
