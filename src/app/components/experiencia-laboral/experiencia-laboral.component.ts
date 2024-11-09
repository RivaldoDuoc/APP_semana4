import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DBTaskService } from 'src/app/services/dbtask.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-experiencia-laboral',
  templateUrl: './experiencia-laboral.component.html',
  styleUrls: ['./experiencia-laboral.component.scss']
})
export class ExperienciaLaboralComponent {
  experienciaForm: FormGroup;
  experiencias: any[] = []; // Lista de experiencias laborales
  selectedExperienciaId: number | null = null; // ID de la experiencia seleccionada para edición

  constructor(
    private fb: FormBuilder,
    private dbService: DBTaskService,
    private dialog: MatDialog
  ) {
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

  // Función para agregar o actualizar una experiencia laboral
  onSubmit() {
    if (this.experienciaForm.valid) {
      const formValues = this.experienciaForm.value;

      if (this.selectedExperienciaId !== null) {
        // Actualizar experiencia existente
        this.dbService.updateExperiencia(
          this.selectedExperienciaId,
          formValues.empresa,
          formValues.anoInicio,
          formValues.cargo,
          formValues.anoTermino,
          formValues.actual ? 1 : 0
        ).then(() => {
          this.experienciaForm.reset();
          this.loadExperiencias(); // Recargar experiencias después de actualizar
          this.selectedExperienciaId = null;
        }).catch(error => {
          console.error('Error al actualizar experiencia', error);
        });
      } else {
        // Agregar nueva experiencia
        this.dbService.addExperiencia(
          formValues.empresa,
          formValues.anoInicio,
          formValues.cargo,
          formValues.anoTermino,
          formValues.actual ? 1 : 0
        ).then(() => {
          this.experienciaForm.reset();
          this.loadExperiencias(); // Recargar experiencias después de agregar
        }).catch(error => {
          console.error('Error al agregar experiencia', error);
        });
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  // Seleccionar experiencia para editar
  onEdit(experience: any) {
    this.selectedExperienciaId = experience.id;
    this.experienciaForm.patchValue({
      empresa: experience.empresa,
      anoInicio: experience.ano_inicio,
      cargo: experience.cargo,
      anoTermino: experience.ano_termino,
      actual: experience.actual === 1
    });
  }

  // Eliminar experiencia con confirmación
  deleteExperiencia(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: '¿Está seguro que desea eliminar registro?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dbService.deleteExperiencia(id).then(() => {
          this.loadExperiencias(); // Recargar experiencias después de eliminar
        }).catch(error => {
          console.error('Error al eliminar experiencia', error);
        });
      }
    });
  }
}
