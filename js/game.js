var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

  game.load.image('man', 'assets/man.png');
  game.load.image('map', 'assets/map.png');

}

var sprite;
var cursors;

function create() {

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
  sprite.body.setZeroDamping();
  sprite.body.fixedRotation = true;

  //text = game.add.text(20, 20, 'move with arrow keys', { fill: '#ffffff' });

  //cursors = game.input.keyboard.createCursorKeys();

  game.input.mouse.capture = true;

}

function update() {

  //sprite.body.setZeroVelocity();

  pointToMouse();

  if(game.input.activePointer.leftButton.isDown){
    var force = 2;
    var forceX = force * Math.cos(force);
    var forceY = force * Math.sin(force);
    sprite.body.applyImpulse([forceX, forceY]);
  }
}

function render() {
}

function pointToMouse(){
  var toX = game.input.mousePointer.x;

  var toY = game.input.mousePointer.y;

  var dy = sprite.body.y - toY ;
  var dx = sprite.body.x - toX;
  var theta = Math.atan2(dy, dx) - 1.57;
  //theta  = theta * 180/3.142;


  sprite.body.fixedRotation = false;
  sprite.body.rotation = theta;
  console.log(theta);
}
