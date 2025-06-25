import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LevelSelectorComponent } from './level-selector/level-selector.component';
import { GameBoardComponent } from './game-board/game-board.component';
import { GameApiService } from './services/game-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LevelSelectorComponent,
    GameBoardComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  started = false;
  nameEntered = false;
  levelSelected = false;
  showGameBoard = false;

  title = 'Juego de Memoria';

  // Datos del jugador
  playerName: string = '';
  userIdSeleccionado: number | null = null;

  // Datos del juego
  selectedLevel: string = '';
  partidaId: number | null = null;

  // Formulario de registro
  nuevoNombreJugador: string = '';
  nuevoPassword: string = '';

  jugadoresDisponibles: any[] = [];

  constructor(private api: GameApiService) {}

  ngOnInit(): void {
    this.cargarJugadores();
  }

  startGame() {
    this.started = true;
  }

  onNameInput(name: string) {
    this.nameEntered = name.trim().length >= 3;

    const jugador = this.jugadoresDisponibles.find(j => j.name === name);
    this.userIdSeleccionado = jugador?.id ?? null;
  }

  onLevelChosen(level: string) {
    this.selectedLevel = level;
    this.levelSelected = true;

    if (!this.userIdSeleccionado) {
      alert('Debe seleccionar un jugador válido.');
      return;
    }

    const partidaData = {
      juego_id: '4dfa397b-2ee1-49b1-b91d-58e1bf2da8c5',
      fecha: new Date().toISOString().split('T')[0],
      tiempo: 0,
      nivel: level
    };

    this.api.crearPartida(partidaData).subscribe({
      next: (res) => {
        this.partidaId = res.id;

        // Mostrar el tablero después de crear partida
        this.showGameBoard = false;
        setTimeout(() => {
          this.showGameBoard = true;
        }, 0);
      },
      error: (err) => {
        console.error('Error al crear partida', err);
        alert('Hubo un problema al crear la partida. Inténtalo de nuevo.');
      }
    });
  }

  resetToMenu() {
    this.started = false;
    this.nameEntered = false;
    this.levelSelected = false;
    this.showGameBoard = false;
    this.playerName = '';
    this.selectedLevel = '';
    this.userIdSeleccionado = null;
    this.partidaId = null;
  }

  cargarJugadores() {
    this.api.obtenerUsuarios().subscribe({
      next: (data) => {
        this.jugadoresDisponibles = data;
      },
      error: () => {
        alert('Error al cargar los jugadores disponibles');
      }
    });
  }

  registrarNuevoJugador() {
    const name = this.nuevoNombreJugador.trim();
    const password = this.nuevoPassword;

    if (name.length < 3) {
      alert('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    const yaExiste = this.jugadoresDisponibles.some(
      jugador => jugador.name.toLowerCase() === name.toLowerCase()
    );

    if (yaExiste) {
      alert('Este jugador ya está registrado.');
      return;
    }

    const safeName = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const randomSuffix = Math.floor(Math.random() * 10000);
    const email = `${safeName}${randomSuffix}@game.com`;

    const nuevoUsuario = {
      name,
      email,
      password,
      password_confirmation: password,
      juego_id: '4dfa397b-2ee1-49b1-b91d-58e1bf2da8c5'
    };

    this.api.crearUsuario(nuevoUsuario).subscribe({
      next: (res) => {
        this.playerName = name;
        this.userIdSeleccionado = res.id;
        this.nameEntered = true;
        this.cargarJugadores();
        this.nuevoNombreJugador = '';
        this.nuevoPassword = '';
        alert('Jugador registrado correctamente.');
      },
      error: (err) => {
        console.error('Error API:', err);
        alert('Error al registrar el jugador. Verifica que no exista ya el usuario.');
      }
    });
  }
}
