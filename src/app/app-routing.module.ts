import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // Redirección a la página de login
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) // Lazy Loading en LoginPageModule
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule), // Lazy Loading en HomePageModule
    canActivate: [AuthGuard] // Protección de acceso con AuthGuard
  },
  {
    path: 'user-management',
    loadChildren: () => import('./pages/user-management/user-management.module').then(m => m.UserManagementPageModule) // Lazy Loading en UserManagementPageModule
  },
  {
    path: '**',
    loadChildren: () => import('./pages/page404/page404.module').then(m => m.Page404PageModule) // Lazy Loading en Page404PageModule para rutas no encontradas
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }) // Estrategia de precarga de todos los módulos después de la carga inicial
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
