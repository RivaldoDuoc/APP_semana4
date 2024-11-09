import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  selectedSegment: string = 'experiencia'; // Segmento seleccionado inicialmente

  constructor() {}

  // Cambia el segmento según el botón seleccionado
  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }
}
