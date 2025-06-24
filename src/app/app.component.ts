import { Component, NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SolarSystemComponent } from './components/solar-system/solar-system.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SolarSystemComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'sistema-solar-threejs';
}
