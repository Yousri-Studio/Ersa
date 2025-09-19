const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'public', 'images', 'team');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
// Function to generate a placeholder image
function generateImage(name, filename, isFemale = false) {
  const width = 400;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background color
  ctx.fillStyle = isFemale ? '#f3e5f5' : '#e3f2fd';
  ctx.fillRect(0, 0, width, height);

  // Draw a simple shape
  ctx.fillStyle = isFemale ? '#9c27b0' : '#2196f3';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 150, 0, Math.PI * 2);
  ctx.fill();

  // Add text
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 80px Arial';
  ctx.fillText(name.charAt(0).toUpperCase(), width / 2, height / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, filename), buffer);
}
// Generate team member images
generateImage('A', 'team-1.jpg', false); // Male
generateImage('S', 'team-2.jpg', true);  // Female
generateImage('M', 'team-3.jpg', false); // Male

console.log('Generated team member placeholder images');
