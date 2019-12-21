import { Component, OnInit } from '@angular/core';
import { MultiLevelPushMenuService, MultiLevelPushMenuOptions } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  selector: 'ramiz4-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'multi-level-push-menu-example';
  
  options = new MultiLevelPushMenuOptions();

  constructor(private multiLevelPushMenuService: MultiLevelPushMenuService) { }

  ngOnInit() {
    this.options.menu = { title: 'Company Name', id: 'menuID', icon: 'fa fa-reorder' };
    this.options.menu.items = [
      { name: 'Home', id: 'home', icon: 'fa fa-home', link: 'home' },
      { name: 'About Us', id: 'about-us', icon: 'fa fa-user', link: 'about-us' },
      {
        name: 'Devices',
        id: 'devices',
        icon: 'fa fa-laptop',
        link: '#',
        items: [
          {
            title: 'Devices',
            icon: 'fa fa-laptop',
            items: [
              {
                name: 'Mobile Phones',
                icon: 'fa fa-phone',
                link: '#',
                items: [
                  {
                    title: 'Mobile Phones',
                    icon: 'fa fa-phone',
                    link: '#',
                    items: [
                      {
                        name: 'Super Smart Phone',
                        link: 'xxx'
                      },
                      {
                        name: 'Thin Magic Mobile',
                        link: 'xxx'
                      },
                      {
                        name: 'Performance Crusher',
                        link: 'xxx'
                      },
                      {
                        name: 'Futuristic Experience',
                        link: 'xxx'
                      }
                    ]
                  }
                ]
              },
              {
                name: 'Televisions',
                icon: 'fa fa-desktop',
                link: '#',
                items: [
                  {
                    title: 'Televisions',
                    icon: 'fa fa-desktop',
                    link: '#',
                    items: [
                      {
                        name: 'Flat Super Screen',
                        link: '#'
                      },
                      {
                        name: 'Gigantic LED',
                        link: '#'
                      },
                      {
                        name: 'Power Eater',
                        link: '#'
                      },
                      {
                        name: '3D Experience',
                        link: '#'
                      },
                      {
                        name: 'Classic Comfort',
                        link: '#'
                      }
                    ]
                  }
                ]
              },
              {
                name: 'Cameras',
                icon: 'fa fa-camera-retro',
                link: '#',
                items: [
                  {
                    title: 'Cameras',
                    icon: 'fa fa-camera-retro',
                    link: '#',
                    items: [
                      {
                        name: 'Smart Shot',
                        link: '#'
                      },
                      {
                        name: 'Power Shooter',
                        link: '#'
                      },
                      {
                        name: 'Easy Photo Maker',
                        link: '#'
                      },
                      {
                        name: 'Super Pixel',
                        link: '#'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'Magazines',
        icon: 'fa fa-book',
        link: '#',
        items: [
          {
            title: 'Magazines',
            icon: 'fa fa-book',
            items: [
              {
                name: 'National Geographics',
                link: '#'
              },
              {
                name: 'Scientific American',
                link: '#'
              },
              {
                name: 'The Spectator',
                link: '#'
              },
              {
                name: 'Rambler',
                link: '#'
              },
              {
                name: 'Physics World',
                link: '#'
              },
              {
                name: 'The New Scientist',
                link: '#'
              }
            ]
          }
        ]
      },
      {
        name: 'Store',
        icon: 'fa fa-shopping-cart',
        link: '#',
        items: [
          {
            title: 'Store',
            icon: 'fa fa-shopping-cart',
            items: [
              {
                name: 'Clothes',
                icon: 'fa fa-tags',
                link: '#',
                items: [
                  {
                    title: 'Clothes',
                    icon: 'fa fa-tags',
                    items: [
                      {
                        name: 'Women\'s Clothing',
                        icon: 'fa fa-female',
                        link: '#',
                        items: [
                          {
                            title: 'Women\'s Clothing',
                            icon: 'fa fa-female',
                            items: [
                              {
                                name: 'Tops',
                                link: '#'
                              },
                              {
                                name: 'Dresses',
                                link: '#'
                              },
                              {
                                name: 'Trousers',
                                link: '#'
                              },
                              {
                                name: 'Shoes',
                                link: '#'
                              },
                              {
                                name: 'Sale',
                                link: '#'
                              }
                            ]
                          }
                        ]
                      },
                      {
                        name: 'Men\'s Clothing',
                        icon: 'fa fa-male',
                        link: '#',
                        items: [
                          {
                            title: 'Men\'s Clothing',
                            icon: 'fa fa-male',
                            items: [
                              {
                                name: 'Shirts',
                                link: '#'
                              },
                              {
                                name: 'Trousers',
                                link: '#'
                              },
                              {
                                name: 'Shoes',
                                link: '#'
                              },
                              {
                                name: 'Sale',
                                link: '#'
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                name: 'Jewelry',
                link: '#'
              },
              {
                name: 'Music',
                link: '#'
              },
              {
                name: 'Grocery',
                link: '#'
              }
            ]
          }
        ]
      },
      {
        name: 'Collections',
        link: '#'
      },
      {
        name: 'Credits',
        link: '#'
      }
    ];
  }

  collapseMenu(): void {
    this.multiLevelPushMenuService.collapse();
  }

  expandMenu(): void {
    this.multiLevelPushMenuService.expand();
  }
}
