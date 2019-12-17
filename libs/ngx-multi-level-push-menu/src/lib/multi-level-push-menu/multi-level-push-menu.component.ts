import { Component, OnDestroy, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MultiLevelPushMenuService } from './multi-level-push-menu.service';
import { MultiLevelPushMenuOptions } from './multi-level-push-menu.model';

declare var $: any;

@Component({
  selector: 'ramiz4-multi-level-push-menu',
  templateUrl: './multi-level-push-menu.component.html',
  styleUrls: ['./multi-level-push-menu.component.css']
})
export class MultiLevelPushMenuComponent implements OnInit, OnDestroy {

  @ViewChild('menu', { static: true }) menu: ElementRef;
  @ViewChild('content', { static: true }) content: ElementRef;
  
  private _options = new MultiLevelPushMenuOptions();

  @Input()
  set options(options: MultiLevelPushMenuOptions) {
    options.mode = options.mode || this._options.mode;
    options.menu = options.menu || this._options.menu;
    this.initMenu(options);
    this.initialized = true;
  }

  get options(): MultiLevelPushMenuOptions {
    return this._options;
  }

  initialized: boolean;
  collapseSubscription: Subscription;
  expandSubscription: Subscription;

  constructor(private router: Router, private multiLevelPushMenuService: MultiLevelPushMenuService) {
    this.collapseSubscription = this.multiLevelPushMenuService.collapsed().subscribe(level => {
      this.collapseMenu(level);
    });
    this.expandSubscription = this.multiLevelPushMenuService.expanded().subscribe(value => {
      this.expandMenu();
    });
  }

  ngOnInit() {
    if(!this.initialized) {
      this.initMenu(this._options);
    }
  }

  initMenu(options: MultiLevelPushMenuOptions) {
    if (!options.menuWidth) {
      options.menuWidth = '300px';
    }
    const offsetLeft = 'calc(' + options.menuWidth + ' + 20px)';
    $(this.content.nativeElement).css('left', offsetLeft);
    $(this.content.nativeElement).css('width', 'calc(100% - (' + options.menuWidth + ' + 20px))');

    const router = this.router;

    $(this.menu.nativeElement).multilevelpushmenu({
      container: $(this.menu.nativeElement),                // Holding container.
      containersToPush: [$(this.content.nativeElement)],    // Array of objects to push/slide together with menu.
      collapsed: options.collapsed,                           // Initialize menu in collapsed/expanded mode
      menuID: options.menuID,                                 // ID of <nav> element.
      wrapperClass: options.wrapperClass,                     // Wrapper CSS class.
      menuInactiveClass: options.menuInactiveClass,           // CSS class for inactive wrappers.
      menu: [options.menu],                                   // JS array of menu items (if markup not provided).
      menuWidth: options.menuWidth,                           // Wrapper width (integer, '%', 'px', 'em').
      menuHeight: options.menuHeight,                         // Menu height (integer, '%', 'px', 'em').
      backText: options.backText,                             // Text for 'Back' menu item.
      backItemClass: options.backItemClass,                   // CSS class for back menu item.
      backItemIcon: options.backItemIcon,                     // FontAwesome icon used for back menu item.
      groupIcon: options.groupIcon,                           // FontAwesome icon used for menu items containing sub-items.
      mode: options.mode,                                     // Menu sliding mode: overlap/cover.
      overlapWidth: options.overlapWidth,                     // Width in px of menu wrappers overlap
      preventItemClick: options.preventItemClick,             // set to false if you don't need event callback functionality per item click
      preventGroupItemClick: options.preventGroupItemClick,   // set to false if you don't need event cb functionality per group item click
      direction: options.direction,                           // set to 'rtl' for reverse sliding direction
      fullCollapse: options.fullCollapse,                     // set to true to fully hide base level holder when collapsed
      swipe: options.swipe,                                   // 'touchscreen', 'desktop' or 'none' everything else is considered as 'none'

      onItemClick: function () {
        const $item = arguments[2];
        const itemHref = $item.find('a:first').attr('href');
        router.navigateByUrl(itemHref);
      }
    });
  }

  collapseMenu(level: number) {
    if (level) {
      // Collapse menu down to level 1 (0 level represent root level expanded)
      $(this.menu.nativeElement).multilevelpushmenu('collapse', level);
    } else {
      // Full collapse
      $(this.menu.nativeElement).multilevelpushmenu('collapse');
    }

    // Collapse menu down to the level of $menuLevelObject
    // $('#menu').multilevelpushmenu('collapse', $menuLevelObject);

    // Collapse menu down to the level of menu level object with title 'Devices' (not really recommended since there could be many menu 
    // level objects with the same title; in such cases collapsing will be unsuccessful)
    // $('#menu').multilevelpushmenu('collapse', 'Devices');
  }

  expandMenu() {
    // Menu expand from fully collapsed mode to level 0
    $(this.menu.nativeElement).multilevelpushmenu('expand');

    // // Expand menu up to the $menuLevelObject
    // $('#menu').multilevelpushmenu('expand', $menuLevelObject);

    // Expand menu up to the menu level object with title 'Devices' (not recommended since there could be many menu level objects with the
    // same title; in such cases expanding will be unsuccessful)
    // $('#menu').multilevelpushmenu('expand', 'Devices');
  }

  ngOnDestroy() {
    // this.collapseSubscription.unsubscribe();
    // this.expandSubscription.unsubscribe();
  }

}
