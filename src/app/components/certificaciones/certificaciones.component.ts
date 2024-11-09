import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DBTaskService } from 'src/app/services/dbtask.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-certificaciones',
  templateUrl: './certificaciones.component.html',
  styleUrls: ['./certificaciones.component.scss']
})
export class CertificacionesComponent {
  certificacionForm: FormGroup;
  certificaciones: any[] = [];
  selectedCertificacionId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private dbService: DBTaskService,
    private dialog: MatDialog
  ) {
    this.certificacionForm = this.fb.group({
      nombre: ['', Validators.required],
      ano: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]]
    });
    this.loadCertificaciones();
  }

  // Cargar certificaciones desde SQLite
  loadCertificaciones() {
    this.dbService.getAllCertificaciones().then(certificaciones => {
      this.certificaciones = certificaciones;
    }).catch(error => {
      console.error('Error cargando certificaciones', error);
    });
  }

  // Agregar o actualizar una certificación
  onSubmit() {
    if (this.certificacionForm.valid) {
      const formValues = this.certificacionForm.value;
      if (this.selectedCertificacionId) {
        // Actualizar certificación existente
        this.dbService.updateCertificacion(
          this.selectedCertificacionId,
          formValues.nombre,
          formValues.ano
        ).then(() => {
          this.loadCertificaciones(); // Recarga listado de certificaciones después de actualizar
          this.certificacionForm.reset();
          this.selectedCertificacionId = null;
        }).catch(error => {
          console.error('Error actualizando certificación', error);
        });
      } else {
        // Agrega nueva certificación
        this.dbService.addCertificacion(
          formValues.nombre,
          formValues.ano
        ).then(() => {
          this.certificacionForm.reset();
          this.loadCertificaciones(); // Recarga listado de certificaciones después de agregar
        }).catch(error => {
          console.error('Error al agregar certificación', error);
        });
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  // Selecciona certificación para editar
  onEdit(certificacion: any) {
    this.selectedCertificacionId = certificacion.id;
    this.certificacionForm.patchValue({
      nombre: certificacion.nombre,
      ano: certificacion.ano
    });
  }

  // Confirmación y eliminación de una certificación
  deleteCertificacion(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: '¿Está seguro que desea eliminar esta certificación?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dbService.deleteCertificacion(id).then(() => {
          this.loadCertificaciones(); // Recarga certificaciones después de eliminar
        }).catch(error => {
          console.error('Error al eliminar certificación', error);
        });
      }
    });
  }
}
