var game = new Phaser.Game(1000, 850, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

var gravityOn = false;

function preload() {

  game.load.image('man', 'assets/man.png');
  game.load.image('map', 'assets/map.png');
  game.load.image('man_jet', 'assets/man_withjet.png');
  game.load.image('meter_empty', 'assets/meter.png');
  game.load.image('meter_full', 'assets/meter_full.png');

}

var sprite;
var emptyMeter;
var fullMeter;
var cursors;
var meterMask;
var fuelLevel = 100;
var timeToSpendFuel = true;
var fuelConsumption = 2;

var planets = [
  {center: {x: 600, y: 273}, radius: 110, name: '1-1', gravity: 3000, gravityDistance: 400, body: undefined},
  {center: {x: 1000, y: 500}, radius: 135, name: '1-2', gravity: 3500, gravityDistance: 450, body: undefined}
]


function create() {

  game.world.setBounds(0, 0, 2600, 2200);

  game.add.image(0, 0, 'map');

  //	Enable p2 physics
  game.physics.startSystem(Phaser.Physics.P2JS);

  //  Make things a bit more bouncey
  game.physics.p2.defaultRestitution = 0.8;

  //  Add a sprite
  sprite = game.add.sprite(200, 200, 'man');

  emptyMeter = game.add.sprite(50, 700, 'meter_empty');

  emptyMeter.fixedToCamera = true;

  fullMeter = game.add.sprite(50, 700, 'meter_full');

  fullMeter.fixedToCamera = true;

  meterMask = game.add.graphics(50, 700);

  //	Shapes drawn to the Graphics object must be filled.
  meterMask.beginFill(0xffffff);




  //  Enable if for physics. This creates a default rectangular body.
  game.physics.p2.enable(sprite);

  sprite.body.onBeginContact.add(collisionHandle, this);

  //  Modify a few body properties
  //sprite.body.setZeroDamping();
  sprite.body.fixedRotation = true;

  //text = game.add.text(20, 20, 'move with arrow keys', { fill: '#ffffff' });

  //cursors = game.input.keyboard.createCursorKeys();

  game.input.mouse.capture = true;

  game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

  addPlanetBodies();

}

function update() {

  //sprite.body.setZeroVelocity();

  meterMask.drawRect(0 + game.camera.x, 100-fuelLevel + game.camera.y, 100, 100);
  console.log('fuelLevel: ' + fuelLevel);
  fullMeter.mask = meterMask;

  if(game.input.activePointer.leftButton.isDown && fuelLevel > 0){
    if(!gravityOn){
      gravityOn = true;
    }
    var force = 0.5;
    var forceX = force * Math.cos(sprite.body.rotation + 1.57);
    var forceY = force * Math.sin(sprite.body.rotation + 1.57);
    sprite.body.applyImpulse([forceX, forceY]);
    sprite.loadTexture('man_jet');

    if(timeToSpendFuel){
      fuelLevel--;
      timeToSpendFuel = false;
      setTimeout(function(){timeToSpendFuel = true;}, 1000/fuelConsumption);
    }

  }
  else{
    sprite.loadTexture('man');
  }
  if(sprite.body){
    pointToMouse();


    if(gravityOn){
      applyPlanetGravity();
    }


    limitSpeedP2JS(sprite.body, 200);
  }
}

function render() {
  if(sprite.body){
    sprite.rotation = sprite.body.rotation;
  }


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

  //console.log('mouseX: ' + toX + ', mouseY: ' + toY);

  //console.log('pointing to mouse: theta = '+ theta + " rotation: " + sprite.body.rotation + "fixed rotation: " + sprite.body.fixedRotation + "mouseX = " + game.input.mousePointer.x + "mouseY = " + game.input.mousePointer.y )
}

function applyPlanetGravity(){

  for(planet of planets){
    addPlanet(planet.center, planet.gravity, planet.gravityDistance, planet.name);
  }
}

function addPlanet(center, gravity, distanceLimit, name){
  var distanceToPlanet = Phaser.Point.distance(sprite.body, center);
  //console.log('distance to ' + name + ': ' + distanceToPlanet);
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

function collisionHandle (body, bodyB, shapeA, shapeB, equation) {
  //console.log('body:' + JSON.stringify(body) + ' bodyB: ' + JSON.stringify(bodyB));
  if(bodyB.name == 'Planet' || body.name == 'Planet'){
    console.log("hit a planet");

    // pause the camera

    game.camera.target = null;

    //wait 1s, reposition player
    setTimeout(function(){
      resetPlayerAndCamera();
    }, 1000);

  }
}

function resetPlayerAndCamera(){

  sprite.kill();

  for(planet of planets){
    planet.body.kill();
  }

  game.physics.startSystem(Phaser.Physics.P2JS);

  //  Make things a bit more bouncey
  game.physics.p2.defaultRestitution = 0.8;

  sprite = game.add.sprite(200, 200, 'man');
  game.physics.p2.enable(sprite);
  game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

  addPlanetBodies();

}

function addPlanetBodies(){

  for(planet of planets){

    planet.body = game.add.sprite(planet.center.x, planet.center.y, 'man');
    planet.body.alpha = 0;
    game.physics.p2.enable(planet.body);
    sprite.body.onBeginContact.add(collisionHandle, this);
    planet.body.body.setCircle(planet.radius);
    planet.body.body.static = true;
    planet.body.body.name = 'Planet';

  }
}
