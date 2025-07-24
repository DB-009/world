import { weightedRandomTile } from '../modules/tile-utils.js';
import { Entity } from '../modules/Entity.js';
import { groundLayer} from '../js/tilemaps/groundLayer.js'
import { groundLayer2} from '../js/tilemaps/groundLayer2.js'
import { obstacleLayer} from '../js/tilemaps/obstacleLayer.js'
import { decorLayer} from '../js/tilemaps/decorLayer.js'
import { building_blue_big, building_blue_small } from '../js/tilemaps/buildingLayouts.js';
import { placeBuildingTiles } from '../modules/placeBuildingTiles.js';

export class NewWorldScene extends Phaser.Scene {
    constructor() {
        super('NewWorldScene');
    }

    preload() {
        // Load player

function decrementArray(arr) {
  return arr.map(n => n - 1);
}

// Example usage:
const input = [0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 2166, 0, 0,
0, 0, 0, 0, 2163, 2230, 0,
0, 0, 0, 0, 2227, 2163, 0,
0, 0, 0, 0, 0, 0, 0

]; // replace this with your array
console.log(decrementArray(input));


        // Body and Hair for idle and run
        this.load.spritesheet('base_idle', 'assets/Sunnyside_World_Assets/Characters/Human/IDLE/base_idle_strip9.png', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('base_run', 'assets/Sunnyside_World_Assets/Characters/Human/RUN/base_run_strip8.png', {
            frameWidth: 96,
            frameHeight: 64
        });

        this.hairstyles = ["bowl","curly","long","mop","short","spikey"];

        this.hairstyles.forEach(hair => {
          this.load.spritesheet(`${hair}hair_idle`, `assets/Sunnyside_World_Assets/Characters/Human/IDLE/${hair}hair_idle_strip9.png`, {
              frameWidth: 96,
              frameHeight: 64
          });
          this.load.spritesheet(`${hair}hair_run`, `assets/Sunnyside_World_Assets/Characters/Human/RUN/${hair}hair_run_strip8.png`, {
              frameWidth: 96,
              frameHeight: 64
          });
        });

        this.load.spritesheet('tools_idle', 'assets/Sunnyside_World_Assets/Characters/Human/IDLE/tools_idle_strip9.png', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('tools_run', 'assets/Sunnyside_World_Assets/Characters/Human/RUN/tools_run_strip8.png', {
            frameWidth: 96,
            frameHeight: 64
        });



        // Load tileset images
        this.load.image('tiles-grass-dirt', 'assets/Sunnyside_World_Assets/Tileset/spr_tileset_sunnysideworld_16px.png');


        // Load TSX files as text
        this.load.text('ground-tsx', 'assets/tileSets/SunnySide_WorldMain.tsx');

        this.load.spritesheet('trees', 'assets/Sunnyside_World_Assets/Elements/Plants/spr_deco_tree_01_strip4.png', {
            frameWidth: 32,
            frameHeight: 34
        });

        this.load.image('UI_Pointer_white', 'assets/Pointer_white.png');


    }

    create() {
        this.cameraPanSpeed = 200; // Pixels per second
        const tileSize = 16;
        const mapWidth = 42;
        const mapHeight = 28;

        this.selectionPointer = this.add.image(0, 0, 'UI_Pointer_white');
        this.selectionPointer.setOrigin(0.5, 1);
        this.selectionPointer.setScale(1);
        this.selectionPointer.setVisible(false); 
        this.selectionPointer.setDepth(3000); 

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.tileCategoryMap = {
            'GRASS': [],
            'DIRT': [],
            'WATER':[],
            'DECOR': [],
            'OBSTACLES': [],
        };

        this.tileCategoryTileSets = {
            'GRASS': 'tiles-grass-dirt',
            'DIRT': 'tiles-grass-dirt',
            'WATER': 'tiles-grass-dirt',
            'DECOR': 'tiles-decor',
            'OBSTACLES': 'tiles-obstacles',
        };

        this.tilesetProperties = {
            'tiles-grass-dirt': this.parseTsx(this.cache.text.get('ground-tsx')),
            'tiles-obstacles': this.parseTsx(this.cache.text.get('ground-tsx')),
            'tiles-decor': this.parseTsx(this.cache.text.get('ground-tsx'))
        };

        const mapData = Array.from({ length: mapHeight }, () =>
            Array.from({ length: mapWidth }, () => 0)
        );

        const map = this.make.tilemap({
            data: mapData,
            tileWidth: tileSize,
            tileHeight: tileSize
        });

        const tilesetMain = map.addTilesetImage('tiles-grass-dirt', null, tileSize, tileSize);
        
        this.tilesetColumnsLookup = {};
        this.tilesetColumnsLookup['tiles-grass-dirt'] = this.textures.get('tiles-grass-dirt').getSourceImage().width / 16;
        this.tilesetColumnsLookup['tiles-obstacles'] = this.textures.get('tiles-grass-dirt').getSourceImage().width / 16;
        this.tilesetColumnsLookup['tiles-decor'] = this.textures.get('tiles-grass-dirt').getSourceImage().width / 16;

        this.groundLayer = map.createLayer(0, tilesetMain, 0, 0);
        this.groundLayer2 = map.createBlankLayer('Ground2', tilesetMain, 0, 0);
        this.obstacleLayer = map.createBlankLayer('Obstacles', tilesetMain, 0, 0);
        this.obstacleLayer2 = map.createBlankLayer('Obstacles2', tilesetMain, 0, 0);
        this.decorLayer = map.createBlankLayer('Decor', tilesetMain, 0, 0);
        this.buildingLayer = map.createBlankLayer('Buildings', tilesetMain, 0, 0);
        this.buildingLayer_inside_floor = map.createBlankLayer('Buildings_inside_floor', tilesetMain, 0, 0);
        this.buildingLayer_inside_decor = map.createBlankLayer('Buildings_inside_decor', tilesetMain, 0, 0);
        this.buildingLayer_inside_decor2 = map.createBlankLayer('Buildings_inside_decor2', tilesetMain, 0, 0);
        this.buildingLayer_inside = map.createBlankLayer('Buildings_inside', tilesetMain, 0, 0);

        this.buildingCollisionLayer = map.createBlankLayer('BuildingCollisions', tilesetMain, 0, 0);
        this.buildingCollisionLayer.setAlpha(0);
        this.treeCollisionLayer = map.createBlankLayer('TreeCollisions', tilesetMain, 0, 0);
        this.treeGroup = this.add.group();
        
        this.buildingLayer.setDepth(200);
        this.buildingLayer_inside.setDepth(196);
        this.buildingLayer_inside_floor.setDepth(197);
        this.buildingLayer_inside_decor.setDepth(198);
        this.buildingLayer_inside_decor2.setDepth(199);

        this.cropLayerBottom = map.createBlankLayer('CropBottom', tilesetMain, 0, 0);
        this.cropLayerTop = map.createBlankLayer('CropTop', tilesetMain, 0, 0);

        this.cropLayerBottom.setDepth(240); 
        this.cropLayerTop.setDepth(250);   

        this.populateLayerFromArray(this.groundLayer, groundLayer);
        this.populateLayerFromArray(this.groundLayer2, groundLayer2);
        this.populateLayerFromArray(this.obstacleLayer, obstacleLayer);
        this.populateLayerFromArray(this.decorLayer, decorLayer);

this.enterableBuildings = [];
 this.walkBehindZones = [];

        //placeBuildingTiles(this, 23, 1, building_blue_small);
        //this.markBuildingObstacles(building_blue_small, 23, 1);
        //this.markWalkBehindDepthZones(building_blue_small, 23, 1,5);


        //placeBuildingTiles(this, 5, 1, building_blue_big);
        //this.markBuildingObstacles(building_blue_big, 5, 1);
        //this.markWalkBehindDepthZones(building_blue_big, 5, 1,6);

        //this.placeEnterableBuilding(5, 1, building_blue_big);

       
        
        

        this.placeTreeSprite(1, 2, 0, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(3, 2, 1, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(2, 3, 2, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(4, 3, 2, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(6, 2, 3, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(21, 3, 3, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(30, 4, 3, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(13, 3, 3, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(14, 4, 3, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(15, 2, 3, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(17, 4, 3, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeTreeSprite(18, 3, 3, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });


        this.placeTreeSprite(20, 5, 3, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });


        this.placeTreeSprite(23, 15, 3, {
          behindRows: 2,
          blockRows: 1,
          allowInFront: true
        });

        this.placeCropTile(0, 6, 1075, 1139); 
        this.placeCropTile(0, 7, 1075, 1139); 
        this.placeCropTile(0, 8, 1075, 1139);
        this.placeCropTile(0, 9, 1075, 1139);

        this.placeCropTile(1, 6, 1075, 1139); 
        this.placeCropTile(1, 7, 1075, 1139); 

        this.placeCropTile(1, 9, 1075, 1139);



        // Pathfinding setup
        this.pathfinder = new EasyStar.js();

        // === Entities setup ===
        this.entities = [];
        //const centerX = Math.floor(mapWidth / 2);
        //const centerY = Math.floor(mapHeight / 2);
        //const spawnPos1 = this.findNearestWalkableTile(centerX, centerY);
        //const spawnPos2 = this.findNearestWalkableTile(centerX + 5, centerY + 5);

        // Animations
        this.createBodyAnimations(this, 'base', 9, 8);

        this.hairstyles.forEach(hair => {
        this.createBodyAnimations(this, `${hair}hair`, 9, 8);
        });

        this.createBodyAnimations(this, 'tools', 9, 8);


this.initBuildingManager();

        const spawn1 = this.findNearestWalkableTile(10, 7);
        const player1 = new Entity(this, spawn1.x, spawn1.y, {
            base: 'base',
            hair: 'mop'
        }, this.pathfinder);

        const spawn2 = this.findNearestWalkableTile(10, 9);
        const player2 = new Entity(this, spawn2.x, spawn2.y, {
            base: 'base',
            hair: 'long'
        }, this.pathfinder);

        this.entities.push(player1);
        this.entities.push(player2);




        this.selectedEntity = player1;
        this.selectedEntity.setSelected(true);

        this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
        this.cameras.main.setZoom(2);
        this.cameras.main.setScroll(this.selectedEntity.sprite.x - this.cameras.main.width / 2, this.selectedEntity.sprite.y - this.cameras.main.height / 2);

        const cameraPadding = 48;
        this.cameras.main.setBounds(
            -cameraPadding,
            -cameraPadding,
            mapWidth * tileSize + cameraPadding * 2,
            mapHeight * tileSize + cameraPadding * 2
        );



        // Click marker
        this.clickMarker = this.add.graphics();
        this.clickMarker.lineStyle(2, 0xffd900, 1);
        this.clickMarker.strokeCircle(0, 0, 10);
        this.clickMarker.setVisible(false);

        // Mouse input
        this.input.on('pointerdown', pointer => {
            const worldX = pointer.worldX;
            const worldY = pointer.worldY;

            if (pointer.leftButtonDown()) {
                let clickedEntity = null;
                for (const entity of this.entities) {
                    const dist = Phaser.Math.Distance.Between(entity.sprite.x, entity.sprite.y, worldX, worldY);
                    if (dist < 24) {
                        clickedEntity = entity;
                        break;
                    }
                }

                if (clickedEntity) {
                    if (this.selectedEntity !== clickedEntity) {
                        if(this.selectedEntity != null)
                            this.selectedEntity.setSelected(false);

                        this.selectedEntity = clickedEntity;
                        this.selectedEntity.setSelected(true);
                    }
                }
                else if (pointer.leftButtonDown() && this.selectedEntity != null) 
                {
                    this.selectedEntity.setSelected(false);
                    this.selectedEntity = null;
                }

            } else if (pointer.rightButtonDown()) {
                if (this.selectedEntity) {
                    this.selectedEntity.moveTo(worldX, worldY);
                    const tileX = this.groundLayer.worldToTileX(worldX);
                    const tileY = this.groundLayer.worldToTileY(worldY);
                    const snappedX = this.groundLayer.tileToWorldX(tileX) + this.groundLayer.tilemap.tileWidth / 2;
                    const snappedY = this.groundLayer.tileToWorldY(tileY) + this.groundLayer.tilemap.tileHeight / 2;
                    this.clickMarker.setPosition(snappedX, snappedY);

                    this.clickMarker.setVisible(true);
                }
            }
        });
    }

update(time, delta) {

  const camera = this.cameras.main;
  const cameraMove = this.cameraPanSpeed * (delta / 1000);

  if (this.cursors.left.isDown || this.keys.A.isDown) {
      camera.scrollX -= cameraMove;
  }
  if (this.cursors.right.isDown || this.keys.D.isDown) {
      camera.scrollX += cameraMove;
  }
  if (this.cursors.up.isDown || this.keys.W.isDown) {
      camera.scrollY -= cameraMove;
  }
  if (this.cursors.down.isDown || this.keys.S.isDown) {
      camera.scrollY += cameraMove;
  }

  for (const entity of this.entities) {
      entity.update(delta);
  }

  this.entities.forEach(entity => {
    const playerX = entity.sprite.x;
    const playerBottomY = entity.sprite.y + entity.visualOffsetY;

    let depth = entity.baseDepth;

    for (const zone of this.walkBehindZones) {
      if (
        playerX >= zone.x &&
        playerX <= zone.x + zone.width &&
        playerBottomY < zone.y + zone.height
      ) {
        if (zone.type === 'tree'  || zone.type === 'crop') {
          depth = zone.y - 1;
        } else if (zone.type === 'building') {
          depth = zone.depth-1 ?? zone.y - 1; 
        }
        break;
      }
    }

entity.sprite.setDepth(depth);

    
  });


/*
//red squares debug for walk behind zones
  if (!this.debugGraphics) {
    this.debugGraphics = this.add.graphics().setDepth(9999);
  }
  this.debugGraphics.clear();

  this.debugGraphics.lineStyle(1, 0xff0000, 1);
  for (const zone of this.walkBehindZones) {
    this.debugGraphics.strokeRect(zone.x, zone.y, zone.width, zone.height);
  }

  if (this.selectedEntity) {
  const bottomY =  this.selectedEntity.sprite.y + this.selectedEntity.visualOffsetY;
    this.debugGraphics.lineStyle(1, 0x00ff00, 1);
    this.debugGraphics.strokeLineShape(new Phaser.Geom.Line(0, bottomY, this.scale.width, bottomY));
  }
*/

  if (this.selectionPointer) {
      if (this.selectedEntity) {
          this.selectionPointer.setVisible(true);
          this.selectionPointer.x = this.selectedEntity.sprite.x;
          this.selectionPointer.y = this.selectedEntity.sprite.y - 12; 
      } else {
          this.selectionPointer.setVisible(false);
      }
  }

this.buildings.forEach(building => {
    const bounds = {
        x: building.x * 16,
        y: building.y * 16,
        width: building.width * 16,
        height: building.height * 16
    };

    const anyInside = this.entities.some(e =>
        Phaser.Geom.Rectangle.Contains(
            new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height),
            e.sprite.x,
            e.sprite.y
        )
    );

    if (anyInside && building.visible && !building.isFadingOut) {
        this.enterBuilding(building);
    } else if (!anyInside && !building.visible && !building.isFadingOut) {
        this.exitBuilding(building);
    }
});



}


createBodyAnimations(scene, keyPrefix, idleFrames, runFrames) {
    if (!scene.anims.exists(`${keyPrefix}_idle`)) {
        scene.anims.create({
            key: `${keyPrefix}_idle`,
            frames: scene.anims.generateFrameNumbers(`${keyPrefix}_idle`, { start: 0, end: idleFrames - 1 }),
            frameRate: 18,
            repeat: -1
        });
    }

    if (!scene.anims.exists(`${keyPrefix}_run`)) {
        scene.anims.create({
            key: `${keyPrefix}_run`,
            frames: scene.anims.generateFrameNumbers(`${keyPrefix}_run`, { start: 0, end: runFrames - 1 }),
            frameRate: 16,
            repeat: -1
        });
    }
}

populateLayerFromArray(layer, array) {
    for (let y = 0; y < array.length; y++) {
        for (let x = 0; x < array[y].length; x++) {
            const tileId = array[y][x];
            if (tileId !== -1) {
                layer.putTileAt(tileId, x, y);
            }
        }
    }
}

populateLayoutToLayer(layer, tileArray, startX, startY) {
    for (let y = 0; y < tileArray.length; y++) {
        for (let x = 0; x < tileArray[y].length; x++) {
            const tileId = tileArray[y][x];
            if (tileId !== -1) {
                layer.putTileAt(tileId, startX + x, startY + y);
            }
        }
    }
}


placeTreeSprite(tileX, tileY, frame = 0, options = { behindRows: 2, blockRows: 2, allowInFront: false }) {
  const tileSize = 16;
  const worldX = tileX * tileSize;
  const worldY = tileY * tileSize;


  const sprite = this.add.sprite(worldX, worldY, 'trees', frame);
  sprite.setOrigin(0.5, 0.5); 
  sprite.setDepth(worldY + sprite.displayHeight / 2); 
  sprite.allowInFront = options.allowInFront;

  this.treeGroup.add(sprite);

  const visualBottom = worldY + sprite.displayHeight / 2;
  const zoneHeight = tileSize * options.behindRows;
  const zoneY = visualBottom - zoneHeight;

  this.walkBehindZones.push({
    x: worldX - tileSize, 
    y: zoneY,
    width: tileSize * 2,
    height: zoneHeight,
    type: 'tree'
  });



  if (!options.allowInFront) {
    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < options.blockRows; dy++) {
        this.treeCollisionLayer.putTileAt(1, tileX + dx, tileY - dy);
      }
    }
  }
}

initBuildingManager() {
    this.buildings = [];

    this.registerBuilding({
        x: 5,
        y: 1,
        layout: building_blue_big
    });

    this.registerBuilding({
        x: 23,
        y: 1,
        layout: building_blue_small
    });
}

registerBuilding({ x, y, layout }) {
    const building = {
        x, y,
        width: layout.tiles[0].length,
        height: layout.tiles.length,
        layout,
        visible: true,
        isFadingOut: false,
    };
    this.buildings.push(building);
    this.placeEnterableBuilding(x, y, layout); 

}

placeEnterableBuilding(startX, startY, layout) {
    const tileSize = 16;
    const worldX = startX * tileSize;
    const worldY = startY * tileSize;

    // Store metadata
    const footprint = {
        x: worldX,
        y: worldY,
        width: layout.tiles[0].length * tileSize,
        height: layout.tiles.length * tileSize,
        tiles: layout.tiles,
        layout,
        startX,
        startY,
        active: true
    };

    // Place exterior
    this.populateLayoutToLayer(this.buildingLayer, layout.tiles, startX, startY);
    this.buildingLayer_inside_floor.setAlpha(0);
    this.buildingLayer_inside.setAlpha(0);
    this.buildingLayer_inside_decor.setAlpha(0);
    this.buildingLayer_inside_decor2.setAlpha(0);
    // Store collision
    this.markBuildingObstacles(layout, startX, startY);

    // Mark walk-behind zones
    this.markWalkBehindDepthZones(layout, startX, startY, 6);

    // Only place interior if defined
    if (layout.tiles_inside_floor) {
        this.enterableBuildings.push(footprint);
        this.populateLayoutToLayer(this.buildingLayer_inside_floor, layout.tiles_inside_floor, startX, startY);  
        this.populateLayoutToLayer(this.buildingLayer_inside_decor, layout.tiles_inside_decor1 || [], startX, startY);
        this.populateLayoutToLayer(this.buildingLayer_inside_decor2, layout.tiles_inside_decor2 || [], startX, startY);
        this.populateLayoutToLayer(this.buildingLayer_inside, layout.tiles_inside, startX, startY);
    }
}


markBuildingObstacles(layout, startX, startY) {
    const tiles = layout.tiles;
    const rule = layout.obstacleRule || (() => false); 
    const doors = layout.doors || [];
    for (let y = 0; y < tiles.length; y++) {
        for (let x = 0; x < tiles[y].length; x++) {
          const isDoor = doors.some(d => d.x === x && d.y === y);
          if (!isDoor && rule(x, y, tiles)) {
            this.buildingCollisionLayer.putTileAt(1, startX + x, startY + y); 
          }
        }
    }
}

fadeLayer(layer, alpha, duration = 300) {
    this.tweens.add({
        targets: layer,
        alpha,
        duration,
        ease: 'Linear'
    });
}

hideBuildingExterior(footprint) {
  console.log("HIDE?");
    const { tiles, startX, startY } = footprint;
    for (let y = 0; y < tiles.length; y++) {
        for (let x = 0; x < tiles[y].length; x++) {
            this.buildingLayer.removeTileAt(startX + x, startY + y);
        }
    }
    // Optional: remove collision
    for (let y = 0; y < tiles.length; y++) {
        for (let x = 0; x < tiles[y].length; x++) {
            this.buildingCollisionLayer.removeTileAt(startX + x, startY + y);
        }
    }
}

restoreBuildingExterior(footprint) {
    this.populateLayoutToLayer(this.buildingLayer, footprint.layout.tiles, footprint.startX, footprint.startY);
    this.markBuildingObstacles(footprint.layout, footprint.startX, footprint.startY);
}

enterBuilding(building) {
    if (!building.layout.tiles_inside || building.isFadingOut) return;

    const duration = 300; // milliseconds
    const tilesToRemove = [];

    for (let y = 0; y < building.layout.tiles.length; y++) {
        for (let x = 0; x < building.layout.tiles[0].length; x++) {
            const tile = this.buildingLayer.getTileAt(building.x + x, building.y + y);
            if (tile) {
                tile.alpha = 1;
                tilesToRemove.push({ x: building.x + x, y: building.y + y });
            }
        }
    }

    console.log("FADE", building.isFadingOut);
    building.isFadingOut = true;
    console.log("FADE", building.isFadingOut);
    // Animate alpha fade-out on the tile layer
    this.tweens.add({
        targets: tilesToRemove.map(({ x, y }) => this.buildingLayer.getTileAt(x, y)),
        alpha: 0,
        duration,
        ease: 'Linear',
        onComplete: () => {
          console.log("COMPLETE");
            // After fading, remove tiles and collisions
            for (const { x, y } of tilesToRemove) {
                this.buildingLayer.removeTileAt(x, y);
                this.buildingCollisionLayer.removeTileAt(x, y);
                building.visible = false;
                building.isFadingOut = false;
            }
        }
    });
    
    // Draw interior floor
    this.buildingLayer_inside_floor.setAlpha(1);
    this.buildingLayer_inside.setAlpha(1);
    this.buildingLayer_inside_decor.setAlpha(1);
    this.buildingLayer_inside_decor2.setAlpha(1);
   
    /*
    this.fadeLayer(this.buildingLayer_inside_floor, 1,1);
    this.fadeLayer(this.buildingLayer_inside, 1,1);
    this.fadeLayer(this.buildingLayer_inside_decor, 1,1);
    this.fadeLayer(this.buildingLayer_inside_decor2, 1,1);
    */
    // Force pathfinder to rebuild
    this.entities.forEach(e => { e.gridGenerated = false; });

    
}

exitBuilding(building) {
    // Check for entities still inside
    const tileSize = 16;
    const worldX = building.x * tileSize;
    const worldY = building.y * tileSize;
    const width = building.width * tileSize;
    const height = building.height * tileSize;

    const anyoneInside = this.entities.some(e => {
        return (
            e.sprite.x >= worldX &&
            e.sprite.x <= worldX + width &&
            e.sprite.y >= worldY &&
            e.sprite.y <= worldY + height
        );
    });

    if (anyoneInside) return; // defer restoration

    // Restore outside
    this.populateLayerFromArrayOffset(this.buildingLayer, building.layout.tiles, building.x, building.y);
    this.markBuildingObstacles(building.layout, building.x, building.y);
    this.buildingLayer.setAlpha(.5);
    // Remove inside tiles
  this.fadeLayer(this.buildingLayer_inside_floor, 0);
  this.fadeLayer(this.buildingLayer_inside, 0);
  this.fadeLayer(this.buildingLayer_inside_decor, 0);
  this.fadeLayer(this.buildingLayer_inside_decor2, 0);
  // Force pathfinder to rebuild
  this.entities.forEach(e => { e.gridGenerated = false; });

    building.visible = true;
    this.fadeLayer(this.buildingLayer, 1); // fade building exterior in again
}

populateLayerFromArrayOffset(layer, array, startX, startY) {
    for (let y = 0; y < array.length; y++) {
        for (let x = 0; x < array[y].length; x++) {
            const tileId = array[y][x];
            if (tileId !== -1) {
                layer.putTileAt(tileId, startX + x, startY + y);
            }
        }
    }
}

clearLayerArea(layer, startX, startY, width, height) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            layer.removeTileAt(startX + x, startY + y);
        }
    }
}



markWalkBehindDepthZones(layout, startX, startY, depthVal) {
  const rule = layout.walkBehindRule;
  if (!rule) return;

  const tileSize = 16;
  const height = layout.walkBehindHeight || 1;

  const alreadyMarked = new Set();

  for (let y = 0; y < layout.tiles.length; y++) {
    for (let x = 0; x < layout.tiles[y].length; x++) {
      if (rule(x, y) && !alreadyMarked.has(`${x},${y}`)) {
        let spanX = 1;
        while (
          x + spanX < layout.tiles[y].length &&
          rule(x + spanX, y)
        ) {
          alreadyMarked.add(`${x + spanX},${y}`);
          spanX++;
        }

        const worldX = (startX + x) * tileSize;
        const worldY = (startY + y) * tileSize;

        this.walkBehindZones.push({
          x: worldX,
          y: worldY,
          width: spanX * tileSize,
          height: tileSize * height,
          type: 'building', 
          depth: depthVal 
        });

      }
    }
  }

  
}

placeCropTile(tileX, tileY, topTileIndex, bottomTileIndex, options = { behindRows: 1 }) {
  const tileSize = 16;
  const worldX = tileX * tileSize;
  const worldY = tileY * tileSize;

  this.cropLayerBottom.putTileAt(bottomTileIndex, tileX, tileY);
  this.cropLayerTop.putTileAt(topTileIndex, tileX, tileY - 1);

  const zoneY = (tileY - options.behindRows) * tileSize;
  this.walkBehindZones.push({
    x: worldX,
    y: zoneY,
    width: tileSize,
    height: tileSize * options.behindRows,
    type: 'crop'
  });
}


buildPathfindingGrid() {
    const grid = [];

    for (let y = 0; y < this.groundLayer.height; y++) {
        const row = [];
        for (let x = 0; x < this.groundLayer.width; x++) {
            const obstacleTile = this.obstacleLayer.getTileAt(x, y);
            const groundTile = this.groundLayer.getTileAt(x, y);

            const treeTile = this.treeCollisionLayer.getTileAt(x, y);
            const buildingTile = this.buildingCollisionLayer.getTileAt(x, y);
            const buildingInteriorObject = this.buildingLayer_inside_decor.getTileAt(x,y);
            const buildingInteriorWalls = this.buildingLayer_inside.getTileAt(x,y);
            const cropTile = this.cropLayerBottom.getTileAt(x,y);
            const isObstacle = obstacleTile || treeTile || buildingTile || buildingInteriorWalls || buildingInteriorObject || cropTile;

            const isWater = groundTile && groundTile.index === 68;

            if (isObstacle || isWater) {
                row.push(1); 
            } else {
                row.push(0); 
            }
        }
        grid.push(row);
    }

    return grid;
}




findNearestWalkableTile(centerX, centerY, maxRadius = 10) {
    const tileSize = 16;

    for (let r = 0; r <= maxRadius; r++) {
        for (let dx = -r; dx <= r; dx++) {
            for (let dy = -r; dy <= r; dy++) {
                if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;

                const x = centerX + dx;
                const y = centerY + dy;

                const worldX = x * tileSize + tileSize / 2;
                const worldY = y * tileSize + tileSize / 2;

                if (this.isWalkableTile(worldX, worldY)) {
                    return { x: worldX, y: worldY };
                }
            }
        }
    }
    return { x: centerX * tileSize + tileSize / 2, y: centerY * tileSize + tileSize / 2 };
}

parseTsx(tsxText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(tsxText, 'text/xml');
  const tiles = xml.getElementsByTagName('tile');
  const props = {};

  for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const id = parseInt(tile.getAttribute('id'), 10);
      const propertyNodes = tile.getElementsByTagName('property');
      const tileProps = {};

      for (let j = 0; j < propertyNodes.length; j++) {
          const propNode = propertyNodes[j];
          const name = propNode.getAttribute('name');
          const type = propNode.getAttribute('type') || 'string';
          const valueAttr = propNode.getAttribute('value');
          let value = valueAttr;

          if (type === 'bool') {
              value = valueAttr === 'true';
          } else if (type === 'int') {
              value = parseInt(valueAttr, 10);
          } else if (type === 'float') {
              value = parseFloat(valueAttr);
          }

          tileProps[name] = value;
      }

      if (tileProps.include == true && tileProps.category && tileProps.weight != null) 
      {
          const isOrigin = tileProps.objectOrigin === undefined || tileProps.objectOrigin === true;

          if (!this.tileCategoryMap[tileProps.category]) {
              //this.tileCategoryMap[tileProps.category] = [];
              console.error("this category isnt on our Category map",tileProps.category);
          }
          else if(isOrigin)
          {
              this.tileCategoryMap[tileProps.category].push({
                  tileset: this.tileCategoryTileSets[tileProps.category],
                  index: id,
                  weight: tileProps.weight,
                  objectWidth: tileProps.objectWidth || 1,
                  objectHeight: tileProps.objectHeight || 1
              });
          }


      }

      props[id] = tileProps;
  }

  return props;
}
   

canPlaceObject(layer, x, y, width, height, layersToCheck) {
    for (let dx = 0; dx < width; dx++) {
        for (let dy = 0; dy < height; dy++) {
            const nx = x + dx;
            const ny = y + dy;

            if (layer.hasTileAt(nx, ny)) return false;

            for (let i = 0; i < layersToCheck.length; i++) {
                if (layersToCheck[i].hasTileAt(nx, ny)) return false;
            }
        }
    }
    return true;
}

placeObject(layer, x, y, tile) {

    const tilesetColumns = this.tilesetColumnsLookup[tile.tileset];

    const rowOffset = Math.floor(tile.index / tilesetColumns);
    const colOffset = tile.index % tilesetColumns;

    for (let dy = 0; dy < tile.objectHeight; dy++) {
        for (let dx = 0; dx < tile.objectWidth; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            const targetCol = colOffset + dx;
            const targetRow = rowOffset + dy;
            const targetIndex = targetRow * tilesetColumns + targetCol;
            layer.putTileAt(targetIndex, nx, ny);
        }
    }
}


isWalkableTile(worldX, worldY) {
    const tileX = this.obstacleLayer.worldToTileX(worldX);
    const tileY = this.obstacleLayer.worldToTileY(worldY);

    const obstacleTile = this.obstacleLayer.getTileAt(tileX, tileY);

    if (obstacleTile) {
        const tileProps = this.tilesetProperties['tiles-obstacles'][obstacleTile.index];
        if (tileProps && tileProps.collides) {
            return false;
        }
    }
    return true;
}

}
