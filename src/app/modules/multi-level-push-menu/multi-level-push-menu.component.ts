import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'multi-level-push-menu',
  templateUrl: './multi-level-push-menu.component.html',
  styleUrls: ['./multi-level-push-menu.component.css']
})
export class MultiLevelPushMenuComponent {

  @ViewChild('menu') elMenu: ElementRef;
  @ViewChild('content') elContent: ElementRef;

  @Input('options') options: any;

  _menu: Array<any>;
  @Input('menu') set menu(value: Array<any>) {
    this._menu = value;
    this.createMenu();
  }
  get menu(): Array<any> {
    return this._menu;
  }

  constructor(private router: Router) { }

  createMenu() {
    if (!this.options.menuWidth) {
      this.options.menuWidth = 300;
    }
    if (Number.isInteger(this.options.menuWidth)) {
      this.options.menuWidth = this.options.menuWidth + 'px';
    }
    let offsetLeft = 'calc(' + this.options.menuWidth + ' + 50px)';
    $(this.elContent.nativeElement).css('left', offsetLeft);

    if (Number.isInteger(this.options.menuHeight)) {
      this.options.menuHeight = this.options.menuHeight + 'px';
    }

    let router = this.router;

    $(this.elMenu.nativeElement).multilevelpushmenu({
      container: $(this.elMenu.nativeElement),                      // Holding container.
      containersToPush: [$(this.elContent.nativeElement)],          // Array of objects to push/slide together with menu.
      collapsed: this.options.collapsed,                            // Initialize menu in collapsed/expanded mode
      menuID: this.options.menuID,                                  // ID of <nav> element.
      wrapperClass: this.options.wrapperClass,                      // Wrapper CSS class.
      menuInactiveClass: this.options.menuInactiveClass,            // CSS class for inactive wrappers.
      menu: this.menu,                                              // JS array of menu items (if markup not provided).
      menuWidth: this.options.menuWidth,                            // Wrapper width (integer, '%', 'px', 'em').
      menuHeight: this.options.menuHeight,                          // Menu height (integer, '%', 'px', 'em').
      backText: this.options.backText,                              // Text for 'Back' menu item.
      backItemClass: this.options.backItemClass,                    // CSS class for back menu item.
      backItemIcon: this.options.backItemIcon,                      // FontAvesome icon used for back menu item.
      groupIcon: this.options.groupIcon,                            // FontAvesome icon used for menu items contaning sub-items.
      mode: this.options.mode,                                      // Menu sliding mode: overlap/cover.
      overlapWidth: this.options.overlapWidth,                      // Width in px of menu wrappers overlap
      preventItemClick: this.options.preventItemClick,              // set to false if you do not need event callback functionality per item click
      preventGroupItemClick: this.options.preventGroupItemClick,    // set to false if you do not need event callback functionality per group item click
      direction: this.options.direction,                            // set to 'rtl' for reverse sliding direction
      fullCollapse: this.options.fullCollapse,                      // set to true to fully hide base level holder when collapsed
      swipe: this.options.swipe,                                     // or 'touchscreen', or 'desktop', or 'none'. everything else is concidered as 'none'

      onItemClick: function () {
        const event = arguments[0];
        const $menuLevelHolder = arguments[1];
        const $item = arguments[2];
        const options = arguments[3];
        
        const itemHref = $item.find('a:first').attr('href');
        router.navigateByUrl(itemHref);
      }
    });

    // Base expand
    // $( '#baseexpand' ).click(function(){
    //   $( '#menu' ).multilevelpushmenu('expand');
    // });

  }

}
