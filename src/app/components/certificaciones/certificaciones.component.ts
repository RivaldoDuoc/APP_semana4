import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DBTaskService } from 'src/app/services/dbtask.service';

@Component({
  selector: 'app-certificaciones',
  templateUrl: './certificaciones.component.html',
  styleUrls: ['./certificaciones.component.scss']
})
export class CertificacionesComponent {
  certificacionForm: FormGroup;
  certificaciones: any[] = []; // Lista de certificaciones

  constructor(private fb: FormBuilder, private dbService: DBTaskService) {
    // Inicializar el formulario con validaciones
    this.certificacionForm = this.fb.group({
      nombre: ['', Validators.required],
      ano: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]]
    });
    this.loadCertificaciones(); // Cargar certificaciones al iniciar
  }

  // Función para cargar certificaciones desde SQLite
  loadCertificaciones() {
    this.dbService.getAllCertificaciones().then(certificaciones => {
      this.certificaciones = certificaciones;
    }).catch(error => {
      console.error('Error cargando certificaciones', error);
    });
  }

  // Función para agregar una certificación
  onSubmit() {
    if (this.certificacionForm.valid) {
      const formValues = this.certificacionForm.value;
      
      this.dbService.addCertificacion(
        formValues.nombre,
        formValues.ano
      ).then(() => {
        this.certificacionForm.reset();
        this.loadCertificaciones(); // Recargar certificaciones después de agregar
      }).catch(error => {
        console.error('Error al agregar certificación', error);
      });
    } else {
      console.log('Formulario inválido');
    }
  }

  // Función para eliminar una certificación
  deleteCertificacion(id: number) {
    this.dbService.deleteCertificacion(id).then(() => {
      this.loadCertificaciones(); // Recargar certificaciones después de eliminar
    }).catch(error => {
      console.error('Error al eliminar certificación', error);
    });
  }
}
