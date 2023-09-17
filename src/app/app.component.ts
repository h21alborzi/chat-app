import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './features/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'chat-app';
  constructor(public auth: AuthService, private router: Router) {}

  signOut() {
    this.auth.signOut().subscribe({
      next: () => this.router.navigate(['signin'])
    });
  }
}
