import Phaser from "phaser";
import Dungeon from "@mikewesthad/dungeon";
import Player from "./player.js";
import TILES from "./tile-mapping.js";
import TilemapVisibility from "./tilemap-visibility.js";
/**
 * Scene that generates a new dungeon
 */

var level1 = {
  one: "1) f(x) = x^2 + 2x + 1; f(2)(x) = ?",
  two: "2) g(x) = x^2 + 2x + 2; g(1)(3) = ?",
  three: "3) h(x) = x2 + 2x + x; h(1)(½) = ?",
  pass: 284
}

var level2 = {
  one: "1) f(x) = -3cosx / sinx; f(1)(pi / 2) = ?",
  two: "2) g(x) = 2 / x^4; g(1)(1) = ?",
  three: "3) h(x) = ¾ x^4 / 3; h(1)(343) = ?",
  four: "4) t(x) = x^4 - 3x2 + 5x - 125; t(?)(x) = 24",
  pass: 3874
}
    
var level3 = {
  one: "1) f(x) = -10cos(x)sin(x); f(1)(pi / 2) = ?",
  two: "2) g(x) = sin(x); g(4k + ?) = cos(x)",
  three: "3) h(x) = tan(x); h(2)(x) = ?",
  pass: 1010
}


var level4 = {
  one: "Equation of the curve is x2 - 5x - 24 = 0",
  two: "Equation of the normal line is x - 17y + 51 = 0",
  three: "Code = Coordinates of intersection of the tangent line and the curve",
  pass: 1142
}

var level5 = {
  one: "f(x) = 10 / 3 x3 + 20x2",
  two: "g(x) = 1.5x5 + x4 + 125",
  three: "h(x) =  ½ x5 + x4 + 30x2",
  four: "F(x) = f(x) + g(x) + h(x). F(1)(5) = ?",
  pass: 8000
}

var playerTileX;
var playerTileY;
var d_chestxy;
var d_itempotxy;
var d_itempot2xy;
var d_longchestxy;
var d_stairsxy;

var chestxy;
var itempotxy;
var longchestxy;
var itempot2xy;
var stairsxy;
var level;
var stairs;

var map;
export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'DungeonScene',
      active: true
    });
    this.level = 0;
    level = 0;
  }

  preload() {
    this.load.image(
      "tiles",
      "../assets/tilesets/buch-tileset-48px-extruded.png"
    );
    this.load.spritesheet(
      "characters",
      "../assets/spritesheets/buch-characters-64px-extruded.png",
      {
        frameWidth: 64,
        frameHeight: 64,
        margin: 1,
        spacing: 2
      }
    );
  }

  create() {
    this.level++;
    level++;
    this.hasPlayerReachedStairs = false;

    // Generate a random world with a few extra options:
    //  - Rooms should only have odd number dimensions so that they have a center tile.
    //  - Doors should be at least 2 tiles away from corners, so that we can place a corner tile on
    //    either side of the door location
    this.dungeon = new Dungeon({
      width: 40,
      height: 40,
      doorPadding: 2,
      rooms: {
        width: { min: 7, max: 11, onlyOdd: true },
        height: { min: 7, max: 11, onlyOdd: true }
      }
    });

    this.dungeon.drawToConsole();

    // Creating a blank tilemap with dimensions matching the dungeon
    map = this.make.tilemap({
      tileWidth: 48,
      tileHeight: 48,
      width: this.dungeon.width,
      height: this.dungeon.height
    });
    const tileset = map.addTilesetImage("tiles", null, 48, 48, 1, 2); // 1px margin, 2px spacing
    this.groundLayer = map
      .createBlankDynamicLayer("Ground", tileset)
      .fill(TILES.BLANK);
    this.stuffLayer = map.createBlankDynamicLayer("Stuff", tileset);
    const shadowLayer = map
      .createBlankDynamicLayer("Shadow", tileset)
      .fill(TILES.BLANK);

    this.tilemapVisibility = new TilemapVisibility(shadowLayer);

    // Use the array of rooms generated to place tiles in the map
    // Note: using an arrow function here so that "this" still refers to our scene
    this.dungeon.rooms.forEach(room => {
      const { x, y, width, height, left, right, top, bottom } = room;

      // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
      // See "Weighted Randomize" example for more information on how to use weightedRandomize.
      this.groundLayer.weightedRandomize(
        x + 1,
        y + 1,
        width - 2,
        height - 2,
        TILES.FLOOR
      );

      // Place the room corners tiles
      this.groundLayer.putTileAt(TILES.WALL.TOP_LEFT, left, top);
      this.groundLayer.putTileAt(TILES.WALL.TOP_RIGHT, right, top);
      this.groundLayer.putTileAt(TILES.WALL.BOTTOM_RIGHT, right, bottom);
      this.groundLayer.putTileAt(TILES.WALL.BOTTOM_LEFT, left, bottom);

      // Fill the walls with mostly clean tiles, but occasionally place a dirty tile
      this.groundLayer.weightedRandomize(
        left + 1,
        top,
        width - 2,
        1,
        TILES.WALL.TOP
      );
      this.groundLayer.weightedRandomize(
        left + 1,
        bottom,
        width - 2,
        1,
        TILES.WALL.BOTTOM
      );
      this.groundLayer.weightedRandomize(
        left,
        top + 1,
        1,
        height - 2,
        TILES.WALL.LEFT
      );
      this.groundLayer.weightedRandomize(
        right,
        top + 1,
        1,
        height - 2,
        TILES.WALL.RIGHT
      );

      // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
      // room's location
      var doors = room.getDoorLocations();
      for (var i = 0; i < doors.length; i++) {
        if (doors[i].y === 0) {
          this.groundLayer.putTilesAt(
            TILES.DOOR.TOP,
            x + doors[i].x - 1,
            y + doors[i].y
          );
        } else if (doors[i].y === room.height - 1) {
          this.groundLayer.putTilesAt(
            TILES.DOOR.BOTTOM,
            x + doors[i].x - 1,
            y + doors[i].y
          );
        } else if (doors[i].x === 0) {
          this.groundLayer.putTilesAt(
            TILES.DOOR.LEFT,
            x + doors[i].x,
            y + doors[i].y - 1
          );
        } else if (doors[i].x === room.width - 1) {
          this.groundLayer.putTilesAt(
            TILES.DOOR.RIGHT,
            x + doors[i].x,
            y + doors[i].y - 1
          );
        }
      }
    });

    // Separate out the rooms into:
    //  - The starting room (index = 0)
    //  - A random room to be designated as the end room (with stairs and nothing else)
    //  - An array of 80% of the remaining rooms, for placing random stuff (leaving 10% empty)
    const rooms = this.dungeon.rooms.slice();
    const startRoom = rooms.shift();
    const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(
      0,
      rooms.length * 0.8
    );
    // Place the stairs
    this.stuffLayer.putTileAt(TILES.STAIRS, endRoom.centerX, endRoom.centerY);
    stairsxy = { x: endRoom.centerX, y: endRoom.centerY};
    var chests = 4;
    var counter = 0;
    // Place stuff in the 90% "otherRooms"
    otherRooms.forEach(room => {
      var rand = Math.random();
      if (counter < chests && rand <= 0.5) {
        counter++;
        // Place the chests
        if (counter == 1) {
          this.stuffLayer.putTileAt(TILES.CHEST, room.centerX, room.centerY);
          chestxy = { x: room.centerX, y: room.centerY };
        } else if (counter == 2) {
          this.stuffLayer.putTileAt(TILES.ITEMPOT, room.centerX, room.centerY);
          itempotxy = { x: room.centerX, y: room.centerY };
        } else if (counter == 3) {
          this.stuffLayer.putTileAt(TILES.LONGCHEST,room.centerX,room.centerY);
          longchestxy = { x: room.centerX, y: room.centerY };
        } else if (counter == 4) {
          this.stuffLayer.putTileAt(TILES.ITEMPOT2, room.centerX, room.centerY);
          itempot2xy = { x: room.centerX, y: room.centerY };
        }
      } else if (rand <= 0.8) {
        // 50% chance of a pot anywhere in the room... except don't block a door!
        const x = Phaser.Math.Between(room.left + 2, room.right - 2);
        const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
        this.stuffLayer.weightedRandomize(x, y, 1, 1, TILES.POT);
      } else {
        // 25% of either 2 or 4 towers, depending on the room size
        if (room.height >= 9) {
          this.stuffLayer.putTilesAt(TILES.TOWER,room.centerX - 1, room.centerY + 1);
          this.stuffLayer.putTilesAt(TILES.TOWER,room.centerX + 1,room.centerY + 1);
          this.stuffLayer.putTilesAt(TILES.TOWER,room.centerX - 1, room.centerY - 2);
          this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 2);
        } else {
          this.stuffLayer.putTilesAt(TILES.TOWER,room.centerX - 1,room.centerY - 1);
          this.stuffLayer.putTilesAt(TILES.TOWER,room.centerX + 1, room.centerY - 1);
        }
      }
    });


    // Not exactly correct for the tileset since there are more possible floor tiles, but this will
    // do for the example.
    this.groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
    this.stuffLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);

    // Place the player in the first room
    const playerRoom = startRoom;
    const x = map.tileToWorldX(playerRoom.centerX);
    const y = map.tileToWorldY(playerRoom.centerY);
    this.player = new Player(this, x, y);
    
    const cam = this.cameras.main;

    // Watch the player and tilemap layers for collisions, for the duration of the scene:
    this.physics.add.collider(this.player.sprite, this.groundLayer);
    this.physics.add.collider(this.player.sprite, this.stuffLayer);
    
    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = this.cameras.main;

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(this.player.sprite);

    // Help text that has a "fixed" position on the screen
    this.add.text(16,16,
        `(Arrow Keys to move | Enter to interact)\nFind the clues. Find the stairs. Go deeper. Solve the Mystery.\nCurrent level: ${this.level}`,
        {
          font: "18px monospace",
          fill: "#000000",
          padding: { x: 5, y: 10 },
          backgroundColor: "#ffffff"
        }
      )
      .setScrollFactor(0);

    this.stuffLayer.setTileIndexCallback(TILES.STAIRS, () => {
      this.stuffLayer.setTileIndexCallback(TILES.STAIRS, null);
        this.hasPlayerReachedStairs = true;
        this.player.freeze();
        const cam = this.cameras.main;
        cam.fade(250, 0, 0, 0);
        cam.once("camerafadeoutcomplete", () => {
          this.player.destroy();
          this.scene.restart();
        });
        document.removeEventListener('keydown', enter);
        stairs = false;
    });

    function enter(event) {
      if (d_stairsxy == 1 && event.keyCode == 13 || stairs == false) {
        switch (level) {
          case 1:
            var code = prompt("Enter the code: ");
            if (code == level1.pass) {
              alert("It opened.")
            } else {
              alert("It didn't work.");
            }
            break;
          case 2:
            var code = prompt("Enter the code: ");
            if (code == level2.pass) {
              alert("It opened.")
              this.scene.restart();
            } else {
              alert("It didn't work.");
            }
            break;
          case 3:
            var code = prompt("Enter the code: ");
            if (code == level3.pass) {
              alert("It opened.")
              this.scene.restart();
            } else {
              alert("It didn't work.");
            }
            break;
          case 4:
            var code = prompt("Enter the code: ");
            if (code == level4.pass) {
              alert("It opened.")
              this.scene.restart();
            } else {
              alert("It didn't work.");
            }
            break;
          case 5:
            var code = prompt("Enter the code: ");
            if (code == level5.pass) {
              alert("It opened.")
              this.scene.restart();
            } else {
              alert("It didn't work.");
            }
            break;
        }
      } else if (d_chestxy == 1 && event.keyCode == 13) {
        switch (level) {
          case 1:
            alert("There's a clue");
            alert(level1.one);
            break;
          case 2:
            alert("There's a clue");
            alert(level2.one);
            break;
          case 3:
            alert("There's a clue");
            alert(level3.one);
            break;
          case 4:
            alert("There's a clue");
            alert(level4.one);
            break;
          case 5:
            alert("There's a clue");
            alert(level5.one);
            break;
        }
      } else if (d_itempotxy == 1 && event.keyCode == 13) {
        switch (level) {
          case 1:
            alert("There's a clue");
            alert(level1.two);
            break;
          case 2:
            alert("There's a clue");
            alert(level2.two);
            break;
          case 3:
            alert("There's a clue");
            alert(level3.two);
            break;
          case 4:
            alert("There's a clue");
            alert(level4.two);
            break;
          case 5:
            alert("There's a clue");
            alert(level5.two);
            break;
        }
      } else if (d_itempot2xy == 1 && event.keyCode == 13) {
        switch (level) {
          case 1:
            alert("There's a clue");
            alert(level1.three);
            break;
          case 2:
            alert("There's a clue");
            alert(level2.three);
            break;
          case 3:
            alert("There's a clue");
            alert(level3.three);
            break;
          case 4:
            alert("There's a clue");
            alert(level4.three);
            break;
          case 5:
            alert("There's a clue");
            alert(level5.three);
            break;
        }
      } else if (d_longchestxy == 1 && event.keyCode == 13) {
        switch (level) {
          case 5:
            alert(level5.four);
            break;
          case 2:
            alert(level2.four);
            break;
          default:
            alert("No clue here");
            break;
        }
      } else if (event.keyCode == 13) {
        alert("There's no clue nearby.");
        //alert(d_stairsxy);
      } 
    };

    document.addEventListener('keydown', enter);
  }
  update(time, delta) {
    if (this.hasPlayerReachedStairs) return;

    this.player.update();
  
    // Find the player's room using another helper method from the dungeon that converts from
    // dungeon XY (in grid units) to the corresponding room object
    playerTileX = this.groundLayer.worldToTileX(this.player.sprite.x);
    playerTileY = this.groundLayer.worldToTileY(this.player.sprite.y);
    d_chestxy = Phaser.Math.Distance.Between(playerTileX, playerTileY, chestxy.x, chestxy.y);
    d_itempotxy = Phaser.Math.Distance.Between(playerTileX, playerTileY, itempotxy.x, itempotxy.y);
    d_itempot2xy = Phaser.Math.Distance.Between(playerTileX, playerTileY, itempot2xy.x, itempot2xy.y);
    d_longchestxy = Phaser.Math.Distance.Between(playerTileX, playerTileY, longchestxy.x, longchestxy.y);
    d_stairsxy = Phaser.Math.Distance.Between(playerTileX, playerTileY, stairsxy.x, stairsxy.y);
    const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);

    this.tilemapVisibility.setActiveRoom(playerRoom);
  }
}
