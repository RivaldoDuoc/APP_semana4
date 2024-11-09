import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DBTaskService } from 'src/app/services/dbtask.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dbService: DBTaskService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {}

  onLogin() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.dbService.getUser(username).then(user => {
        if (user && user.password === password) {
          this.dbService.setSession(username, password);
          this.router.navigate(['/home']);
        } else {
          console.error('Usuario o contraseña incorrectos');
        }
      }).catch(error => console.error('Error al iniciar sesión', error));
    }
  }
}
