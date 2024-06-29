var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Constants
var CANVAS_SIZE = 400;
var GRID_SIZE = 20;
var INITIAL_SNAKE_LENGTH = 5;
var FRAME_RATE = 6; // Slower frame rate
// Enum for direction
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
// Snake class
var Snake = /** @class */ (function () {
    function Snake() {
        this.body = [];
        this.direction = Direction.Right;
        this.changingDirection = false;
        this.initialize();
    }
    Snake.prototype.initialize = function () {
        for (var i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
            this.body.push({ x: i, y: 0 });
        }
    };
    Snake.prototype.move = function () {
        var head = __assign({}, this.body[this.body.length - 1]);
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
    };
    Snake.prototype.checkCollision = function (head) {
        if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE ||
            head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
            return true;
        }
        for (var _i = 0, _a = this.body.slice(0, -1); _i < _a.length; _i++) {
            var segment = _a[_i];
            if (segment.x === head.x && segment.y === head.y) {
                return true;
            }
        }
        return false;
    };
    Snake.prototype.changeDirection = function (newDirection) {
        if (this.changingDirection)
            return;
        if ((newDirection === Direction.Up && this.direction === Direction.Down) ||
            (newDirection === Direction.Down && this.direction === Direction.Up) ||
            (newDirection === Direction.Left && this.direction === Direction.Right) ||
            (newDirection === Direction.Right && this.direction === Direction.Left)) {
            return;
        }
        this.direction = newDirection;
        this.changingDirection = true; // Prevent multiple direction changes in a single move
    };
    Snake.prototype.draw = function (ctx) {
        ctx.fillStyle = '#32CD32'; // Snake color (green)
        ctx.strokeStyle = '#006400'; // Border color (darker green)
        ctx.lineWidth = 2; // Border width
        for (var _i = 0, _a = this.body; _i < _a.length; _i++) {
            var segment = _a[_i];
            ctx.beginPath();
            ctx.roundRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE, 5); // Rounded corners
            ctx.fill();
            ctx.stroke();
        }
    };
    return Snake;
}());
// Add a method to roundRect for rounded corners
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r)
        r = w / 2;
    if (h < 2 * r)
        r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
};
// Food class
var Food = /** @class */ (function () {
    function Food() {
        this.randomizePosition();
    }
    Food.prototype.randomizePosition = function () {
        this.x = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE));
        this.y = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE));
    };
    Food.prototype.draw = function (ctx) {
        ctx.fillStyle = '#e74c3c'; // Food color (red)
        ctx.beginPath();
        ctx.roundRect(this.x * GRID_SIZE, this.y * GRID_SIZE, GRID_SIZE, GRID_SIZE, 5); // Rounded corners
        ctx.fill();
    };
    return Food;
}());
// Game class
var Game = /** @class */ (function () {
    function Game() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.snake = new Snake();
        this.food = new Food();
        this.score = 0;
        this.setup();
    }
    Game.prototype.setup = function () {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.gameLoop();
    };
    Game.prototype.gameLoop = function () {
        var _this = this;
        this.gameLoopId = window.setInterval(function () {
            _this.snake.move();
            _this.checkCollisionWithFood();
            _this.clearCanvas();
            _this.food.draw(_this.ctx);
            _this.snake.draw(_this.ctx);
            _this.drawScore();
        }, 1000 / FRAME_RATE); // Slower frame rate
    };
    Game.prototype.clearCanvas = function () {
        this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    };
    Game.prototype.checkCollisionWithFood = function () {
        var head = this.snake.body[this.snake.body.length - 1];
        if (head.x === this.food.x && head.y === this.food.y) {
            this.snake.body.unshift(__assign({}, head));
            this.food.randomizePosition();
            this.score++;
        }
    };
    Game.prototype.drawScore = function () {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Score: ' + this.score, 10, 20);
    };
    Game.prototype.handleKeyPress = function (event) {
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
    };
    return Game;
}());
// Start the game when the page loads
var gameInstance;
window.onload = function () {
    gameInstance = new Game();
};
