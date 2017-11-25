import { Component, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MultiLevelPushMenuService } from './multi-level-push-menu.service';
import { MultiLevelPushMenuOptions, MultiLevelPushMenuItem } from './multi-level-push-menu.model';

declare var $: any;

@Component({
  selector: 'multi-level-push-menu',
  templateUrl: './multi-level-push-menu.component.html',
  styleUrls: ['./multi-level-push-menu.component.css']
})
export class MultiLevelPushMenuComponent implements OnDestroy {

  @ViewChild('menu') elMenu: ElementRef;
  @ViewChild('content') elContent: ElementRef;

  oldMenuItems: Array<MultiLevelPushMenuItem>;

  initializeSubscription: Subscription;
  updateSubscription: Subscription;
  collapseSubscription: Subscription;
  expandSubscription: Subscription;

  constructor(private router: Router, private mlpmService: MultiLevelPushMenuService) {
    this.initializeSubscription = this.mlpmService.initialized().subscribe(options => {
      this.initMenu(options);
    });
    this.updateSubscription = this.mlpmService.updated().subscribe(items => {
      this.updateMenu(items);
    });
    this.collapseSubscription = this.mlpmService.collapsed().subscribe(level => {
      this.collapseMenu(level);
    });
    this.expandSubscription = this.mlpmService.expanded().subscribe(value => {
      this.expandMenu();
    });
  }

  initMenu(options: MultiLevelPushMenuOptions) {
    if (!options.menuWidth) {
      options.menuWidth = '300px';
    }
    let offsetLeft = 'calc(' + options.menuWidth + ' + 20px)';
    $(this.elContent.nativeElement).css('left', offsetLeft);
    $(this.elContent.nativeElement).css('width', 'calc(100% - (' + options.menuWidth + ' + 20px))');

    let router = this.router;

    $(this.elMenu.nativeElement).multilevelpushmenu({
      container: $(this.elMenu.nativeElement),                 // Holding container.
      containersToPush: [$(this.elContent.nativeElement)],     // Array of objects to push/slide together with menu.
      collapsed: options.collapsed,                            // Initialize menu in collapsed/expanded mode
      menuID: options.menuID,                                  // ID of <nav> element.
      wrapperClass: options.wrapperClass,                      // Wrapper CSS class.
      menuInactiveClass: options.menuInactiveClass,            // CSS class for inactive wrappers.
      menu: [options.menu],                                    // JS array of menu items (if markup not provided).
      menuWidth: options.menuWidth,                            // Wrapper width (integer, '%', 'px', 'em').
      menuHeight: options.menuHeight,                          // Menu height (integer, '%', 'px', 'em').
      backText: options.backText,                              // Text for 'Back' menu item.
      backItemClass: options.backItemClass,                    // CSS class for back menu item.
      backItemIcon: options.backItemIcon,                      // FontAvesome icon used for back menu item.
      groupIcon: options.groupIcon,                            // FontAvesome icon used for menu items contaning sub-items.
      mode: options.mode,                                      // Menu sliding mode: overlap/cover.
      overlapWidth: options.overlapWidth,                      // Width in px of menu wrappers overlap
      preventItemClick: options.preventItemClick,              // set to false if you do not need event callback functionality per item click
      preventGroupItemClick: options.preventGroupItemClick,    // set to false if you do not need event callback functionality per group item click
      direction: options.direction,                            // set to 'rtl' for reverse sliding direction
      fullCollapse: options.fullCollapse,                      // set to true to fully hide base level holder when collapsed
      swipe: options.swipe,                                    // or 'touchscreen', or 'desktop', or 'none'. everything else is concidered as 'none'

      onItemClick: function () {
        const $item = arguments[2];
        const itemHref = $item.find('a:first').attr('href');
        router.navigateByUrl(itemHref);
      }
    });

    this.oldMenuItems = options.menu.items;

    // Base expand
    // $( '#baseexpand' ).click(function(){
    //   $(this.elMenu.nativeElement).multilevelpushmenu('expand');
    // });

  }

  updateMenu(items: Array<MultiLevelPushMenuItem>): void {
    if (JSON.stringify(this.oldMenuItems.sort()) !== JSON.stringify(items.sort())) {
      // Add new items
      var $addTo = $(this.elMenu.nativeElement).multilevelpushmenu('activemenu').first();
      $(this.elMenu.nativeElement).multilevelpushmenu('additems', items, $addTo, 0);
      // Remove old items
      this.oldMenuItems.forEach(item => {
        item = $(this.elMenu.nativeElement).multilevelpushmenu('finditemsbyname', item.name);
        $(this.elMenu.nativeElement).multilevelpushmenu('removeitems', item);
      });
      this.oldMenuItems = items;
    }
  }

  collapseMenu(level: number) {
    if(level) {
      // Collapse menu down to level 1 (0 level represent root level expanded)
      $(this.elMenu.nativeElement).multilevelpushmenu('collapse', level);
    } else {
      // Full collapse
      $(this.elMenu.nativeElement).multilevelpushmenu('collapse');
    }

    // Collapse menu down to the level of $menuLevelObject
    // $('#menu').multilevelpushmenu('collapse', $menuLevelObject);

    // Collapse menu down to the level of menu level object with title 'Devices' (not really recommended since there could be many menu level objects with the same title; in such cases collasing will be unsuccessful)
    // $('#menu').multilevelpushmenu('collapse', 'Devices');
  }

  expandMenu() {
    // Menu expand from fully collapsed mode to level 0
    $(this.elMenu.nativeElement).multilevelpushmenu('expand');

    // // Expand menu up to the $menuLevelObject
    // $('#menu').multilevelpushmenu('expand', $menuLevelObject);

    // // Expand menu up to the menu level object with title 'Devices' (not recommended since there could be many menu level objects with the same title; in such cases expanding will be unsuccessful)
    // $('#menu').multilevelpushmenu('expand', 'Devices');
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.initializeSubscription.unsubscribe();
    this.updateSubscription.unsubscribe();
  }

}
