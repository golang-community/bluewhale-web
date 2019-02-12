import { Component } from "@angular/core";
import { AuthService } from './services';

@Component({
  selector: 'root-app',
  template: `
    <router-outlet></router-outlet>
  `
})

export class RootApp {
  constructor(private authService: AuthService) {

  }

  ngOnInit() {

  }
}
