import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  selectedSegment: string = 'experiencia'; // Segmento seleccionado inicial

  constructor() {}

  // Cambiar al segmento seleccionado por el usuario
  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }
}
