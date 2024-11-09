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
  users: any[] = []; // Lista de usuarios
  selectedUserId: number | null = null; // ID del usuario seleccionado para actualizar

  constructor(
    private fb: FormBuilder,
    private dbService: DBTaskService,
    private router: Router
  ) {
    // Inicializar el formulario de usuario con validaciones y confirmación de contraseña
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
    }, { validator: this.passwordsMatchValidator });
  }

  ngOnInit() {
    this.loadUsers(); // Cargar lista de usuarios al iniciar la página
  }

  // Validación personalizada para asegurar que las contraseñas coincidan
  passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  // Cargar todos los usuarios desde la base de datos
  loadUsers() {
    this.dbService.getAllUsers().then(users => {
      this.users = users;
    }).catch(error => console.error('Error cargando lista de usuarios', error));
  }

  // Crear un nuevo usuario o actualizar uno existente
  onSave() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      if (this.selectedUserId === null) {
        // Crear nuevo usuario
        this.dbService.addUser(
          formData.username,
          formData.password,
          1  // Estado activo del usuario
        ).then(() => {
          this.loadUsers();
          this.userForm.reset();
        }).catch(error => console.error('Error registrando usuario', error));
      } else {
        // Actualizar usuario existente
        this.dbService.updateUser(
          this.selectedUserId,
          formData.username,
          formData.password,
          formData.nombre,
          formData.apellidos,
          formData.email,
          formData.edad
        ).then(() => {
          this.loadUsers();
          this.userForm.reset();
          this.selectedUserId = null; // Resetear el usuario seleccionado
        }).catch(error => console.error('Error actualizando usuario', error));
      }
    }
  }

  // Seleccionar usuario para editar
  onEdit(user: any) {
    this.selectedUserId = user.id;
    this.userForm.patchValue({
      username: user.username,
      password: user.password,
      confirmPassword: user.password, // Asignar password también a confirmPassword
      nombre: user.nombre,
      apellidos: user.apellidos,
      email: user.email,
      edad: user.edad
    });
  }

  // Eliminar un usuario
  onDelete(userId: number) {
    this.dbService.deleteUser(userId).then(() => {
      this.loadUsers();
    }).catch(error => console.error('Error eliminando usuario', error));
  }

  // Cerrar sesión
  onLogout() {
    this.dbService.clearSession().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
