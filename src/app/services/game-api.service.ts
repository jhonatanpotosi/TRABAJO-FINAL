import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

const API = 'https://apigame.gonzaloandreslucio.com/api';
const G5_JUEGO_ID = '4dfa397b-2ee1-49b1-b91d-58e1bf2da8c5';

@Injectable({ providedIn: 'root' })
export class GameApiService {
  constructor(private http: HttpClient) {}

  // ========================
  // Usuarios
  // ========================
  crearUsuario(data: any): Observable<any> {
    if (!data.password || data.password.length < 8) {
      return throwError(() => new Error('La contraseña debe tener al menos 8 caracteres.'));
    }

    // Aseguramos que siempre se use el juego G5
    const usuario = {
      ...data,
      juego_id: G5_JUEGO_ID,
      password_confirmation: data.password
    };

    return this.http.post(`${API}/users`, usuario);
  }

  obtenerUsuarios(): Observable<any> {
    return this.http.get(`${API}/users`);
  }

  actualizarUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${API}/users/${id}`, {
      ...data,
      juego_id: G5_JUEGO_ID
    });
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${API}/users/${id}`);
  }

  obtenerUsuarioPorId(id: number): Observable<any> {
    return this.http.get(`${API}/users/${id}`);
  }

  // ========================
  // Juegos
  // ========================
  obtenerJuegos(): Observable<any> {
    return this.http.get(`${API}/juegos`);
  }

  crearJuego(data: any): Observable<any> {
    return this.http.post(`${API}/juegos`, data);
  }

  obtenerJuegoPorId(id: number): Observable<any> {
    return this.http.get(`${API}/juegos/${id}`);
  }

  // ========================
  // Partidas
  // ========================
  crearPartida(data: any): Observable<any> {
    const partida = {
      ...data,
      juego_id: G5_JUEGO_ID
    };
    return this.http.post(`${API}/partidas`, partida);
  }

  obtenerPartidas(): Observable<any> {
    return this.http.get(`${API}/partidas`);
  }

  obtenerPartidaPorId(id: number): Observable<any> {
    return this.http.get(`${API}/partidas/${id}`);
  }

  actualizarPartida(id: number, data: any): Observable<any> {
    const partida = {
      ...data,
      juego_id: G5_JUEGO_ID
    };
    return this.http.put(`${API}/partidas/${id}`, partida);
  }

  eliminarPartida(id: number): Observable<any> {
    return this.http.delete(`${API}/partidas/${id}`);
  }

  // ========================
  // Aciertos
  // ========================
  registrarAcierto(data: any): Observable<any> {
    return this.http.post(`${API}/aciertos`, data);
  }

  obtenerAciertos(): Observable<any> {
    return this.http.get(`${API}/aciertos`);
  }

  obtenerAciertoPorId(id: number): Observable<any> {
    return this.http.get(`${API}/aciertos/${id}`);
  }

  obtenerAciertosPorUsuario(userId: number): Observable<any> {
    return this.http.get(`${API}/aciertos/usuario/${userId}`);
  }

  obtenerAciertosPorPartida(partidaId: number): Observable<any> {
    return this.http.get(`${API}/aciertos/partida/${partidaId}`);
  }

  obtenerAciertoUsuarioPartida(userId: number, partidaId: number): Observable<any> {
    return this.http.get(`${API}/aciertos/usuario/${userId}/partida/${partidaId}`);
  }

  actualizarAcierto(id: number, data: any): Observable<any> {
    return this.http.put(`${API}/aciertos/${id}`, data);
  }

  eliminarAcierto(id: number): Observable<any> {
    return this.http.delete(`${API}/aciertos/${id}`);
  }
}
