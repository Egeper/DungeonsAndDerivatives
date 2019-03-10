/**
 * A class that wraps up our top down player logic. It creates, animates and moves a sprite in
 * response to WASD keys. Call its update method from the scene's update and call its destroy
 * method when you're done with the player.
 */
export default class Enemy {
  constructor(scene, x, y) {
    this.scene = scene;

    const anims = scene.anims;
    anims.create({
      key: "enemy-walk",
      frames: anims.generateFrameNumbers("characters", { start: 0, end: 9 }),
      frameRate: 8,
      repeat: -1
    });
    anims.create({
      key: "enemy-walk-back",
      frames: anims.generateFrameNumbers("characters", { start: 10, end: 18 }),
      frameRate: 8,
      repeat: -1
    });

    this.sprite = scene.physics.add
      .sprite(x, y, "characters", 1)
      .setSize(28, 53)
      .setOffset(23, 27);

    this.sprite.anims.play("enemy-walk-back");

    //this.keys = scene.input.keyboard.createCursorKeys();
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  updateEnemy() {
    var directions = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 }
    ];
    var dx = player.x - enemy.x;
    var dy = player.y - enemy.y;

    // if player is far away, walk randomly
    if (Math.abs(dx) + Math.abs(dy) > 6) var check = 10;
    while (
      !moveTo(enemy, directions[randomInt(directions.length)]) &&
      check > 0
    ) {
      check--;
    }

    // otherwise walk towards player
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        // left
        moveTo(player, directions[0]);
      } else {
        // right
        moveTo(player, directions[1]);
      }
    } else {
      if (dy < 0) {
        // up
        moveTo(player, directions[2]);
      } else {
        // down
        moveTo(player, directions[3]);
      }
    }
  }

  //program keystrokes
  /*updateEnemy() {
    const keys = this.keys;
    const sprite = this.sprite;
    const speed = 300;
    const prevVelocity = sprite.body.velocity.clone();

    // Stop any previous movement from the last frame
    sprite.body.setVelocity(0);

    // Horizontal movement
    if (keys.left.isDown) {
      sprite.body.setVelocityX(-speed);
      sprite.setFlipX(true);
    } else if (keys.right.isDown) {
      sprite.body.setVelocityX(speed);
      sprite.setFlipX(false);
    }

    // Vertical movement
    if (keys.up.isDown) {
      sprite.body.setVelocityY(-speed);
    } else if (keys.down.isDown) {
      sprite.body.setVelocityY(speed);
    }

    // Normalize and scale the velocity so that sprite can't move faster along a diagonal
    sprite.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right/down animations precedence over up animations
    if (keys.left.isDown || keys.right.isDown || keys.down.isDown) {
      sprite.anims.play("enemy-walk", true);
    } else if (keys.up.isDown) {
      sprite.anims.play("enemy-walk-back", true);
    } else {
      sprite.anims.stop();

      // If we were moving & now we're not, then pick a single idle frame to use
      if (prevVelocity.y < 0) sprite.setTexture("characters", 65);
      else sprite.setTexture("characters", 46);
    }
  }

  destroy() {
    this.sprite.destroy();
  }*/
}
