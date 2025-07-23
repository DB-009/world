// File: main.js
//import { OverworldScene } from './scenes/OverworldScene.js';
import { NewWorldScene } from './scenes/NewWorldScene.js';
const config = {
    type: Phaser.AUTO,
    width: 672,
    height: 448,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    pixelArt: true,
    scene: [NewWorldScene],
    scale: {
        mode: Phaser.Scale.NONE,

    }
};

const game = new Phaser.Game(config);
