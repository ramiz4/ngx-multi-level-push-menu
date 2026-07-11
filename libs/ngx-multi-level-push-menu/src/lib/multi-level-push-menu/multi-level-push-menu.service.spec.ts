import { MultiLevelPushMenuService } from './multi-level-push-menu.service';

describe('MultiLevelPushMenuService', () => {
  it('emits all documented commands with optional targets', () => {
    const service = new MultiLevelPushMenuService();
    const commands: unknown[] = [];
    service.commands$.subscribe((command) => commands.push(command));

    service.openMenu('primary');
    service.closeMenu('primary');
    service.toggleMenu('primary');
    service.navigateToLevel('products', 'primary');
    service.goBack('primary');

    expect(commands).toEqual([
      { type: 'expand', targetId: 'primary' },
      { type: 'collapse', level: undefined, targetId: 'primary' },
      { type: 'toggle', targetId: 'primary' },
      { type: 'navigate', levelOrId: 'products', targetId: 'primary' },
      { type: 'back', targetId: 'primary' },
    ]);
  });
});
