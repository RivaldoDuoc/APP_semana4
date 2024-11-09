import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class DBTaskService {
  private dbInstance: SQLiteObject | undefined;
  private isDbReady = new BehaviorSubject<boolean>(false);
  usersList = new BehaviorSubject<any[]>([]);
  experienciasList = new BehaviorSubject<any[]>([]);
  certificacionesList = new BehaviorSubject<any[]>([]);

  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private storage: Storage
  ) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'skeletonapp.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        this.dbInstance = db;
        this.createTables(); // Crear las tablas al inicializar la base de datos
      });
      this.storage.create(); // Inicializar almacenamiento para la sesión de usuario
    });
  }

  // Crear las tablas necesarias en la base de datos
  private createTables() {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return;
    }

    // Tabla para usuarios
    this.dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS sesion_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        nombre TEXT,
        apellidos TEXT,
        email TEXT,
        edad INTEGER,
        active INTEGER
      );`, [])
      .then(() => this.isDbReady.next(true))
      .catch(e => console.error('Error creando tabla sesion_data', e));

    // Tabla para experiencia laboral
    this.dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS experiencia_laboral (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa TEXT,
        ano_inicio INTEGER,
        cargo TEXT,
        ano_termino INTEGER,
        actual INTEGER
      );`, [])
      .then(() => this.isDbReady.next(true))
      .catch(e => console.error('Error creando tabla experiencia_laboral', e));

    // Tabla para certificaciones
    this.dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS certificaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        ano INTEGER
      );`, [])
      .then(() => this.isDbReady.next(true))
      .catch(e => console.error('Error creando tabla certificaciones', e));
  }

  // CRUD para Usuarios
  addUser(username: string, password: string, active: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [username, password, '', '', '', null, active];
    return this.dbInstance.executeSql(
      `INSERT INTO sesion_data (username, password, nombre, apellidos, email, edad, active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      data
    ).then(() => {
      this.loadUsers();
      console.log('Usuario creado correctamente:', data); // para ver si el usuario se creó correctamente y almacena en BD
    }).catch(e => {
      console.error('Error al agregar usuario', e);
      throw e;
    });
  }

  getAllUsers(): Promise<any[]> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.resolve([]);
    }
    return this.dbInstance.executeSql(`SELECT * FROM sesion_data`, []).then(res => {
      let users: any[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        users.push(res.rows.item(i));
      }
      return users;
    }).catch(e => {
      console.error('Error obteniendo usuarios', e);
      return [];
    });
  }

  updateUser(id: number, username: string, password: string, nombre: string, apellidos: string, email: string, edad: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [username, password, nombre, apellidos, email, edad, id];
    return this.dbInstance.executeSql(
      `UPDATE sesion_data SET username = ?, password = ?, nombre = ?, apellidos = ?, email = ?, edad = ? WHERE id = ?`,
      data
    ).then(() => {
      this.loadUsers();
    }).catch(e => {
      console.error('Error actualizando usuario', e);
      throw e;
    });
  }

  deleteUser(id: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(
      `DELETE FROM sesion_data WHERE id = ?`,
      [id]
    ).then(() => {
      this.loadUsers();
    }).catch(e => {
      console.error('Error eliminando usuario', e);
      throw e;
    });
  }

  private loadUsers() {
    this.getAllUsers().then(users => {
      this.usersList.next(users);
    });
  }

  getUsers(): Observable<any[]> {
    return this.usersList.asObservable();
  }

  // CRUD para Experiencia Laboral
  addExperiencia(empresa: string, ano_inicio: number, cargo: string, ano_termino: number | null, actual: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [empresa, ano_inicio, cargo, ano_termino, actual];
    return this.dbInstance.executeSql(
      `INSERT INTO experiencia_laboral (empresa, ano_inicio, cargo, ano_termino, actual) VALUES (?, ?, ?, ?, ?)`,
      data
    ).then(() => this.loadExperiencias())
      .catch(e => {
        console.error('Error agregando experiencia laboral', e);
        throw e;
      });
  }

  getAllExperiencia(): Promise<any[]> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.resolve([]);
    }
    return this.dbInstance.executeSql(`SELECT * FROM experiencia_laboral`, []).then(res => {
      let items: any[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        items.push(res.rows.item(i));
      }
      return items;
    }).catch(e => {
      console.error('Error obteniendo experiencias laborales', e);
      return [];
    });
  }

  private loadExperiencias() {
    this.getAllExperiencia().then(items => {
      this.experienciasList.next(items);
    });
  }

  getExperiencias(): Observable<any[]> {
    return this.experienciasList.asObservable();
  }

  // CRUD para Certificaciones
  addCertificacion(nombre: string, ano: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [nombre, ano];
    return this.dbInstance.executeSql(
      `INSERT INTO certificaciones (nombre, ano) VALUES (?, ?)`,
      data
    ).then(() => this.loadCertificaciones())
      .catch(e => {
        console.error('Error agregando certificación', e);
        throw e;
      });
  }

  getAllCertificaciones(): Promise<any[]> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.resolve([]);
    }
    return this.dbInstance.executeSql(`SELECT * FROM certificaciones`, []).then(res => {
      let items: any[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        items.push(res.rows.item(i));
      }
      return items;
    }).catch(e => {
      console.error('Error obteniendo certificaciones', e);
      return [];
    });
  }

  private loadCertificaciones() {
    this.getAllCertificaciones().then(items => {
      this.certificacionesList.next(items);
    });
  }

  getCertificaciones(): Observable<any[]> {
    return this.certificacionesList.asObservable();
  }

  // Funciones de sesión
  async setSession(username: string, password: string) {
    await this.storage.set('username', username);
    await this.storage.set('password', password);
    await this.storage.set('active', 1);
  }

  async clearSession() {
    await this.storage.clear();
  }

  async isUserLoggedIn(): Promise<boolean> {
    return (await this.storage.get('active')) === 1;
  }

  // Método para obtener un usuario específico por username
  getUser(username: string): Promise<any> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(`SELECT * FROM sesion_data WHERE username = ?`, [username])
      .then(res => {
        if (res.rows.length > 0) {
          return res.rows.item(0); // Retorna el primer resultado encontrado
        }
        return null; // Retorna null si no encuentra el usuario
      })
      .catch(e => {
        console.error('Error obteniendo usuario', e);
        throw e;
      });
  }

  // Método para eliminar una certificación por ID
  deleteCertificacion(id: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(
      `DELETE FROM certificaciones WHERE id = ?`,
      [id]
    ).then(() => {
      this.loadCertificaciones(); // Recargar certificaciones después de eliminar una
    }).catch(e => {
      console.error('Error eliminando certificación', e);
      throw e;
    });
  }

  // Método para eliminar una experiencia laboral por ID
  deleteExperiencia(id: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(
      `DELETE FROM experiencia_laboral WHERE id = ?`,
      [id]
    ).then(() => {
      this.loadExperiencias(); // Recargar experiencias después de eliminar una
    }).catch(e => {
      console.error('Error eliminando experiencia laboral', e);
      throw e;
    });
  }

  // En el servicio dbtask.service.ts

  // Método para guardar los datos de "Mis Datos"
  addUserProfile(nombre: string, apellidos: string, edad: number, email: string): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [nombre, apellidos, edad, email];
    return this.dbInstance.executeSql(
      `INSERT INTO sesion_data (nombre, apellidos, edad, email) VALUES (?, ?, ?, ?)`,
      data
    ).then(() => {
      console.log('Datos de usuario guardados correctamente');
    }).catch(e => {
      console.error('Error guardando los datos de usuario', e);
      throw e;
    });
  }

  // Método para obtener los datos de "Mis Datos"
  getUserProfile(): Promise<any> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(`SELECT nombre, apellidos, edad, email FROM sesion_data LIMIT 1`, [])
      .then(res => {
        if (res.rows.length > 0) {
          return res.rows.item(0); // Retorna el primer resultado encontrado
        }
        return null; // Retorna null si no encuentra datos
      })
      .catch(e => {
        console.error('Error obteniendo los datos de usuario', e);
        throw e;
      });
  }

  // Método para actualizar los datos de "Mis Datos"
  updateUserProfile(nombre: string, apellidos: string, edad: number, email: string): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [nombre, apellidos, edad, email];
    return this.dbInstance.executeSql(
      `UPDATE sesion_data SET nombre = ?, apellidos = ?, edad = ?, email = ? WHERE id = ?`,
      data
    ).then(() => {
      console.log('Datos de usuario actualizados correctamente');
    }).catch(e => {
      console.error('Error actualizando los datos de usuario', e);
      throw e;
    });
  }



}
