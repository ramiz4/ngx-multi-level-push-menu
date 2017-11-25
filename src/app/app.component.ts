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

  constructor(private mlpmService: MultiLevelPushMenuService) {}

  ngOnInit() {
    this.defaultItems.push(new MultiLevelPushMenuItem('Home', 'home'));
    this.defaultItems.push(new MultiLevelPushMenuItem('About us', 'about-us'));
    let options: MultiLevelPushMenuOptions = new MultiLevelPushMenuOptions();
    options.mode = 'cover';
    options.menu = new MultiLevelPushMenu('Explorer', 'explorer', 'fa fa-reorder', this.defaultItems);
    this.mlpmService.initialize(options);
  }

  resetMenu(): void {
    this.mlpmService.update(this.defaultItems);
  }

  updateMenu(): void {
    let newItems = new Array<MultiLevelPushMenuItem>();
    newItems.push(new MultiLevelPushMenuItem('Collections', 'collections'));
    newItems.push(new MultiLevelPushMenuItem('Credits', 'credits'));
    this.mlpmService.update(newItems);
  }

  collapseMenu(): void {
    this.mlpmService.collapse();
  }

  expandMenu(): void {
    this.mlpmService.expand();
  }

}
