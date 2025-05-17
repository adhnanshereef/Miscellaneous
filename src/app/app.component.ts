import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IdeasDashboardComponent } from './ideas-dashboard/ideas-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IdeasDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Hackathon Ideas Showcase';
}
