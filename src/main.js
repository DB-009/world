// File: main.js
import { OverworldScene } from './scenes/OverworldScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    pixelArt: true,
    scene: [OverworldScene],
    scale: {
        mode: Phaser.Scale.NONE,

    }
};

const game = new Phaser.Game(config);
