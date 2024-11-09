import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DBTaskService } from 'src/app/services/dbtask.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.page.html',
  styleUrls: ['./user-management.page.scss'],
})
export class UserManagementPage implements OnInit {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dbService: DBTaskService,
    private router: Router
  ) {
    // Inicializar el formulario de usuario con validaciones
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
    });
  }

  ngOnInit() {
    this.loadUserData(); // Cargar datos del usuario al iniciar la página
  }

  // Cargar datos del usuario desde la base de datos
  loadUserData() {
    this.dbService.getUser('usuario_actual').then(user => {
      if (user) {
        this.userForm.patchValue({
          nombre: user.nombre,
          apellidos: user.apellidos,
          email: user.email,
          edad: user.edad,
        });
      }
    }).catch(error => console.error('Error cargando datos del usuario', error));
  }

  // Guardar los cambios en los datos del usuario
  onSave() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      this.dbService.updateUserProfile(
        'usuario_actual',
        formData.nombre,
        formData.apellidos,
        formData.email,
        formData.edad
      ).then(() => {
        console.log('Perfil actualizado');
        this.router.navigate(['/home']);
      }).catch(error => console.error('Error actualizando perfil', error));
    }
  }

  // Cerrar sesión
  onLogout() {
    this.dbService.clearSession().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
