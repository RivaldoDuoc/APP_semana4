import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class DBTaskService {
  // Instancia de la base de datos SQLite
  private dbInstance: SQLiteObject | undefined;

  // Estado de la base de datos para indicar si está lista para su uso
  private isDbReady = new BehaviorSubject<boolean>(false);

  // Listas reactivas para usuarios, experiencias y certificaciones
  usersList = new BehaviorSubject<any[]>([]);
  experienciasList = new BehaviorSubject<any[]>([]);
  certificacionesList = new BehaviorSubject<any[]>([]);

  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private storage: Storage
  ) {
    // Espera a que la plataforma esté lista antes de inicializar SQLite y el almacenamiento
    this.platform.ready().then(() => {
      // Inicializa la base de datos SQLite
      this.sqlite.create({
        name: 'skeletonapp.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        this.dbInstance = db;
        this.createTables(); // Llama a createTables para crear las tablas necesarias
      });
      
      // Inicializa el almacenamiento para gestionar la sesión del usuario
      this.storage.create();
    });
  }

  // Crea las tablas necesarias en la base de datos
  private createTables() {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return;
    }

    // Crea la tabla para usuarios con campos como username, password, nombre, etc.
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
      .then(() => this.isDbReady.next(true)) // Marca la base de datos como lista
      .catch(e => console.error('Error creando tabla sesion_data', e));

    // Crea la tabla para experiencia laboral
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

    // Crea la tabla para certificaciones
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

  // Agrega un usuario nuevo a la base de datos
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
      this.loadUsers(); // Recarga la lista de usuarios después de agregar uno nuevo
      console.log('Usuario creado correctamente:', data);
    }).catch(e => {
      console.error('Error al agregar usuario', e);
      throw e;
    });
  }

  // Obtiene todos los usuarios de la base de datos
  getAllUsers(): Promise<any[]> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.resolve([]);
    }
    return this.dbInstance.executeSql(`SELECT * FROM sesion_data`, []).then(res => {
      let users: any[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        users.push(res.rows.item(i)); // Guarda cada usuario en el array
      }
      return users;
    }).catch(e => {
      console.error('Error obteniendo usuarios', e);
      return [];
    });
  }

  // Actualiza un usuario específico en la base de datos
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
      this.loadUsers(); // Recarga la lista de usuarios después de la actualización
    }).catch(e => {
      console.error('Error actualizando usuario', e);
      throw e;
    });
  }

  // Elimina un usuario específico de la base de datos
  deleteUser(id: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(
      `DELETE FROM sesion_data WHERE id = ?`,
      [id]
    ).then(() => {
      this.loadUsers(); // Recarga la lista de usuarios después de eliminar uno
    }).catch(e => {
      console.error('Error eliminando usuario', e);
      throw e;
    });
  }

  // Recarga y emite la lista de usuarios actuales
  private loadUsers() {
    this.getAllUsers().then(users => {
      this.usersList.next(users); // Emite la nueva lista a los suscriptores
    });
  }

  // Permite suscribirse a la lista de usuarios actualizada
  getUsers(): Observable<any[]> {
    return this.usersList.asObservable();
  }

  // CRUD para Experiencia Laboral

  // Agrega una nueva experiencia laboral
  addExperiencia(empresa: string, ano_inicio: number, cargo: string, ano_termino: number | null, actual: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [empresa, ano_inicio, cargo, ano_termino, actual];
    return this.dbInstance.executeSql(
      `INSERT INTO experiencia_laboral (empresa, ano_inicio, cargo, ano_termino, actual) VALUES (?, ?, ?, ?, ?)`,
      data
    ).then(() => this.loadExperiencias()) // Recarga la lista después de agregar una experiencia
      .catch(e => {
        console.error('Error agregando experiencia laboral', e);
        throw e;
      });
  }

  // Obtiene todas las experiencias laborales
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

  // Recarga y emite la lista de experiencias laborales
  private loadExperiencias() {
    this.getAllExperiencia().then(items => {
      this.experienciasList.next(items);
    });
  }

  getExperiencias(): Observable<any[]> {
    return this.experienciasList.asObservable();
  }

  // CRUD para Certificaciones

  // Agrega una nueva certificación
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

  // Obtiene todas las certificaciones
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

  // Recarga y emite la lista de certificaciones
  private loadCertificaciones() {
    this.getAllCertificaciones().then(items => {
      this.certificacionesList.next(items);
    });
  }

  getCertificaciones(): Observable<any[]> {
    return this.certificacionesList.asObservable();
  }

  // Funciones de sesión

  // Guarda la sesión del usuario en el almacenamiento local
  async setSession(username: string, password: string) {
    await this.storage.set('username', username);
    await this.storage.set('password', password);
    await this.storage.set('active', 1);
  }

  // Limpia los datos de la sesión del usuario
  async clearSession() {
    await this.storage.clear();
  }

  // Verifica si el usuario tiene una sesión activa
  async isUserLoggedIn(): Promise<boolean> {
    return (await this.storage.get('active')) === 1;
  }

  // Obtiene un usuario específico por su nombre de usuario
  getUser(username: string): Promise<any> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(`SELECT * FROM sesion_data WHERE username = ?`, [username])
      .then(res => {
        if (res.rows.length > 0) {
          return res.rows.item(0);
        }
        return null;
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

  // Guarda los datos de "Mis Datos" en la base de datos
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

  // Obtiene los datos de "Mis Datos" desde la base de datos
  getUserProfile(): Promise<any> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(`SELECT nombre, apellidos, edad, email FROM sesion_data LIMIT 1`, [])
      .then(res => {
        if (res.rows.length > 0) {
          return res.rows.item(0);
        }
        return null;
      })
      .catch(e => {
        console.error('Error obteniendo los datos de usuario', e);
        throw e;
      });
  }

  // Actualiza los datos de "Mis Datos" en la base de datos
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

  // Actualiza una experiencia laboral específica por ID
  updateExperiencia(id: number, empresa: string, ano_inicio: number, cargo: string, ano_termino: number | null, actual: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [empresa, ano_inicio, cargo, ano_termino, actual, id];
    return this.dbInstance.executeSql(
      `UPDATE experiencia_laboral SET empresa = ?, ano_inicio = ?, cargo = ?, ano_termino = ?, actual = ? WHERE id = ?`,
      data
    ).then(() => {
      this.loadExperiencias();
    }).catch(e => {
      console.error('Error actualizando experiencia laboral', e);
      throw e;
    });
  }

  // Actualiza una certificación específica por ID
  updateCertificacion(id: number, nombre: string, ano: number): Promise<void> {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [nombre, ano, id];
    return this.dbInstance.executeSql(
      `UPDATE certificaciones SET nombre = ?, ano = ? WHERE id = ?`,
      data
    ).then(() => {
      this.loadCertificaciones();
    }).catch(e => {
      console.error('Error actualizando certificación', e);
      throw e;
    });
  }
}
