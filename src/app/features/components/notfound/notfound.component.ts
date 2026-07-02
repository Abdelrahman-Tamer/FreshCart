import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notfound',
  imports: [RouterModule, CommonModule],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.css'
})
export class NotfoundComponent implements OnInit {
  private readonly _Router = inject(Router);
  private readonly _AuthService = inject(AuthService);

  isAuthFailure = false;

  ngOnInit() {
    this.isAuthFailure = this._Router.url.includes('/not-found') && !this._AuthService.isAuthenticated();
  }

  get heading(): string {
    return this.isAuthFailure ? 'Access Denied' : '404';
  }

  get title(): string {
    return this.isAuthFailure ? 'Login Required' : 'Page Not Found';
  }

  get message(): string {
    return this.isAuthFailure
      ? 'You need to log in to access this page. Please sign in to continue.'
      : 'The page you\'re looking for doesn\'t exist or has been moved.';
  }

  goBack() {
    window.history.back();
  }
}
