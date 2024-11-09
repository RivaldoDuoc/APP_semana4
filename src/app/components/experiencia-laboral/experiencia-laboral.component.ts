import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DBTaskService } from 'src/app/services/dbtask.service';

@Component({
  selector: 'app-experiencia-laboral',
  templateUrl: './experiencia-laboral.component.html',
  styleUrls: ['./experiencia-laboral.component.scss']
})
export class ExperienciaLaboralComponent {
  experienciaForm: FormGroup;
  experiencias: any[] = []; // Lista de experiencias laborales

  constructor(private fb: FormBuilder, private dbService: DBTaskService) {
    // Inicializar el formulario con validaciones
    this.experienciaForm = this.fb.group({
      empresa: ['', Validators.required],
      anoInicio: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      cargo: ['', Validators.required],
      anoTermino: ['', Validators.min(1900)],
      actual: [false]  // El valor inicial es false
    });
    this.loadExperiencias(); // Cargar experiencias al iniciar
  }

  // Función para cargar experiencias desde SQLite
  loadExperiencias() {
    this.dbService.getAllExperiencia().then(experiencias => {
      this.experiencias = experiencias;
    });
  }

  // Función para agregar una experiencia laboral
  onSubmit() {
    if (this.experienciaForm.valid) {
      const formValues = this.experienciaForm.value;
      
      this.dbService.addExperiencia(
        formValues.empresa,
        formValues.anoInicio,
        formValues.cargo,
        formValues.anoTermino,
        formValues.actual ? 1 : 0  // Convertir a 1 o 0
      ).then(() => {
        this.experienciaForm.reset();
        this.loadExperiencias(); // Recargar experiencias después de agregar
      }).catch(error => {
        console.error('Error al agregar experiencia', error);
      });
    } else {
      console.log('Formulario inválido');
    }
  }

  // Función para eliminar una experiencia laboral
  deleteExperiencia(id: number) {
    this.dbService.deleteExperiencia(id).then(() => {
      this.loadExperiencias(); // Recargar experiencias después de eliminar
    }).catch(error => {
      console.error('Error al eliminar experiencia', error);
    });
  }
}
