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
  experienciasList = new BehaviorSubject<any[]>([]);

  constructor(private sqlite: SQLite, private platform: Platform, private storage: Storage) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'skeletonapp.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        this.dbInstance = db;
        this.createTables();
      });
      this.storage.create();
    });
  }

  // Crear tablas necesarias en la base de datos
  private createTables() {
    if (!this.dbInstance) {
      console.error("La base de datos no está inicializada.");
      return;
    }

    // Tabla para la sesión del usuario
    this.dbInstance.executeSql(`CREATE TABLE IF NOT EXISTS sesion_data (
      user_name TEXT PRIMARY KEY,
      password TEXT,
      active INTEGER
    );`, []).catch(e => console.error('Error creando tabla sesion_data', e));

    // Tabla para experiencia laboral
    this.dbInstance.executeSql(`CREATE TABLE IF NOT EXISTS experiencia_laboral (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa TEXT,
      ano_inicio INTEGER,
      cargo TEXT,
      ano_termino INTEGER,
      actual INTEGER
    );`, []).catch(e => console.error('Error creando tabla experiencia_laboral', e));

    // Tabla para certificaciones
    this.dbInstance.executeSql(`CREATE TABLE IF NOT EXISTS certificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      ano INTEGER
    );`, []).then(() => this.isDbReady.next(true)).catch(e => console.error('Error creando tabla certificaciones', e));
  }

  // CRUD para sesion_data
  addUser(user_name: string, password: string, active: number): Promise<void> {
    if (!this.dbInstance) {
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [user_name, password, active];
    return this.dbInstance.executeSql(`INSERT INTO sesion_data (user_name, password, active) VALUES (?, ?, ?)`, data)
      .catch(e => {
        console.error('Error al agregar usuario', e);
        throw e;
      });
  }

  getUser(user_name: string): Promise<any> {
    if (!this.dbInstance) {
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(`SELECT * FROM sesion_data WHERE user_name = ?`, [user_name])
      .then(res => {
        if (res.rows.length > 0) {
          return {
            user_name: res.rows.item(0).user_name,
            password: res.rows.item(0).password,
            active: res.rows.item(0).active
          };
        }
        return null;
      })
      .catch(e => {
        console.error('Error obteniendo usuario', e);
        throw e;
      });
  }

  updateUserStatus(user_name: string, active: number): Promise<void> {
    if (!this.dbInstance) {
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(`UPDATE sesion_data SET active = ? WHERE user_name = ?`, [active, user_name])
      .catch(e => {
        console.error('Error actualizando estado de usuario', e);
        throw e;
      });
  }

  deleteUser(user_name: string): Promise<void> {
    if (!this.dbInstance) {
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(`DELETE FROM sesion_data WHERE user_name = ?`, [user_name])
      .catch(e => {
        console.error('Error eliminando usuario', e);
        throw e;
      });
  }

  // CRUD para experiencia_laboral
  addExperiencia(empresa: string, ano_inicio: number, cargo: string, ano_termino: number | null, actual: number): Promise<void> {
    if (!this.dbInstance) {
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [empresa, ano_inicio, cargo, ano_termino, actual];
    return this.dbInstance.executeSql(`INSERT INTO experiencia_laboral (empresa, ano_inicio, cargo, ano_termino, actual) VALUES (?, ?, ?, ?, ?)`, data)
      .then(() => this.loadExperiencias())
      .catch(e => {
        console.error('Error agregando experiencia laboral', e);
        throw e;
      });
  }

  getAllExperiencia(): Promise<any[]> {
    if (!this.dbInstance) {
      return Promise.resolve([]);
    }
    return this.dbInstance.executeSql(`SELECT * FROM experiencia_laboral`, [])
      .then(res => {
        let items: any[] = [];
        for (let i = 0; i < res.rows.length; i++) {
          items.push(res.rows.item(i));
        }
        return items;
      })
      .catch(e => {
        console.error('Error obteniendo experiencias laborales', e);
        return [];
      });
  }

  updateExperiencia(id: number, empresa: string, ano_inicio: number, cargo: string, ano_termino: number | null, actual: number): Promise<void> {
    if (!this.dbInstance) {
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [empresa, ano_inicio, cargo, ano_termino, actual, id];
    return this.dbInstance.executeSql(`UPDATE experiencia_laboral SET empresa = ?, ano_inicio = ?, cargo = ?, ano_termino = ?, actual = ? WHERE id = ?`, data)
      .then(() => this.loadExperiencias())
      .catch(e => {
        console.error('Error actualizando experiencia laboral', e);
        throw e;
      });
  }

  deleteExperiencia(id: number): Promise<void> {
    if (!this.dbInstance) {
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(`DELETE FROM experiencia_laboral WHERE id = ?`, [id])
      .then(() => this.loadExperiencias())
      .catch(e => {
        console.error('Error eliminando experiencia laboral', e);
        throw e;
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

  // CRUD para certificaciones
  addCertificacion(nombre: string, ano: number): Promise<void> {
    if (!this.dbInstance) {
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [nombre, ano];
    return this.dbInstance.executeSql(`INSERT INTO certificaciones (nombre, ano) VALUES (?, ?)`, data)
      .catch(e => {
        console.error('Error al agregar certificación', e);
        throw e;
      });
  }

  getAllCertificaciones(): Promise<any[]> {
    if (!this.dbInstance) {
      return Promise.resolve([]);
    }
    return this.dbInstance.executeSql(`SELECT * FROM certificaciones`, [])
      .then(res => {
        let items: any[] = [];
        for (let i = 0; i < res.rows.length; i++) {
          items.push(res.rows.item(i));
        }
        return items;
      })
      .catch(e => {
        console.error('Error obteniendo certificaciones', e);
        return [];
      });
  }

  deleteCertificacion(id: number): Promise<void> {
    if (!this.dbInstance) {
      return Promise.reject("La base de datos no está inicializada.");
    }
    return this.dbInstance.executeSql(`DELETE FROM certificaciones WHERE id = ?`, [id])
      .catch(e => {
        console.error('Error eliminando certificación', e);
        throw e;
      });
  }

  // Funciones de sesión
  async setSession(user_name: string, password: string) {
    await this.storage.set('user_name', user_name);
    await this.storage.set('password', password);
    await this.storage.set('active', 1);
  }

  async clearSession() {
    await this.storage.clear();
  }

  async isUserLoggedIn() {
    return await this.storage.get('active') === 1;
  }

  // Método para actualizar el perfil de usuario
  updateUserProfile(user_name: string, nombre: string, apellidos: string, email: string, edad: number): Promise<void> {
    if (!this.dbInstance) {
      return Promise.reject("La base de datos no está inicializada.");
    }
    const data = [nombre, apellidos, email, edad, user_name];
    return this.dbInstance.executeSql(`UPDATE sesion_data SET nombre = ?, apellidos = ?, email = ?, edad = ? WHERE user_name = ?`, data)
      .catch(e => {
        console.error('Error actualizando perfil de usuario', e);
        throw e;
      });
  }


}
