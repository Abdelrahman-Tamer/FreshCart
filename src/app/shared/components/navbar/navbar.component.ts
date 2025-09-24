import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit } from '@angular/core';
import { FlowbiteService } from '../../../core/services/flowbite/flowbite.service';
import { initFlowbite } from 'flowbite';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/authentication/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  constructor( private _CookieService:CookieService ,private flowbiteService: FlowbiteService , private _AuthService:AuthService , private _Router :Router) {}

  userName!:string
  isLoggedIn: boolean = false;



  logOut(){
    // 1- programming routing
    // 2- delete token from Coockies
    // 3- userInfo (decoded token) == null
    this._Router.navigate(['/login'])
    this._CookieService.delete('token')
    this._AuthService.userInfo = null
    this.isLoggedIn = false;
    this.userName = '';
    
    // Update login status in auth service
    this._AuthService.updateLoginStatus(false);
  }




  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
    
    // Check if user is logged in
    this.checkLoginStatus();
    
    // Subscribe to login status changes
    this._AuthService.loginStatus$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this._AuthService.decodeToken();
        this.userName = this._AuthService.userInfo?.name || '';
      } else {
        this.userName = '';
      }
    });
  }

  checkLoginStatus(): void {
    const token = this._CookieService.get('token');
    this.isLoggedIn = !!token;
    
    if (this.isLoggedIn) {
      this._AuthService.decodeToken();
      this.userName = this._AuthService.userInfo?.name || '';
    }
    
    // Update the auth service with current status
    this._AuthService.updateLoginStatus(this.isLoggedIn);
  }


  showName(){
    this._AuthService.decodeToken()
    this.userName = this._AuthService.userInfo.name
    
  }


}
