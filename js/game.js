var game = new Phaser.Game(950, 660, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

var gravityOn = false;

var canTakeOff = true;

var LOG_MOUSEPOS = false;

var DEBUG_DRAW = false;

var nextRock = 1;

function preload() {

  game.load.image('man', 'assets/manv1.png');
  game.load.image('map', 'assets/mapv2.png');
  game.load.image('man_jet', 'assets/man_withjetv1.png');
  game.load.image('meter_empty', 'assets/meterv1.png');
  game.load.image('meter_full', 'assets/meter_fullv1.png');
  game.load.image('fuel_can', 'assets/fuelCanv1.png');
  game.load.image('arrow', 'assets/arrow.png');
  game.load.image('text0', 'assets/text0v1.png');
  game.load.image('text1', 'assets/text1v1.png');
  game.load.image('text2', 'assets/text2v1.png');
  game.load.image('text3', 'assets/text3v1.png');
  game.load.image('text4', 'assets/text4v1.png');
  game.load.image('text5', 'assets/text5v1.png');
  game.load.image('text6', 'assets/text6v1.png');

}

var sprite;
var emptyMeter;
var fullMeter;
var cursors;
var meterMask;
var fuelLevel = 100;
var timeToSpendFuel = true;
var fuelConsumption = 16;
var isRepositioning = false;
var playerOnRock;
var cameraBound = true;

var textGraphics;

var arrow;

var prevPlayerPos = {x: 0, y: 0};

var planets = [
  {center: {x: 900, y: 573}, radius: 110, name: '1-1', gravity: 2600, gravityDistance: 400, body: undefined},
  {center: {x: 1300, y: 800}, radius: 135, name: '1-2', gravity: 3000, gravityDistance: 450, body: undefined},
  {center: {x: 2000, y: 0}, radius: 400, name: '2-1', gravity: 10000, gravityDistance: 500, body: undefined},
  {center: {x: 2000, y: 700}, radius: 120, name: '2-2', gravity: 2800, gravityDistance: 400, body: undefined},
  {center: {x: 2760, y: 1000}, radius: 120, name: '3-1', gravity: 2800, gravityDistance: 400, body: undefined},
  {center: {x: 2900, y: 1350}, radius: 120, name: '3-2', gravity: 2800, gravityDistance: 400, body: undefined},
  {center: {x: 2220, y: 1400}, radius: 500, name: '3-3', gravity: 10000, gravityDistance: 700, body: undefined},
  {center: {x: 3200, y: 1200}, radius: 100, name: '3-4', gravity: 4000, gravityDistance: 400, body: undefined},
  {center: {x: 3200, y: 2000}, radius: 100, name: '4-first', gravity: 4300, gravityDistance: 280, body: undefined},
  {center: {x: 2800, y: 2300}, radius: 100, name: '4-second', gravity: 4300, gravityDistance: 280, body: undefined},
  {center: {x: 2400, y: 2200}, radius: 100, name: '4-third', gravity: 6000, gravityDistance: 280, body: undefined},
  {center: {x: 3600, y: 2000}, radius: 100, name: '4-third', gravity: 11000, gravityDistance: 280, body: undefined},
  {center: {x: 2250, y: 2750}, radius: 80, name: '5-third', gravity: 2100, gravityDistance: 170, body: undefined},
  {center: {x: 2150, y: 2400}, radius: 170, name: '5-third', gravity: 11000, gravityDistance: 220, body: undefined},
  {center: {x: 2320, y: 3000}, radius: 90, name: '5-third', gravity: 11000, gravityDistance: 200, body: undefined},
  //{center: {x: 2010, y: 2630}, radius: 95, name: '5-bigrock', gravity: 1, gravityDistance:1, body: undefined},
  {center: {x: 1900, y: 2750}, radius: 200, name: '5-bigrock', gravity: 1, gravityDistance:1, body: undefined},
  {center: {x: 1400, y: 2780}, radius: 256, name: '5-bigrock', gravity: 1, gravityDistance:1, body: undefined},
  {center: {x: 100, y: 1740}, radius: 600, name: '5-bigrock', gravity: 14000, gravityDistance:900, body: undefined},
  {center: {x: 1010, y: 1440}, radius: 100, name: '5-bigrock', gravity: 1, gravityDistance:1, body: undefined},
  {center: {x: 1360, y: 1480}, radius: 100, name: '5-bigrock', gravity: 9000, gravityDistance:243, body: undefined},
  {center: {x: 700, y: 1150}, radius: 100, name: '5-bigrock', gravity: 2600, gravityDistance:243, body: undefined}
]

var rocks = [
  {center: {x: 536, y: 502}, radius: 23, name: '1', fuelUsed: true, body: undefined, fuelCan: undefined},
  {center: {x: 1500, y: 559}, radius: 22, name: '2', fuelUsed: false, body: undefined, fuelCan: undefined},
  {center: {x: 2760, y: 700}, radius: 22, name: '3', fuelUsed: false, body: undefined, fuelCan: undefined},
  {center: {x: 3180, y: 1680}, radius: 22, name: '4', fuelUsed: false, body: undefined, fuelCan: undefined},
  {center: {x: 2600, y: 2750}, radius: 22, name: '5', fuelUsed: false, body: undefined, fuelCan: undefined},
  {center: {x: 1000, y: 2750}, radius: 22, name: '6', fuelUsed: false, body: undefined, fuelCan: undefined}
]

var texts = [
  {n: 0, text: 'text0', showed: false},
  {n: 1, text: 'text1', showed: false},
  {n: 2, text: 'text2', showed: false},
  {n: 3, text: 'text3', showed: false},
  {n: 4, text: 'text4', showed: false},
  {n: 5, text: 'text5', showed: false},
  {n: 6, text: 'text6', showed: false}
]

function create() {

  game.world.setBounds(0, 0, 3700, 3131);

  game.add.image(0, 0, 'map');

  // New initialization code


  /* do these when setting / launching the player
  //	Enable p2 physics
  game.physics.startSystem(Phaser.Physics.P2JS);

  //  Add a sprite
  sprite = game.add.sprite(200, 200, 'man');

  */
  // Forget about if the meter works for now
  fullMeter = game.add.sprite(25, 400, 'meter_full');

  fullMeter.fixedToCamera = true;

  emptyMeter = game.add.sprite(25, 400, 'meter_empty');

  emptyMeter.fixedToCamera = true;

  meterMask = game.add.graphics(25, 400);

  //	Shapes drawn to the Graphics object must be filled.
  meterMask.beginFill(0xffffff);

  meterMask.fixedToCamera = true;

  meterMask.drawRect(0, 0, 100, 100);

  emptyMeter.mask = meterMask;

  setPlayerOnRock(0);



  //triggerText(0);

  arrow = game.add.sprite(0, 0, 'arrow');

  addFuelSprites();

  arrow.alpha = 0;

  setTimeout(appearArrow, 5700);

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

  if(DEBUG_DRAW){
    drawDebug();
  }

  game.camera.bounds = new Phaser.Rectangle(350, 100, 3250, 2931);

}

var textSprite;

function showText(n){

  texts[n].showed = true;

  textSprite = game.add.sprite(0, 0, 'text' + n);

  textSprite.fixedToCamera = true;

  speaking = true;

  setTimeout(function(){speaking = false; textSprite.kill();
    if(n == 6){
      if (confirm("CONGRATULATIONS, you finished the game!") == true) {
        location.reload();
      } else {
        location.reload();
      }
    }
  }, 5600);
}

function drawDebug(){

  var graphics = game.add.graphics(0, 0);

  for(rock of rocks){

    //  Our first arc will be a line only
    graphics.lineStyle(2, 0xffd900);

    // graphics.arc(0, 0, 135, game.math.degToRad(0), game.math.degToRad(90), false);
    graphics.arc(rock.center.x, rock.center.y, rock.radius, 0, 2*3.14, false);
  }

  for(planet of planets){

    //  Our first arc will be a line only
    graphics.lineStyle(4, 0xff00a9);

    // graphics.arc(0, 0, 135, game.math.degToRad(0), game.math.degToRad(90), false);
    graphics.arc(planet.center.x, planet.center.y, planet.radius, 0, 2*3.14, false);

    graphics.lineStyle(2, 0xff5549);

    graphics.arc(planet.center.x, planet.center.y, planet.gravityDistance, 0, 2*3.14, false);
  }
}

function fillUpFuel(){
  if(fuelLevel < 100){
    fuelLevel ++;
    setTimeout(fillUpFuel, 10);
  }
}

function setPlayerOnRock(nRock, posX, posY, bindCamera){

  game.camera.target = rocks[nRock].fuelCan;

  if(nRock == 0){
    if(!texts[0].showed){
      showText(0);
    }
    else{
      if(texts[5].showed){
        showText(6);
      }
    }
  }
  else{
    if(!texts[nRock].showed){
      showText(nRock);
    }
  }
  if(nRock != 0){
    game.camera.bounds = new Phaser.Rectangle(100, 100, 3500, 2931);
    cameraBound = false;
  }
  else{
    if(cameraBound){
      game.camera.bounds = new Phaser.Rectangle(350, 100, 3250, 2931);
    }
  }

  canTakeOff = false;

  setTimeout(function(){canTakeOff = true;}, 950);

  game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

  var rockObject = rocks[nRock];

  var rockNext = parseInt(rockObject.name);

  if(rockNext == 6){
    nextRock = 0;
  }
  else{

    if(rockNext > nextRock){
      nextRock = rockNext;
    }
  }

  fillUpFuel();


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

  if(!speaking){

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
        var force = 0.35;
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


      limitSpeedP2JS(sprite.body, 260);

      if(sprite.body.x !== 'undefined' && sprite.body.y !== 'undefined')
      prevPlayerPos = {x: sprite.body.x, y: sprite.body.y};
    }
  }
}


var textRect = new Phaser.Rectangle(0, 0, 150, 660);
function render() {

  // limit player to map
  if(sprite.body){
    if(sprite.body.y < 100){
      sprite.body.y = 101;
      sprite.body.velocity.x = 0;
    }
    if(sprite.body.x < 100){
      sprite.body.x = 101;
      sprite.body.velocity.y = 0;
    }
    if(sprite.body.x > 3600){
      sprite.body.x = 3599;
      sprite.body.velocity.y = 0;
    }
    if(sprite.body.y > 3031){
      sprite.body.y = 3030;
      sprite.body.velocity.x = 0;
    }

  }

  !game.input.activePointer.leftButton.isDown

  if(rocks[nextRock]){
    // draw the arrow
    var toX = rocks[nextRock].center.x;

    var toY = rocks[nextRock].center.y;

    var dy = sprite.y - toY ;
    var dx = sprite.x - toX;
    var theta = Math.atan2(dy, dx) - 1.57;
    //theta  = theta * 180/3.142;
    arrow.rotation = theta;

    var radius = 50;
    var distX = radius * Math.cos(arrow.rotation - 1.57);
    var distY = radius * Math.sin(arrow.rotation - 1.57);
    arrow.x = sprite.x + distX;
    arrow.y = sprite.y + distY;
  }
  if(sprite.body){
    sprite.rotation = sprite.body.rotation;
  }

  meterMask.height = 102-fuelLevel;



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

    var camRock = nextRock-1;

    if(camRock == -1){
      game.camera.target = rocks[5].fuelCan;
    }
    else{
      game.camera.target = rocks[nextRock-1].fuelCan;
    }

    var planetName;
    if(body.planet){
      planetName = body.planet;
    }
    if(bodyB.planet){
      planetName = bodyB.planet;
    }

    //wait 1s, reposition player
    setTimeout(function(){
      var rockTo = nextRock - 1;
      if(rockTo == -1){
        setPlayerOnRock(5);
      }
      else{
        setPlayerOnRock(nextRock-1);
      }
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

  if(!speaking){

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

    if(game.input.activePointer.leftButton.isDown && fuelLevel > 0 && canTakeOff){

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

function addFuelSprites(){
  for(rock of rocks){
    rock.fuelCan = game.add.sprite(rock.center.x - 8, rock.center.y - 8, 'fuel_can');
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

function restartFromLastCheckpoint(){
  console.log('nextrock: ' + nextRock);
  if(nextRock == 0){
    setPlayerOnRock(5);
  }
  setPlayerOnRock(nextRock - 1);
}

function skipCheckpoint(){
  if(!speaking){
    if (confirm("It may seem hard, but all checkpoints can be cleared. Are you sure you want to skip?") == true) {

      setPlayerOnRock(nextRock);
    }
  }
}
function appearArrow(){
  if(arrow.alpha < 0.65){
    arrow.alpha += 0.01;
    setTimeout(appearArrow, 45);
  }
}
