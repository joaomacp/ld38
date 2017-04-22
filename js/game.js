var game = new Phaser.Game(1000, 850, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

var gravityOn = false;

function preload() {

  game.load.image('man', 'assets/man.png');
  game.load.image('map', 'assets/map.png');

}

var sprite;
var cursors;

var planet1Center = {x: 600, y: 273};
var planet2Center = {x: 1000, y: 500};

function create() {

  game.world.setBounds(0, 0, 2600, 2200);



  game.add.image(0, 0, 'map');

  //	Enable p2 physics
  game.physics.startSystem(Phaser.Physics.P2JS);

  //  Make things a bit more bouncey
  game.physics.p2.defaultRestitution = 0.8;

  //  Add a sprite
  sprite = game.add.sprite(200, 200, 'man');

  //  Enable if for physics. This creates a default rectangular body.
  game.physics.p2.enable(sprite);

  //  Modify a few body properties
  //sprite.body.setZeroDamping();
  sprite.body.fixedRotation = true;

  //text = game.add.text(20, 20, 'move with arrow keys', { fill: '#ffffff' });

  //cursors = game.input.keyboard.createCursorKeys();

  game.input.mouse.capture = true;

  game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

}

function update() {

  //sprite.body.setZeroVelocity();



  if(game.input.activePointer.leftButton.isDown){
    if(!gravityOn){
      gravityOn = true;
    }
    var force = 0.5;
    var forceX = force * Math.cos(sprite.body.rotation + 1.57);
    var forceY = force * Math.sin(sprite.body.rotation + 1.57);
    sprite.body.applyImpulse([forceX, forceY]);
  }
  pointToMouse();

  if(gravityOn){
    applyPlanetGravity();
  }

  limitSpeedP2JS(sprite.body, 200);

}

function render() {
  sprite.rotation = sprite.body.rotation;
}

function pointToMouse(){
  var toX = game.input.mousePointer.x + game.camera.x;

  var toY = game.input.mousePointer.y + game.camera.y;

  var dy = sprite.body.y - toY ;
  var dx = sprite.body.x - toX;
  var theta = Math.atan2(dy, dx) - 1.57;
  //theta  = theta * 180/3.142;


  sprite.body.fixedRotation = false;
  sprite.body.rotation = theta;
  sprite.body.fixedRotation = true;
  //console.log(theta);

console.log('mouseX: ' + toX + ', mouseY: ' + toY);

  //console.log('pointing to mouse: theta = '+ theta + " rotation: " + sprite.body.rotation + "fixed rotation: " + sprite.body.fixedRotation + "mouseX = " + game.input.mousePointer.x + "mouseY = " + game.input.mousePointer.y )
}

function applyPlanetGravity(){

  addPlanet(planet1Center, 3000, 400, 'P1');

  addPlanet(planet2Center, 3500, 450, 'P2');
  /*
  var distanceToP1 = Phaser.Point.distance(sprite.body, planet1Center);
  console.log('distance to P1: ' + distanceToP1);
  if(distanceToP1 < 400){
    var toX = planet1Center.x;

    var toY = planet1Center.y;

    var dy = sprite.body.y - toY ;
    var dx = sprite.body.x - toX;
    var angleToP1 = Math.atan2(dy, dx);

    //var force = 1000 / Math.pow(distanceToP1, 2);
    var force = 3000 / distanceToP1;
    var forceX = force * Math.cos(angleToP1);
    var forceY = force * Math.sin(angleToP1);
    sprite.body.applyForce([forceX, forceY]);
  }
  */
}

function addPlanet(center, gravity, distanceLimit, name){
  var distanceToPlanet = Phaser.Point.distance(sprite.body, center);
  console.log('distance to ' + name + ': ' + distanceToPlanet);
  if(distanceToPlanet < distanceLimit){
    var toX = center.x;

    var toY = center.y;

    var dy = sprite.body.y - toY ;
    var dx = sprite.body.x - toX;
    var angleToPlanet = Math.atan2(dy, dx);

    //var force = 1000 / Math.pow(distanceToP1, 2);
    var force = gravity / distanceToPlanet;
    var forceX = force * Math.cos(angleToPlanet);
    var forceY = force * Math.sin(angleToPlanet);
    sprite.body.applyForce([forceX, forceY]);
  }
}

var limitSpeedP2JS = function(p2Body, maxSpeed) {    var x = p2Body.velocity.x;    var y = p2Body.velocity.y;    if (Math.pow(x, 2) + Math.pow(y, 2) > Math.pow(maxSpeed, 2)) {        var a = Math.atan2(y, x);        x = Math.cos(a) * maxSpeed;        y = Math.sin(a) * maxSpeed;        p2Body.velocity.x = x;        p2Body.velocity.y = y;    } }
