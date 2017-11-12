import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  myMenuOptions = {
    // menuWidth: 500
  };
  myMenuItems = [
    {
      title: 'All Categories',
      id: 'menuID',
      icon: 'fa fa-reorder',
      items: [
        {
          name: 'Devices',
          id: 'itemID',
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
                          link: '#'
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
                }
              ]
            }
          ]
        },
        {
          name: 'Collections',
          link: 'collections'
        },
        {
          name: 'Credits',
          link: 'credits'
        }
      ]
    }
  ];
}
