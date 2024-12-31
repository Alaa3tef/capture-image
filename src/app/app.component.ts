import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CaptureImageComponent } from "./Component/capture-image/capture-image.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CaptureImageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'capture-image';
}
