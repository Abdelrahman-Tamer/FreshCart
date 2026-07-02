import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authentication/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);

  isLoggedIn = false;
  userName = '';
  isMobileMenuOpen = false;
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this._AuthService.isLoggedIn.subscribe({
      next: (status) => {
        this.isLoggedIn = status;
        if (status) {
          this._AuthService.decodeToken();
          this.userName = this._AuthService.userName;
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  logOut() {
    this._AuthService.logOut();
    this._Router.navigate(['/login']);
  }
}
