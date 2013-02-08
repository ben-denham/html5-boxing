function Attack(attacker) {
    this.height = 0.5; //Percentage of current height
    this.animationLength = 10;
    this.damage = 10;
    this.distance = 70;
    this.cooldown = 20;
    this.attacking = -this.cooldown;
    this.attack = function(attacker) {
	this.attacking = this.animationLength;
	for (var i=0; i < players.length; i++) {
	    target = players[i];
	    if (target != attacker) {
		var attackY = attacker.y + (attacker.height - (this.height*attacker.height));
		if (
		    ((attacker.direction == 'right' && attacker.x+attacker.width+this.distance >= target.x) || (attacker.direction == 'left' && (attacker.x-this.distance <= target.x+target.width))) //X Correct
		&&
			(attackY >= target.y && attackY <= target.y+target.height) //Y Correct
		)
		{
		    target.bounce();
		    target.health -= this.damage;
		    target.hit_sound.play();
		}
	    }
	}
    }
}

function Character() {
    this.name = 'Player';
    this.startX = 150;
    this.x = this.startX;
    this.y = gameCanvas.height-floor;
    this.direction = 'right';
    this.healthBarX = 50;
    this.maxHealth = 100;
    this.health = 100;
    this.maxHeight = 250;
    this.crouchHeight = 190;
    this.height = 250;
    this.width = 120;
    this.speed = 1500;
    this.jump_speed = 3000;
    this.image = new Image();
    this.hit_sound = new Audio("assets/sound/hit.wav");
    this.keys = {
	left: 37, //arrow keys
	right: 39,
	jump: 38,
	crouch: 40,
	punch: 57, //9
	kick: 48 //0
    };
    this.draw = function(canvas) {

	var x = this.x;
	var dx;
	var dy;
	var width = this.width;

	if ((keyIsPressed(this.keys.left) && !keyIsPressed(this.keys.right)) || (!keyIsPressed(this.keys.left) && keyIsPressed(this.keys.right))) {
	    //Calculate Walking stage
	    if (this.walking <= -this.walkingAnimation) {
		this.walking = this.walkingAnimation;
	    } else {
		this.walking--;
	    }
	} else {
	    this.walking = -this.walkingAnimation;
	}

	//Calculate Y on sprite sheet
	if (this.jumping || !(gameCanvas.height-this.y-this.height <= floor)) {
	    dy = this.maxHeight;
	} else if (this.crouched) {
	    dy = 2*this.maxHeight;
	} else {
	    dy = 0;
	}

	//Calculate X on sprite sheet
	if (this.punch.attacking > 0) {
	    dx = this.width;
	    width = this.width+this.punch.distance;
	    if (this.direction == 'left') {
		x -= this.punch.distance
	    }
	} else if (this.kick.attacking > 0) {
	    dx = 2*this.width+this.punch.distance;
	    width = this.width+this.kick.distance;
	    if (this.direction == 'left') {
		x -= this.kick.distance
	    }
	} else if (this.walking > 0 && !this.jumping && (gameCanvas.height-this.y-this.height <= floor)) {
	    dx = 3*this.width+this.punch.distance+this.kick.distance;
	} else {
	    dx = 0;
	}

	canvas.drawImage(this.image, dx, dy, width, this.height, x, this.y, width, this.height);

    }
    this.drawHealth = function(canvas) {
	var direction = (this.direction == 'left')? -1 : 1;
	canvas.fillStyle = "#111111";
	canvas.fillRect(this.healthBarX-(10*direction), 5, 320*direction, 75);
	canvas.font = " italic 30px Arial Black";
	canvas.fillStyle = "#FFFFFF";
	canvas.textAlign = (this.direction == 'left')? 'right' : 'left';
	canvas.fillText(this.name, this.healthBarX, 70);
	canvas.fillStyle = "#FF0000";
	canvas.fillRect(this.healthBarX, 15, 300*direction, 25);
	canvas.fillStyle = "#00FF00";
	canvas.fillRect(this.healthBarX, 15, ((this.health / this.maxHealth) * 100)*3*direction, 25);
    }
    this.walkingAnimation = 20;
    this.walking = -this.walkingAnimation;
    this.bounceDistance = 20;
    this.bounce = function() {
	var direction = (this.direction == 'left')? 1 : -1;
	this.x = this.x + this.bounceDistance*direction
    }
    this.crouched = false;
    this.crouch = function() {
	this.crouched = true;
	this.height = this.crouchHeight;
	this.y = (gameCanvas.height-floor-this.height);
    }
    this.uncrouch = function() {
	this.crouched = false;
	this.height = this.maxHeight
	this.y = (gameCanvas.height-floor-this.height);
    }
    this.jumpHeight = 100;
    this.jumping = false;
    this.punch = new Attack(this);
    this.punch.height = 0.8;
    this.kick = new Attack(this);
    this.kick.height = 0.2;
    this.getInput = function() {
	//Get input
	if (keyIsPressed(this.keys.left)) { //LEFT
	    this.x -= this.speed/1000;
	} else {
	    this.x_velocity
	}
	if (keyIsPressed(this.keys.jump)) { //JUMP
	    if (gameCanvas.height-this.y-this.height <= floor && !this.crouched) {
		    this.jumping = true;
	    }
	}
	if (keyIsPressed(this.keys.right)) { //RIGHT
	    this.x += this.speed/1000;
	}
	if (keyIsPressed(this.keys.crouch)) { //CROUCH
	    if (!this.crouched && (gameCanvas.height-this.y-this.height <= floor)) {
		this.crouch();
	    }
	} else if (this.crouched) {
	    this.uncrouch();
	}
	if (keyIsPressed(this.keys.punch)) { //PUNCH
	    if ((this.kick.attacking <= -this.kick.cooldown) && (this.punch.attacking <= -this.punch.cooldown)) {
		this.punch.attack(this);
	    }
	}
	if (keyIsPressed(this.keys.kick)) { //KICK
	    if ((this.kick.attacking <= -this.kick.cooldown) && (this.punch.attacking <= -this.punch.cooldown)) {
		this.kick.attack(this);
	    }
	}
	//Detect Collisions
	detectCollisions(this);
    }
    this.update = function() {
	//Check to see if player is jumping
	if (this.jumping) {
	    if (!(this.y+this.height <= (gameCanvas.height-floor)-this.jumpHeight)) {
		//Move up
		this.y -= this.jump_speed/1000;
	    } else {
		//Max height reached, stop jumping
		this.jumping = false;
	    }
	} else if (!(gameCanvas.height-this.y-this.height <= floor)) {
	    //Falling, so apply gravity
	    this.y += this.jump_speed/1000
	}
	//If health is below 0, make it 0
	if (this.health <0) {this.health = 0;}
	//Alter attack cooldown counters
	if (this.punch.attacking > -this.punch.cooldown) { this.punch.attacking--; }
	if (this.kick.attacking > -this.kick.cooldown) { this.kick.attacking--; }
    },
    this.reset = function() {
	this.health = this.maxHealth;
	this.x = this.startX;
	this.y = gameCanvas.height-floor;
    }
}

function detectCollisions(collider) {
    //Edge of screen
    if (collider.x < 0) {collider.x=0};
    if (collider.x > gameCanvas.width-collider.width) {collider.x = gameCanvas.width-collider.width};
    if (collider.y < 0) {collider.y=0};
    if (collider.y > gameCanvas.height-collider.height-floor) {collider.y = gameCanvas.height-collider.height-floor};
    //Other player
    for (var i=0; i < players.length; i++) {
	obstacle = players[i];
	if (obstacle != collider) {
	    if (collider.x <= obstacle.x+obstacle.width && collider.x+collider.width >= obstacle.x) {
		collider.bounce();
		collider.health -= 5;
		collider.hit_sound.play();
		obstacle.bounce();
		obstacle.health -= 5;
		obstacle.hit_sound.play();
	    }
	}
    }
}

//Object that holds the state of input
var currentKeys = {};

//Functions for input

function keyIsPressed(keyCode) {
    return currentKeys[keyCode];
}

function keyStart(event) {
    currentKeys[event.keyCode] = true;
}

function keyEnd(event) {
    delete currentKeys[event.keyCode];
}

//Event listeners for keypresses
window.addEventListener('keydown', function(event) {keyStart(event)}, false);
window.addEventListener('keyup', function(event) {keyEnd(event)}, false);

function init() {
    //Get the canvas and context
    gameCanvas=document.getElementById("gameScreen");
    gameContext=gameCanvas.getContext("2d");
    //Set additional global vars
    floor = 50;
    //Create players and set their initial data
    players = new Array();
    players[0] = new Character();
    players[0].name = 'Player 1';
    players[0].startX = 100;
    players[0].healthBarX = 50;
    players[0].direction = 'right';
    players[0].image.src = 'assets/images/player_1.png';
    players[0].keys = {
	left: 65, //a
	right: 68, //d
	jump: 87, //w
	crouch: 83, //s
	punch: 86,//v
	kick: 66//b
    }
    players[1] = new Character();
    players[1].name = 'Player 2';
    players[1].direction = 'left';
    players[1].startX = 680;
    players[1].healthBarX = 850;
    players[1].image.src = 'assets/images/player_2.png';
    players[1].keys = {
	left: 37, //arrow keys
	right: 39,
	jump: 38,
	crouch: 40,
	punch: 57, //9
	kick: 48 //0
    }
    //Set backgrounds
    background = new Image();
    background.src = 'assets/images/background.png';
    //Set music
    background_music = new Audio('assets/sound/background.wav');
    background_music.loop = true;
    background_music.play();
    startScreen = new Image();
    startScreen.src = 'assets/images/start.png';
    if (window.webkitRequestAnimationFrame) {
	window.onEachFrame = function(turn) {
	    var _turn = function() { turn(); animationRequest = webkitRequestAnimationFrame(_turn); }
	    _turn();
	};
	window.cancelAnimationRequest = function(request) {
	    this.webkitCancelRequestAnimationFrame(request)
	}
    } else if (window.mozRequestAnimationFrame) {
	window.onEachFrame = function(turn) {
	    var _turn = function() { turn(); animationRequest = mozRequestAnimationFrame(_turn); }
	    _turn();
	};
	window.cancelAnimationRequest = function(request) {
	    this.mozCancelRequestAnimationFrame(request)
	}
    } else  {
	window.onEachFrame = function(turn) {
	    animationRequest = setInterval(turn, 1000 / 60); //60fps
	}
	window.cancelAnimationRequest = function(request) {
	    clearInterval(request);
	}
    }
}

function drawScreen() {
    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    gameContext.drawImage(background,0,0);

    for (var i=0; i < players.length; i++) {
	players[i].getInput();
	players[i].update();
	players[i].drawHealth(gameContext);
	players[i].draw(gameContext);
    }
}

//Overview of game
function doTurn() {
    //Check for a winner
    if (players[0].health <= 0 && players[1].health <= 0) {
	players[0].update();
	players[1].update();
	players[0].drawHealth(gameContext);
	players[1].drawHealth(gameContext);

	var message = "IT'S A DRAW!";
	awaitRound(message, false);
    } else if (players[0].health <= 0 ) {
	players[0].update();
	players[0].drawHealth(gameContext);

	var message = players[1].name+" Wins!";
	awaitRound(message, false);
    } else if (players[1].health <= 0 ) {
	players[1].update();
	players[1].drawHealth(gameContext);

	var message = players[0].name+" Wins!";
	awaitRound(message, false);
    } else {
	drawScreen();
    }
}

function beginRound(firstRound) {
    if (!inRound) {
	inRound = true;
	for (var i=0; i < players.length; i++) {
	    players[i].reset();
	}
	if (firstRound) {
	    window.onEachFrame(doTurn);//Recalls itself
	}
    }
};

function awaitRound(message, firstRound) {
    inRound = false;
    window.addEventListener('keydown', function(event) {
	if (event.keyCode == 32) {
	    this.removeEventListener('keydown', arguments.callee, false);
	    beginRound(firstRound);
	}
    }, false);
    gameContext.drawImage(startScreen,0,0);
    gameContext.font = "italic 36px Arial Black";
    gameContext.fillStyle = "#FFFFFF";
    gameContext.textAlign = 'center';
    gameContext.fillText(message, 450, 135);
}

function startup() {
    init();
    setTimeout(function() {
	gameContext.drawImage(background,0,0);
	awaitRound("HTML5 BOXING!", true);
    }, 100);
}
