import { formatFiles, generateFiles, joinPathFragments, Tree } from '@nx/devkit';
import { MenuItemGeneratorSchema } from './schema';

export default async function (tree: Tree, schema: MenuItemGeneratorSchema) {
  const id = schema.name.toLowerCase().replace(/\s+/g, '-');
  const itemData = {
    ...schema,
    id,
    name: schema.name,
    icon: schema.icon || 'fa fa-list',
    link: schema.link || '#',
    parentId: schema.parentId || ''
  };

  // Create a directory for the menu items if it doesn't exist
  const menuItemsDir = joinPathFragments('menu-items');
  if (!tree.exists(menuItemsDir)) {
    tree.write(menuItemsDir + '/.gitkeep', '');
  }

  // Generate a JSON file with the menu item data
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    menuItemsDir,
    itemData
  );

  await formatFiles(tree);

  // Return success information
  return () => {
    console.log(`Successfully created menu item: ${schema.name}`);
    console.log(`Menu item JSON file created at: menu-items/${id}.json`);
  };
}