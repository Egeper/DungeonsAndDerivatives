import Phaser from "phaser";
import DungeonScene from "./dungeon-scene.js";

var text;
export default class MainMenuScene extends Phaser.Scene {
  constructor(scene){
    super({
      key: 'MainMenuScene',
      active: true
    });
    //this.scene = scene;
    //this.keys = scene.input.keyboard.createCursorKeys();
  }

  preload() {
  }

  create() {
    text = this.add.text(16, 16,
      `                       Dungeons and Derivatives\n\n    11-F  Alcantara | Dagdagan | Garcia | Grey | Perdon| Pimentel\n\nYou have been trapped in a dungeon maze by a genius wizard. You \nseem to be five floors deep in this place and each floor gets \nprogressively more complicated. You know that the wizard is a fan of \nmath and is an expert of calculus and derivatives. You also know that \nthe exit to each floor is locked with some sort of puzzle. With your \nwit and intelligence, can you get out of this maze?\n\nPress enter to continue...\n\n*Note don't make contact with locked stairs until code is unlocked`,
      {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 5, y: 10 },
        backgroundColor: "#ffffff"
      }
    )
      .setScrollFactor(0);
    /*
    const keys = this.keys;
    if (keys.right.isDown) {
      this.scene.start(DungeonScene);
    }
    */
    // Start Button
    /*
    function start(event) {
      if (event.keyCode == 13) {
        
      }
      //document.removeEventListener('keydown', name);
    }
    document.addEventListener('keydown', start);
    */
    document.addEventListener('keydown', function (event) {
      if (event.keyCode == 13) {
        //alert("test");
        text.destroy();
      }
    }, this);
  }
}