import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-notfound',
  imports: [RouterModule],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.css'
})
export class NotfoundComponent {
  private readonly _Router = inject(Router);

  goBack() {
    window.history.back();
  }
}
