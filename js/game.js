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

  cursors = game.input.keyboard.createCursorKeys();

}

function update() {

  sprite.body.setZeroVelocity();

  if (cursors.left.isDown)
  {
    sprite.body.moveLeft(400);
  }
  else if (cursors.right.isDown)
  {
    sprite.body.moveRight(400);
  }

  if (cursors.up.isDown)
  {
    sprite.body.moveUp(400);
  }
  else if (cursors.down.isDown)
  {
    sprite.body.moveDown(400);
  }

}

function render() {
}
