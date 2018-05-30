import { Component, OnInit } from '@angular/core';
import {
  MultiLevelPushMenuService,
  MultiLevelPushMenu,
  MultiLevelPushMenuOptions,
  MultiLevelPushMenuItem
} from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  defaultItems: Array<MultiLevelPushMenuItem> = new Array<MultiLevelPushMenuItem>();

  constructor(private multiLevelPushMenuService: MultiLevelPushMenuService) {}

  ngOnInit() {
    this.defaultItems.push(new MultiLevelPushMenuItem('Home', 'Home', null, 'home'));
    this.defaultItems.push(new MultiLevelPushMenuItem('About us', 'About us', null, 'about-us'));

    const company = new MultiLevelPushMenuItem('Company', 'Company', null, 'company');
    company.items = new Array<MultiLevelPushMenuItem>();
    const companySubMenu = new MultiLevelPushMenuItem('Company', 'Company', null, '#');
    companySubMenu.items = new Array<MultiLevelPushMenuItem>();
    companySubMenu.items.push(new MultiLevelPushMenuItem('Contact', 'Contact', null, 'contact'));
    companySubMenu.items.push(new MultiLevelPushMenuItem('Imprint', 'Imprint',  null, 'imprint'));
    company.items.push(companySubMenu);

    this.defaultItems.push(company);

    const options: MultiLevelPushMenuOptions = new MultiLevelPushMenuOptions();
    options.mode = 'cover';
    options.menu = new MultiLevelPushMenu('Explorer', 'explorer', 'fa fa-reorder', this.defaultItems);
    this.multiLevelPushMenuService.initialize(options);
  }

  resetMenu(): void {
    this.multiLevelPushMenuService.update(this.defaultItems);
  }

  updateMenu(): void {
    const newItems = new Array<MultiLevelPushMenuItem>();
    newItems.push(new MultiLevelPushMenuItem('Collections', 'collections'));
    newItems.push(new MultiLevelPushMenuItem('Credits', 'credits'));
    this.multiLevelPushMenuService.update(newItems);
  }

  collapseMenu(): void {
    this.multiLevelPushMenuService.collapse(3);
  }

  expandMenu(): void {
    this.multiLevelPushMenuService.expand();
  }
}
