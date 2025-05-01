/**
 * Simple script to generate menu items for ngx-multi-level-push-menu
 * 
 * Usage: node tools/scripts/generate-menu-item.js --name="Menu Item" --icon="fa fa-icon" --link="/path" --parentId="optional-parent"
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const params = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    params[key] = value?.replace(/"/g, '') || '';
  }
});

// Validate required parameters
if (!params.name) {
  console.error('Error: --name parameter is required');
  process.exit(1);
}

// Set defaults
const menuItem = {
  id: params.name.toLowerCase().replace(/\s+/g, '-'),
  name: params.name,
  icon: params.icon || 'fa fa-list',
  link: params.link || '#'
};

// Add parentId if provided
if (params.parentId) {
  menuItem.parentId = params.parentId;
}

// Create menu-items directory if it doesn't exist
const menuItemsDir = path.join(process.cwd(), 'menu-items');
if (!fs.existsSync(menuItemsDir)) {
  fs.mkdirSync(menuItemsDir, { recursive: true });
}

// Write the menu item to a JSON file
const filePath = path.join(menuItemsDir, `${menuItem.id}.json`);
fs.writeFileSync(filePath, JSON.stringify(menuItem, null, 2));

console.log(`Successfully created menu item: ${menuItem.name}`);
console.log(`Menu item JSON file created at: ${filePath}`);