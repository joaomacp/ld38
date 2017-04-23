var game = new Phaser.Game(1000, 850, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

var gravityOn = false;

var canTakeOff = true;

var LOG_MOUSEPOS = false;

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
var fuelConsumption = 10;
var isRepositioning = false;
var playerOnRock;

var prevPlayerPos = {x: 0, y: 0};

var planets = [
  {center: {x: 600, y: 273}, radius: 110, name: '1-1', gravity: 3000, gravityDistance: 400, body: undefined},
  {center: {x: 1000, y: 500}, radius: 135, name: '1-2', gravity: 3500, gravityDistance: 450, body: undefined}
]

var rocks = [
  {center: {x: 236, y: 202}, radius: 23, name: '1', fuelUsed: true, body: undefined},
  {center: {x: 1200, y: 259}, radius: 22, name: '2', fuelUsed: false, body: undefined}
]

function create() {

  game.world.setBounds(0, 0, 2600, 2200);

  game.add.image(0, 0, 'map');

  // New initialization code


  /* do these when setting / launching the player
  //	Enable p2 physics
  game.physics.startSystem(Phaser.Physics.P2JS);

  //  Add a sprite
  sprite = game.add.sprite(200, 200, 'man');

  */
  // Forget about if the meter works for now
  fullMeter = game.add.sprite(50, 700, 'meter_full');

  fullMeter.fixedToCamera = true;

  emptyMeter = game.add.sprite(50, 700, 'meter_empty');

  emptyMeter.fixedToCamera = true;

  meterMask = game.add.graphics(50, 700);

  //	Shapes drawn to the Graphics object must be filled.
  meterMask.beginFill(0xffffff);

  meterMask.fixedToCamera = true;

  meterMask.drawRect(0, 0, 100, 100);

  emptyMeter.mask = meterMask;

  setPlayerOnRock(0);

  //  Enable if for physics. This creates a default rectangular body.
  //game.physics.p2.enable(sprite);

  //sprite.body.onBeginContact.add(collisionHandle, this);

  //  Modify a few body properties
  //sprite.body.setZeroDamping();
  //sprite.body.fixedRotation = true;

  //text = game.add.text(20, 20, 'move with arrow keys', { fill: '#ffffff' });

  //cursors = game.input.keyboard.createCursorKeys();

  game.input.mouse.capture = true;

  //game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

  addPlanetBodies();

  addRockBodies();

  //enterRockMode(200, 200, rocks[0]);

}

function setPlayerOnRock(nRock, posX, posY){

  game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

  var rockObject = rocks[nRock];

  if(!rockObject.fuelUsed || rockObject.name == '1'){
    rockObject.fuelUsed = true;
    fuelLevel = 100;
    //meterMask.height = 100;
  }

  playerOnRock = rockObject;
  if(posX && posY){
    var initialPos = {x: posX, y: posY};
  }
  else{
    var initialPos = rockObject.center;
  }

  //	Enable p2 physics
  game.physics.startSystem(Phaser.Physics.P2JS);

  if(sprite){
    sprite.kill();
  }

  //  Add a sprite
  sprite = game.add.sprite(initialPos.x, initialPos.y, 'man');

  gravityOn = false;
  console.log("gravity is now off");

  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;

  game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

  game.state.update = rockModeUpdate;

}

function update() {

  //sprite.body.setZeroVelocity();
  //meterMask.x = 50 + game.camera.x;
  //meterMask.y = 700 + game.camera.y;

  //fullMeter.mask = meterMask;
  if(sprite.body){
    if(game.input.activePointer.leftButton.isDown && fuelLevel > 0){
      if(!gravityOn){
        gravityOn = true;
        console.log("gravity is now on");
      }
      var force = 0.5;
      var forceX = force * Math.cos(sprite.body.rotation + 1.57);
      var forceY = force * Math.sin(sprite.body.rotation + 1.57);
      sprite.body.applyImpulse([forceX, forceY]);
      sprite.loadTexture('man_jet');

      if(timeToSpendFuel){
        fuelLevel--;

        //fullMeter.mask = meterMask;
        //meterMask.height = 100-fuelLevel;
        console.log('fuelLevel: ' + fuelLevel);
        timeToSpendFuel = false;
        setTimeout(function(){timeToSpendFuel = true;}, 1000/fuelConsumption);
      }

    }
    else{
      sprite.loadTexture('man');
    }

    pointToMouse();


    if(gravityOn){
      applyPlanetGravity();
    }


    limitSpeedP2JS(sprite.body, 200);

    if(sprite.body.x !== 'undefined' && sprite.body.y !== 'undefined')
    prevPlayerPos = {x: sprite.body.x, y: sprite.body.y};
  }
}

function render() {

  if(sprite.body){
    sprite.rotation = sprite.body.rotation;
  }

  meterMask.height = 103-fuelLevel;


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

  if(LOG_MOUSEPOS){
    console.log('mouseX: ' + toX + ', mouseY: ' + toY);
  }

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
  console.log('bodyname: ' + body.name + 'body b name: ' + bodyB.name);
  if(bodyB.name == 'Planet' || body.name == 'Planet'){
    console.log("hit a planet");

    sprite.alpha = 0;

    // pause the camera

    //game.camera.target = null;

    var planetName;
    if(body.planet){
      planetName = body.planet;
    }
    if(bodyB.planet){
      planetName = bodyB.planet;
    }

    //wait 1s, reposition player
    setTimeout(function(){
      setPlayerOnRock(parseInt(planetName.charAt(0)) - 1);
    }, 1000);

  }

  if(bodyB.name == 'Rock' || body.name == 'Rock'){
    console.log("hit a rock");
    console.log('body A pos: ' + body.x + ',' + body.y)
    console.log('body B pos: ' + bodyB.x + ',' + bodyB.y)
    var playerBody;
    var rockLanded;
    if(bodyB.name == 'Rock'){
      playerBody = body;
      rockLanded = bodyB.rock;
    }
    else{
      playerBody = bodyB;
      rockLanded = body.rock;
    }

    setPlayerOnRock(parseInt(rockLanded.name) - 1, prevPlayerPos.x, prevPlayerPos.y);

    //wait 1s, reposition player
    //setTimeout(function(){
    //  resetPlayerAndCamera();
    //}, 1000);

  }
}

function enterRockMode(x, y, rockLanded){
  canTakeOff = false;

  setTimeout(function(){canTakeOff = true;}, 220);

  if(!rockLanded.fuelUsed || rockLanded.name == '1'){
    rockLanded.fuelUsed = true;
    fuelLevel = 100;
    //meterMask.height = 100-fuelLevel;
  }

  gravityOn = false;
  console.log("gravity is now off");

  sprite.body = undefined;

  sprite.kill();

  sprite = game.add.sprite(x, y, 'man');

  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;

  playerOnRock = rockLanded;

  game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

  game.state.update = rockModeUpdate;

  // copy stuff from resetPlayerAndCamera
}

var rockModeUpdate = function(){

  var distanceToMouse = Phaser.Point.distance({x: game.input.mousePointer.x + game.camera.x, y: game.input.mousePointer.y + game.camera.y}, playerOnRock.center);

  //meterMask.height = 100-fuelLevel;

  if(distanceToMouse > playerOnRock.radius + 70){
    var toX = game.input.mousePointer.x + game.camera.x;

    var toY = game.input.mousePointer.y + game.camera.y;

    var dy = sprite.y - toY ;
    var dx = sprite.x - toX;
    var theta = Math.atan2(dy, dx) - 1.57;
    theta  = theta * 180/3.142;
    sprite.angle = theta;

    var radius = playerOnRock.radius + 15;
    var distX = radius * Math.cos(sprite.rotation - 1.57);
    var distY = radius * Math.sin(sprite.rotation - 1.57);
    sprite.x = playerOnRock.center.x + distX;
    sprite.y = playerOnRock.center.y + distY;
    //console.log(theta);
  }

  if(game.input.activePointer.leftButton.isDown && fuelLevel > 0){

    console.log('exiting rockMode');

    if(!gravityOn){
      gravityOn = true;
      console.log("gravity is now on");
    }

    /* don't kill the sprite, only add physics
    var sRotation = sprite.rotation;

    var sPosX = sprite.x;
    var sPosY = sprite.y;

    console.log('adding at ' + sPosX + ', ' + sPosY);

    */

    sprite.kill();

    var sPosX = sprite.x;
    var sPosY = sprite.y;
    var sRotation = sprite.rotation;

    console.log('adding at ' + sPosX + ', ' + sPosY);

    sprite = game.add.sprite(sPosX, sPosY, 'man');

    sprite.rotation = sRotation;

    game.physics.p2.enable(sprite);

    sprite.body.fixedRotation = false;

    sprite.body.rotation = sRotation;

    sprite.body.fixedRotation = true;

    sprite.body.onBeginContact.add(collisionHandle, this);

    resetPlanetsAndRocks(200);

    game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    game.state.update = update;

    /* will the body get the same rotation as the sprite?
    sprite.body.fixedRotation = false;

    sprite.body.rotation = sRotation;

    sprite.body.fixedRotation = true;

    */
    /* initial jump - add later maybe
    var force = 0.5;
    var forceX = force * Math.cos(sprite.body.rotation + 1.57);
    var forceY = force * Math.sin(sprite.body.rotation + 1.57);
    sprite.body.applyImpulse([forceX, forceY]);

    setTimeout(function(){
    game.state.update = update;
    if(sprite.body){
    sprite.body.onBeginContact.add(collisionHandle, this);
  }
  addRockBodies();
}, 1500);
*/


}

}


function addPlanetBodies(){

  for(planet of planets){

    planet.body = game.add.sprite(planet.center.x, planet.center.y, 'man');
    planet.body.alpha = 0;
    game.physics.p2.enable(planet.body);
    planet.body.body.setCircle(planet.radius);
    planet.body.body.static = true;
    planet.body.body.name = 'Planet';
    planet.body.body.planet = planet.name;

  }
  console.log("added");
}

function addRockBodies(){

  for(rock of rocks){

    rock.body = game.add.sprite(rock.center.x, rock.center.y, 'man');
    rock.body.alpha = 0;
    game.physics.p2.enable(rock.body);
    rock.body.body.setCircle(rock.radius);
    rock.body.body.static = true;
    rock.body.body.name = 'Rock';
    rock.body.body.rock = rock;

  }

}

function resetPlanetsAndRocks(timeout){
  for(planet of planets){
    if(planet.body && planet.body.body){
      planet.body.body.destroy();
      planet.body.kill();
    }
  }

  for(rock of rocks){
    if(rock.body && rock.body.body){
      rock.body.body.destroy();
      rock.body.kill();
    }
  }

  setTimeout(function(){
    addPlanetBodies();
    addRockBodies();
  }, timeout);
}
