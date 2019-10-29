// Enemies our player must avoid
var Enemy = function (x, y, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = x;
    this.y = y; 
    this.width = 98;
    this.height = 67;
    this.speed = speed;
    this.direction = true;
    this.move = function(dt){
        if (this.direction) {
            this.x += speed * dt;
            if (this.x >= 550) {
                this.y += 80; 
                this.sprite = 'images/enemy-bug-flip.png';
                this.direction = false;
            }
        } else {
            this.x -= speed * dt;
            if (this.x <= -150) {
                this.y -= 80; 
                this.sprite = 'images/enemy-bug.png';
                this.direction = true;
            }
        }
    }
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};
// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) { // For moves the character in x y by (dt Unit) or maybe not :)
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.move(dt);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    /* ctx.fillStyle = 'green';
    ctx.fillRect(this.x, this.y, 98, 67); */
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function (x, y, width, height) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = x;
    this.y = y;
    this.speed = 20;
    this.width = width;
    this.height = height;
    this.name = "Player";
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/char-boy.png';
    this.character = 'images/char-boy.png';
    this.changeCharacter = function(){
        const arrOfChar = ['images/char-boy.png', 'images/char-pink-girl.png', 'images/char-cat-girl.png', 'images/char-horn-girl.png'];
        const i = Math.floor(Math.random() * 3); 
        this.sprite = arrOfChar[i];
        this.character = arrOfChar[i];
    }
    this.die = function (bool){
        if (bool){
            this.sprite = 'images/dead.png'; 
        }else {
            this.sprite = this.character;
        }
    }
};
Player.prototype.update = function (dt){

}
Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height); 
    /* ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, 67, 76); */
}
Player.prototype.handleInput = function(keyPressed){
    switch (keyPressed){
        case "left":
            if (this.x > 0) {
                this.x -= this.speed;
            } 
            break;
        case "up":
            if (this.y > 60) {
                this.y -= this.speed;
            } 
            break;
        case "right":
            if (this.x < 438) {
                this.x += this.speed;
            } 
            break;
        case "down":
            if (this.y < 500) {
                this.y += this.speed;
            } 
            break;
    }
}
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

// rows = 120 - 220 - ( 505, 220)
const allEnemies = [new Enemy(0, 140, 60), new Enemy(-100, 220, 65), new Enemy(550, 220, 200), 
    new Enemy(-100, 220, 150), new Enemy(100, 220, 40), new Enemy(0, 140, 150), new Enemy(0, 140, 250)];
player = new Player(220, 450, 67, 88);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// Touch Events for mobiles screen
document.querySelector('#leftArrow').addEventListener('click', function () {
    player.handleInput("left");
});
document.querySelector('#upArrow').addEventListener('click', function(){
    player.handleInput("up");
});
document.querySelector('#rightArrow').addEventListener('click', function () {
    player.handleInput("right");
});
document.querySelector('#downArrow').addEventListener('click', function () {
    player.handleInput("down");
});

const playerInfoBar = {
    dead: 0,
    win: 0,
    timer: "1:30"
}