export class MultiLevelPushMenuOptions {
    constructor(
        public menu?: MultiLevelPushMenu, // JS array of menu items (if markup not provided).
        public mode?: string, // Menu sliding mode?: overlap/cover.
        public collapsed?: boolean, // Initialize menu in collapsed/expanded mode
        public menuID?: string, // ID of <nav> element.
        public wrapperClass?: string, // Wrapper CSS class.
        public menuInactiveClass?: string, // CSS class for inactive wrappers.
        public menuWidth?: string, // Wrapper width (integer, '%', 'px', 'em').
        public menuHeight?: string, // Menu height (integer, '%', 'px', 'em').
        public backText?: string, // Text for 'Back' menu item.
        public backItemClass?: string, // CSS class for back menu item.
        public backItemIcon?: string, // FontAvesome icon used for back menu item.
        public groupIcon?: string, // FontAvesome icon used for menu items contaning sub-items.
        public overlapWidth?: string, // Width in px of menu wrappers overlap
        public preventItemClick?: boolean, // set to false if you do not need event callback functionality per item click
        public preventGroupItemClick?: boolean, // set to false if you do not need event callback functionality per group item click
        public direction?: string, // set to 'rtl' for reverse sliding direction
        public fullCollapse?: boolean, // set to true to fully hide base level holder when collapsed
        public swipe?: string // or 'touchscreen', or 'desktop', or 'none'. everything else is concidered as 'none'
    ) {
        this.menu = menu || new MultiLevelPushMenu('Explorer', 'explorer', 'fa fa-reorder');
        this.mode = mode || 'cover';
    }
}

export class MultiLevelPushMenu {
    constructor(
        public title?: string,
        public id?: string,
        public icon?: string,
        public items?: Array<MultiLevelPushMenuItem>
    ) { }
}

export class MultiLevelPushMenuItem {
    constructor(
        public title?: string,
        public id?: string,
        public name?: string,
        public icon?: string,
        public link?: string,
        public items?: Array<MultiLevelPushMenuItem>
    ) { }
}
