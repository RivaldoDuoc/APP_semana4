import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DBTaskService } from 'src/app/services/dbtask.service';

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.component.html',
  styleUrls: ['./mis-datos.component.scss']
})
export class MisDatosComponent {
  userForm: FormGroup;

  constructor(private fb: FormBuilder, private dbService: DBTaskService) {
    // Inicializar el formulario con validaciones
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Función para enviar el formulario
  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      console.log('Datos de usuario:', userData);
      // Aquí puedes guardar los datos en SQLite o hacer alguna acción adicional
    } else {
      console.log('Formulario inválido');
    }
  }
}
