import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameApiService } from '../services/game-api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit, OnChanges {
  @Input() level: string = '';
  @Input() playerName: string = '';

  userId!: number;
  partidaId!: number;

  roundsWon = 0;
  boardSize = 0;

  juegoRealizado = false;
  mostrarOpciones = true;
  mostrarModalConfiguracion = false;

  cards: number[] = [];
  revealedCards: boolean[] = [];
  sequence: number[] = [];
  userSequence: number[] = [];
  numberKeys: number[] = Array.from({ length: 10 }, (_, i) => i);

  currentStep = 0;
  hasFailed = false;
  hasWon = false;
  rondaCompletada: boolean = false;
  partidaGuardada: boolean = false;

  scoreList: { rank: number; name: string; partidas: number; aciertos: number }[] = [];

  private readonly juegoId = '47a76327-cc0d-484a-a05d-54947f2c999d';

  constructor(private api: GameApiService) {}

  ngOnInit(): void {
    this.registrarUsuario();
    this.obtenerRanking();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['level'] && this.level) {
      this.initializeGame();
    }
  }

  registrarUsuario() {
    if (!this.playerName || this.playerName.length < 3) return;

    const email = `${this.playerName.toLowerCase()}${Math.floor(Math.random() * 10000)}@game.com`;
    const usuario = {
      name: this.playerName,
      email,
      password: '12345678',
      password_confirmation: '12345678',
      juego_id: this.juegoId
    };

    this.api.crearUsuario(usuario).subscribe({
      next: res => {
        this.userId = res.id;
        this.obtenerRanking();
      },
      error: err => {
        if (err.status === 422) {
          this.api.obtenerUsuarios().subscribe(data => {
            const user = data.find((u: any) => u.name === this.playerName);
            if (user) {
              this.userId = user.id;
              this.obtenerRanking();
            }
          });
        } else {
          alert('Error al crear usuario: ' + (err.error?.message || 'desconocido'));
        }
      }
    });
  }

  obtenerRanking() {
    this.api.obtenerAciertos().subscribe((aciertos: any[]) => {
      const aciertosPorUsuario: Record<number, number> = {};
      const partidasPorUsuario: Record<number, number> = {};

      aciertos.forEach((a: any) => {
        aciertosPorUsuario[a.user_id] = (aciertosPorUsuario[a.user_id] || 0) + a.aciertos;
        partidasPorUsuario[a.user_id] = (partidasPorUsuario[a.user_id] || 0) + 1;
      });

      this.api.obtenerUsuarios().subscribe((users: any[]) => {
        this.scoreList = users.map((user: any): { name: string; aciertos: number; partidas: number; rank: number } => {
          const aciertos = aciertosPorUsuario[user.id] || 0;
          const partidas = partidasPorUsuario[user.id] || 0;
          return {
            name: user.name,
            aciertos,
            partidas,
            rank: 0
          };
        })
        .sort((a: { aciertos: number; partidas: number }, b: { aciertos: number; partidas: number }) =>
          (b.aciertos / (b.partidas || 1)) - (a.aciertos / (a.partidas || 1))
        )
        .map((user: { name: string; aciertos: number; partidas: number; rank: number }, i: number) => ({ ...user, rank: i + 1 }));
      });
    });
  }

  get scoreListSorted() {
    return this.scoreList;
  }

  initializeGame() {
    this.setBoardSize();
    this.cards = [];
    this.sequence = [];
    this.userSequence = [];
    this.revealedCards = [];
    this.roundsWon = 0;
    this.juegoRealizado = false;
    this.hasFailed = false;
    this.hasWon = false;
    this.rondaCompletada = false;
    this.partidaGuardada = false;
    this.mostrarOpciones = true;

    const partida = {
      juego_id: this.juegoId,
      fecha: new Date().toISOString().split('T')[0],
      tiempo: 0,
      nivel: this.level
    };

    this.api.crearPartida(partida).subscribe(res => {
      this.partidaId = res.id;
      this.startNewRound();
    });
  }

  setBoardSize() {
    const sizeMap: Record<string, number> = {
      facil: 4,
      medio: 9,
      dificil: 25
    };
    this.boardSize = sizeMap[this.level] || 4;
  }

  generateNewCards() {
    this.cards = Array.from({ length: this.boardSize }, () => Math.floor(Math.random() * 10));
    this.revealedCards = Array(this.boardSize).fill(false);
  }

  startNewRound() {
    this.hasFailed = false;
    this.hasWon = false;
    this.rondaCompletada = false;
    this.partidaGuardada = false;
    this.userSequence = [];
    this.sequence = [];
    this.currentStep = 0;

    this.generateNewCards();
    this.sequence.push(...this.cards);
    this.revealNext();
    this.juegoRealizado = true;
  }

  revealNext() {
    if (this.currentStep < this.sequence.length) {
      const idx = this.cards.findIndex((card: number, index: number) => card === this.sequence[this.currentStep] && !this.revealedCards[index]);
      if (idx !== -1) {
        this.revealedCards[idx] = true;
        setTimeout(() => {
          this.revealedCards[idx] = false;
        }, this.level === 'facil' ? 1000 : this.level === 'medio' ? 1500 : 2000);
      }
    }
  }

  onUserSelect(num: number) {
    if (this.hasFailed || this.hasWon || this.rondaCompletada) return;

    if (num === this.sequence[this.currentStep]) {
      this.currentStep++;
      if (this.currentStep === this.sequence.length) {
        this.hasWon = true;
        this.rondaCompletada = true;
        this.roundsWon++;
      } else {
        this.revealNext();
      }
    } else {
      this.hasFailed = true;
      this.rondaCompletada = true;
    }
  }

  registrarAcierto() {
    if (!this.userId || !this.partidaId) return;

    this.api.registrarAcierto({
      partida_id: this.partidaId,
      user_id: this.userId,
      aciertos: this.roundsWon,
      tiempo: 0
    }).subscribe({
      next: () => this.obtenerRanking(),
      error: () => alert('❌ Error al registrar acierto.')
    });
  }

  guardarPartida() {
    if (!this.juegoRealizado || this.roundsWon === 0) {
      alert('Debes completar al menos una ronda antes de guardar.');
      return;
    }

    this.registrarAcierto();
    setTimeout(() => {
      this.partidaGuardada = true;
      this.mostrarOpciones = false;
      this.obtenerRanking();
      alert('✅ Partida guardada y ranking actualizado.');
    }, 500);
  }

  siguienteRonda() {
    if (this.hasWon) {
      this.registrarAcierto();
      this.startNewRound();
    }
  }

  retry() {
    this.initializeGame();
  }

  returnToMenu() {
    window.location.href = '/';
  }

  getSqrt(n: number): number {
    return Math.sqrt(n);
  }

  abrirConfiguracionGeneral() {
    this.mostrarModalConfiguracion = true;
  }

  cerrarConfiguracionGeneral() {
    this.mostrarModalConfiguracion = false;
  }

  editarJugador(jugador: { name: string }) {
    const nuevoNombre = prompt('Nuevo nombre del jugador:', jugador.name);
    if (!nuevoNombre || nuevoNombre === jugador.name) return;

    this.api.obtenerUsuarios().subscribe((users: any[]) => {
      const user = users.find((u: any) => u.name === jugador.name);
      if (user) {
        this.api.actualizarUsuario(user.id, {
          name: nuevoNombre,
          email: user.email,
          password: '12345678',
          juego_id: user.juego_id
        }).subscribe(() => {
          alert('Jugador actualizado');
          this.obtenerRanking();
        });
      }
    });
  }

  eliminarJugador(jugador: { name: string }) {
    const confirmarEliminar = confirm(`¿Eliminar definitivamente a "${jugador.name}"?`);
    if (!confirmarEliminar) return;

    this.api.obtenerUsuarios().subscribe((users: any[]) => {
      const user = users.find((u: any) => u.name === jugador.name);
      if (user) {
        this.api.eliminarUsuario(user.id).subscribe(() => {
          alert('Jugador eliminado');
          this.obtenerRanking();
        });
      }
    });
  }
}