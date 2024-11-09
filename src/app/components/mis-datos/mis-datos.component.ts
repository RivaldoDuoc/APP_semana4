import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DBTaskService } from 'src/app/services/dbtask.service';

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.component.html',
  styleUrls: ['./mis-datos.component.scss']
})
export class MisDatosComponent implements OnInit {
  userForm: FormGroup;
  userData: any = null; // Datos del usuario cargado

  constructor(private fb: FormBuilder, private dbService: DBTaskService) {
    // Inicializar el formulario con validaciones
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadUserData(); // Cargar datos del usuario al iniciar
  }

  // Función para cargar los datos del usuario desde SQLite
  loadUserData() {
    this.dbService.getUser('usuario_actual').then(user => {
      if (user) {
        this.userData = user;
        this.userForm.patchValue({
          nombre: user.nombre,
          apellidos: user.apellidos,
          edad: user.edad,
          email: user.email
        });
      }
    }).catch(error => console.error('Error cargando datos del usuario', error));
  }

  // Función para guardar o actualizar los datos del usuario
  onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
  
      if (this.userData) {
        // Actualizar usuario existente
        this.dbService.updateUser(
          this.userData.id,          // ID del usuario
          this.userData.username,     // Username del usuario (debe estar definido en userData)
          this.userData.password,     // Password del usuario (debe estar definido en userData)
          formData.nombre,            // Nuevo nombre
          formData.apellidos,         // Nuevos apellidos
          formData.email,             // Nuevo email
          formData.edad               // Nueva edad
        ).then(() => {
          this.loadUserData();        // Recargar datos después de actualizar
          this.userForm.reset();
        }).catch(error => console.error('Error actualizando datos del usuario', error));
      } else {
        // Crear nuevo usuario si no existe userData
        this.dbService.addUser(
          'usuario_actual',           // Username predeterminado
          'contraseña_predeterminada', // Password predeterminado
          1                           // Estado activo del usuario
        ).then(() => {
          this.loadUserData();        // Recargar datos después de agregar
        }).catch(error => console.error('Error agregando datos del usuario', error));
      }
    } else {
      console.log('Formulario inválido');
    }
  }
  
  
  
  
}
