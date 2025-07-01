// Основной холст и контекст
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');
if (window.Telegram && Telegram.WebApp) {
  const tg = Telegram.WebApp;
  tg.expand(); // Развернуть на весь экран
  
  // Можно получать данные пользователя
  const user = tg.initDataUnsafe?.user;
  console.log("Игрок:", user?.first_name);
  
  // Кнопка "Закрыть"
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.onclick = () => tg.close();
  document.querySelector('.sidebar').appendChild(closeBtn);
}
// Масштабирование
ctx.scale(20, 20);
nextCtx.scale(20, 20);

// Игровые переменные
let score = 0;
let level = 1;
let gameOver = false;
let dropCounter = 0;
let dropInterval = 1000; // 1 секунда
let lastTime = 0;

// Фигуры Тетриса
const pieces = [
  { shape: [[1, 1, 1, 1]], color: '#00FFFF' }, // I
  { shape: [[1, 1], [1, 1]], color: '#FFFF00' }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#AA00FF' }, // T
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#FF0000' }, // Z
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#00FF00' }, // S
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000FF' }, // L
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#FF7F00' }  // J
];

// Игровое поле (10x20)
const arena = Array(20).fill().map(() => Array(10).fill(0));

// Текущая фигура
let player = {
  pos: { x: 5, y: 0 },
  piece: null,
  next: null
};

// Генерация случайной фигуры
function randomPiece() {
  return pieces[Math.floor(Math.random() * pieces.length)];
}

// Инициализация игры
function init() {
  player.piece = randomPiece();
  player.next = randomPiece();
  updateScore();
  drawNext();
}

// Отрисовка фигуры
function drawPiece(piece, offset = { x: 0, y: 0 }) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = piece.color;
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

// Отрисовка следующей фигуры
function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  drawPiece(player.next, { x: 1, y: 1 });
}

// Отрисовка игрового поля
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  arena.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = value;
        ctx.fillRect(x, y, 1, 1);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x, y, 1, 1);
      }
    });
  });
  drawPiece(player.piece, player.pos);
}

// Обновление счёта
function updateScore() {
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = level;
}

// Проверка столкновений
function collide() {
  const [m, o] = [player.piece.shape, player.pos];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

// Вращение фигуры
function rotate() {
  const piece = player.piece;
  const rotated = piece.shape[0].map((_, i) =>
    piece.shape.map(row => row[i]).reverse()
  );
  const oldShape = piece.shape;
  piece.shape = rotated;
  if (collide()) {
    piece.shape = oldShape;
  }
}

// Очистка линий
function arenaSweep() {
  let lines = 0;
  outer: for (let y = arena.length - 1; y >= 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
    lines++;
  }
  if (lines > 0) {
    score += lines * 100 * level;
    level = Math.floor(score / 1000) + 1;
    updateScore();
  }
}

// Обновление игрового состояния
function update(time = 0) {
  if (gameOver) return;
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval / level) {
    player.pos.y++;
    if (collide()) {
      player.pos.y--;
      merge();
      arenaSweep();
      player.piece = player.next;
      player.next = randomPiece();
      player.pos = { x: 5, y: 0 };
      drawNext();
      if (collide()) {
        gameOver = true;
        alert('Game Over!');
      }
    }
    dropCounter = 0;
  }
  draw();
  requestAnimationFrame(update);
}

// Объединение фигуры с полем
function merge() {
  player.piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        arena[y + player.pos.y][x + player.pos.x] = player.piece.color;
      }
    });
  });
}

// Управление
document.addEventListener('keydown', e => {
  if (gameOver) return;
  switch (e.key) {
    case 'ArrowLeft':
      player.pos.x--;
      if (collide()) player.pos.x++;
      break;
    case 'ArrowRight':
      player.pos.x++;
      if (collide()) player.pos.x--;
      break;
    case 'ArrowDown':
      player.pos.y++;
      if (collide()) player.pos.y--;
      break;
    case 'ArrowUp':
      rotate();
      break;
  }
});

// Кнопка старта
document.getElementById('start-btn').addEventListener('click', () => {
  if (gameOver) {
    arena.forEach(row => row.fill(0));
    score = 0;
    level = 1;
    gameOver = false;
    init();
    update();
  } else {
    update();
  }
});

// Инициализация
init();