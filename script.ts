// Constants
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 5;
const FRAME_RATE = 6; // Slower frame rate

// Enum for direction
enum Direction {
  Up,
  Down,
  Left,
  Right
}

// Snake class
class Snake {
  body: { x: number; y: number }[];
  direction: Direction;
  changingDirection: boolean;

  constructor() {
    this.body = [];
    this.direction = Direction.Right;
    this.changingDirection = false;
    this.initialize();
  }

  initialize() {
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      this.body.push({ x: i, y: 0 });
    }
  }

  move() {
    const head = { ...this.body[this.body.length - 1] };
    switch (this.direction) {
      case Direction.Up:
        head.y -= 1;
        break;
      case Direction.Down:
        head.y += 1;
        break;
      case Direction.Left:
        head.x -= 1;
        break;
      case Direction.Right:
        head.x += 1;
        break;
    }

    if (this.checkCollision(head)) {
      if (gameInstance) {
        clearInterval(gameInstance.gameLoopId);
      }
      alert('Game Over! Score: ' + (this.body.length - INITIAL_SNAKE_LENGTH));
      return;
    }

    this.body.push(head);
    if (this.body.length > INITIAL_SNAKE_LENGTH) {
      this.body.shift();
    }
    this.changingDirection = false; // Allow direction change after moving
  }

  checkCollision(head: { x: number; y: number }) {
    if (
      head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE ||
      head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE
    ) {
      return true;
    }

    for (let segment of this.body.slice(0, -1)) {
      if (segment.x === head.x && segment.y === head.y) {
        return true;
      }
    }

    return false;
  }

  changeDirection(newDirection: Direction) {
    if (this.changingDirection) return;

    if (
      (newDirection === Direction.Up && this.direction === Direction.Down) ||
      (newDirection === Direction.Down && this.direction === Direction.Up) ||
      (newDirection === Direction.Left && this.direction === Direction.Right) ||
      (newDirection === Direction.Right && this.direction === Direction.Left)
    ) {
      return;
    }

    this.direction = newDirection;
    this.changingDirection = true; // Prevent multiple direction changes in a single move
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#32CD32'; // Snake color (green)
    ctx.strokeStyle = '#006400'; // Border color (darker green)
    ctx.lineWidth = 2; // Border width
    for (let segment of this.body) {
      ctx.beginPath();
      ctx.roundRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE, 5); // Rounded corners
      ctx.fill();
      ctx.stroke();
    }
  }
}

// Add a method to roundRect for rounded corners
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
}

// Food class
class Food {
  x: number;
  y: number;

  constructor() {
    this.randomizePosition();
  }

  randomizePosition() {
    this.x = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE));
    this.y = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#e74c3c'; // Food color (red)
    ctx.beginPath();
    ctx.roundRect(this.x * GRID_SIZE, this.y * GRID_SIZE, GRID_SIZE, GRID_SIZE, 5); // Rounded corners
    ctx.fill();
  }
}

// Game class
class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  snake: Snake;
  food: Food;
  score: number;
  gameLoopId: number | undefined;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.snake = new Snake();
    this.food = new Food();
    this.score = 0;
    this.setup();
  }

  setup() {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    this.gameLoop();
  }

  gameLoop() {
    this.gameLoopId = window.setInterval(() => {
      this.snake.move();
      this.checkCollisionWithFood();
      this.clearCanvas();
      this.food.draw(this.ctx);
      this.snake.draw(this.ctx);
      this.drawScore();
    }, 1000 / FRAME_RATE); // Slower frame rate
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  checkCollisionWithFood() {
    const head = this.snake.body[this.snake.body.length - 1];
    if (head.x === this.food.x && head.y === this.food.y) {
      this.snake.body.unshift({ ...head });
      this.food.randomizePosition();
      this.score++;
    }
  }

  drawScore() {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Score: ' + this.score, 10, 20);
  }

  handleKeyPress(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.snake.changeDirection(Direction.Up);
        break;
      case 'ArrowDown':
        this.snake.changeDirection(Direction.Down);
        break;
      case 'ArrowLeft':
        this.snake.changeDirection(Direction.Left);
        break;
      case 'ArrowRight':
        this.snake.changeDirection(Direction.Right);
        break;
    }
  }
}

// Start the game when the page loads
let gameInstance: Game | undefined;

window.onload = () => {
  gameInstance = new Game();
};
