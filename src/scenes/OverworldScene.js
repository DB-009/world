import { weightedRandomTile } from '../modules/tile-utils.js';


export class OverworldScene extends Phaser.Scene {
    constructor() {
        super('OverworldScene');
    }

    preload() {
        // Load player
        this.load.spritesheet('bunny', 'assets/Dreamyland_assets/Sprites/Characters/Bunny/RUN/Run bunny.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        // Load tileset images
        this.load.image('tiles-grass-dirt', 'assets/Dreamyland_assets/Tileset/Autotile Grass and Dirt Path Tileset.png');
        this.load.image('tiles-obstacles', 'assets/Dreamyland_assets/Tileset/Nature Tileset.png');
        this.load.image('tiles-decor', 'assets/Dreamyland_assets/Tileset/Tileset floor detail.png');

        // Load TSX files as text (use your correct filenames here)
        this.load.text('ground-tsx', 'assets/tileSets/Ground.tsx');
        this.load.text('obstacle-tsx', 'assets/tileSets/Obstacles.tsx');
        this.load.text('decor-tsx', 'assets/tileSets/Decor.tsx');

        this.obstacleSpawnChance = 0.05;
        this.decorSpawnChance = 0.1;
    }

    create() {
        const screenWidth = this.sys.game.config.width;
        const screenHeight = this.sys.game.config.height;
        this.minPatchCount = 5;
        this.maxPatchCount = 10;

        this.minDirtWidth = 3;
        this.maxDirtWidth = 7;
        this.minDirtHeight = 3;
        this.maxDirtHeight = 7;
        this.tileCategoryMap = 
        {
            'GRASS': [],
            'DIRT': [],
            'DECOR': [],
            'DIRT_DECOR': [],
            'OBSTACLES': [],
        };

        this.tileCategoryTileSets = 
        {
            'GRASS': 'tiles-grass-dirt',
            'DIRT': 'tiles-grass-dirt',
            'DECOR': 'tiles-decor',
            'DIRT_DECOR': 'tiles-decor',
            'OBSTACLES': 'tiles-obstacles',
        };

        // === Parse TSX files ===
        this.tilesetProperties = {
            'tiles-grass-dirt': this.parseTsx(this.cache.text.get('ground-tsx')),
            'tiles-obstacles': this.parseTsx(this.cache.text.get('obstacle-tsx')),
            'tiles-decor': this.parseTsx(this.cache.text.get('decor-tsx'))
        };

        const tileSize = 16;
        const mapWidth = Math.ceil(screenWidth / tileSize);
        const mapHeight = Math.ceil(screenHeight / tileSize);


        // Empty map data
        const mapData = Array.from({ length: mapHeight }, () =>
            Array.from({ length: mapWidth }, () => 0)
        );

        const map = this.make.tilemap({
            data: mapData,
            tileWidth: tileSize,
            tileHeight: tileSize
        });

        // Add tilesets
        const tilesetGround = map.addTilesetImage('tiles-grass-dirt', null, tileSize, tileSize);
        const tilesetObstacles = map.addTilesetImage('tiles-obstacles', null, tileSize, tileSize);
        const tilesetDecor = map.addTilesetImage('tiles-decor', null, tileSize, tileSize);

        //store tilsetColumnSize for placement logic
        this.tilesetColumnsLookup = {};

        // For ground
        let tex = this.textures.get('tiles-grass-dirt').getSourceImage();
        this.tilesetColumnsLookup['tiles-grass-dirt'] = tex.width / 16;

        // For obstacles
        tex = this.textures.get('tiles-obstacles').getSourceImage();
        this.tilesetColumnsLookup['tiles-obstacles'] = tex.width / 16;

        // For decor
        tex = this.textures.get('tiles-decor').getSourceImage();
        this.tilesetColumnsLookup['tiles-decor'] = tex.width / 16;

        // Create layers
        this.groundLayer = map.createLayer(0, tilesetGround, 0, 0);
        this.obstacleLayer = map.createBlankLayer('Obstacles', tilesetObstacles, 0, 0);
        this.decorLayer = map.createBlankLayer('Decor', tilesetDecor, 0, 0);

        // === Fill ground layer ===
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                //const isDirt = Math.random() < 0.1;
                //const tileSetArray = isDirt ? this.tileCategoryMap.DIRT: this.tileCategoryMap.GRASS;
                const tileSetArray = this.tileCategoryMap.GRASS;
                const tile = weightedRandomTile(tileSetArray);

                this.groundLayer.putTileAt(tile.index, x, y);
            }
        }

        //== Place dirt layer ===
        this.perlinBasedDirt(mapWidth, mapHeight);


        // === Place clustered obstacles ===
        for (let y = 1; y < mapHeight-1; y++) {
            for (let x = 1; x < mapWidth-1; x++) {
                if (Math.random() < this.obstacleSpawnChance && !this.obstacleLayer.hasTileAt(x, y)) {

                let dirtCheck = this.checkGroundLayer(x,y,'dirt');
                if(dirtCheck == true)
                    continue;
                    this.tryPlaceClustered(this.obstacleLayer, this.tileCategoryMap['OBSTACLES'], x, y, [this.decorLayer] , .1);
                }
            }
        }

        // === Place clustered decor ===
        for (let y = 1; y < mapHeight-1; y++) {
            for (let x = 1; x < mapWidth-1; x++) {
                if (this.obstacleLayer.hasTileAt(x, y) ||  this.decorLayer.hasTileAt(x, y)) continue;

                let dirtCheck = this.checkGroundLayer(x,y,'dirt');
                if(dirtCheck == true)
                    continue;

                if (Math.random() < this.decorSpawnChance && !this.decorLayer.hasTileAt(x, y)) {
                    this.tryPlaceClustered(this.decorLayer, this.tileCategoryMap.DECOR, x, y, [this.obstacleLayer], .1);
                }
            }
        }

        // === Player setup ===
        const centerX = Math.floor(mapWidth / 2);
        const centerY = Math.floor(mapHeight / 2);
        const spawnPos = this.findNearestWalkableTile(centerX, centerY);

        this.player = this.physics.add.sprite(spawnPos.x, spawnPos.y, 'bunny', 0);
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Create player animations
        const directions = ['up', 'right', 'left', 'down'];
        directions.forEach((dir, row) => {
            this.anims.create({
                key: `walk-${dir}`,
                frames: this.anims.generateFrameNumbers('bunny', {
                    start: row * 8,
                    end: row * 8 + 7
                }),
                frameRate: 10,
                repeat: -1
            });
        });
    }

patchBasedDirt(mapWidth, mapHeight)
{
const patchCount = Phaser.Math.Between(this.minPatchCount, this.maxPatchCount);

for (let i = 0; i < patchCount; i++) {

    const patchCenterX = Phaser.Math.Between(1, mapWidth - 2);
    const patchCenterY = Phaser.Math.Between(1, mapHeight - 2);

    const patchWidth = Phaser.Math.Between(this.minDirtWidth, this.maxDirtWidth);
    const patchHeight = Phaser.Math.Between(this.minDirtHeight, this.maxDirtHeight);

    const halfWidth = Math.floor(patchWidth / 2);
    const halfHeight = Math.floor(patchHeight / 2);

    // Draw the dirt patch
    for (let y = patchCenterY - halfHeight; y <= patchCenterY + halfHeight; y++) {
        for (let x = patchCenterX - halfWidth; x <= patchCenterX + halfWidth; x++) {

            // Clamp to map bounds
            if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) continue;

            const tileSetArray = this.tileCategoryMap.DIRT;
            const tile = weightedRandomTile(tileSetArray);

            this.groundLayer.putTileAt(tile.index, x, y);

            // Optionally → place decor with some chance
            const decorChance = 0.1; // 10% chance per tile → adjust as desired
            if (Math.random() < decorChance && !this.decorLayer.hasTileAt(x, y)) {
                const decorTile = weightedRandomTile(this.tileCategoryMap.DIRT_DECOR);
                this.decorLayer.putTileAt(decorTile.index, x, y);
            }
        }
    }
}

}

perlinBasedDirt(mapWidth, mapHeight)
{
        // === Perlin noise setup ===
   
    const simplex = new SimplexNoise(); // Create a new SimplexNoise instance

    const noiseScale = 0.1;     // Lower = bigger smoother blobs
    const dirtThreshold = 0.8;  // Higher = less dirt, lower = more dirt
    const decorChance = 0.1;    // Chance of placing decor inside dirt

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {

            // Generate 2D noise value for this tile
            const noiseValue = simplex.noise2D(x * noiseScale, y * noiseScale);

            // Normalize from [-1,1] to [0,1]
            const normalizedNoise = (noiseValue + 1) / 2;

            let tileSetArray = this.tileCategoryMap.GRASS;

            if (normalizedNoise > dirtThreshold) {
                tileSetArray = this.tileCategoryMap.DIRT;

                // Optionally → place decor inside dirt
                if (Math.random() < decorChance && !this.decorLayer.hasTileAt(x, y)) {
                    const decorTile = weightedRandomTile(this.tileCategoryMap.DIRT_DECOR);
                    this.decorLayer.putTileAt(decorTile.index, x, y);
                }
            }

            // Place the ground tile (grass or dirt)
            const tile = weightedRandomTile(tileSetArray);
            this.groundLayer.putTileAt(tile.index, x, y);
        }
    }
}


findNearestWalkableTile(centerX, centerY, maxRadius = 10) {
    const tileSize = 16;

    for (let r = 0; r <= maxRadius; r++) {
        for (let dx = -r; dx <= r; dx++) {
            for (let dy = -r; dy <= r; dy++) {
                // Only check perimeter of current radius (avoids duplicates)
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

    // Fallback → just return center (unlikely)
    return { x: centerX * tileSize + tileSize / 2, y: centerY * tileSize + tileSize / 2 };
}

checkGroundLayer(x,y, typeCheck)
{
    const groundTile = this.groundLayer.getTileAt(x, y);

    let groundType = null;
    if (groundTile) {
        const groundProps = this.tilesetProperties['tiles-grass-dirt'][groundTile.index];
        groundType = groundProps?.groundType || null;
    }

    if (groundType === typeCheck &&  !this.decorLayer.hasTileAt(x, y))
    {
        if (Math.random() < this.decorSpawnChance ) 
        {
            const tile = weightedRandomTile(this.tileCategoryMap.DIRT_DECOR);
            this.decorLayer.putTileAt(tile.index, x, y);
        }
         return true;
    }

    return false;
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
                console.error("this category isnt on our Category map");
            }
            else if(isOrigin)
            {
                this.tileCategoryMap[tileProps.category].push({
                    tileset: this.tileCategoryTileSets[tileProps.category], // e.g. 'tiles-grass-dirt'
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


    tryPlaceClustered(layer, tileMappingArray, x, y, layersToCheck = [], clusterChance = 0.3, maxDepth = 2, depth = 0)
     {
        if (depth > maxDepth) return;

        for (let i = 0; i < layersToCheck.length; i++) {
            if (layersToCheck[i].hasTileAt(x, y)) {
                return; // Tile occupied → skip
            }
        }

        let dirtCheck = this.checkGroundLayer(x,y,'dirt');
        if(dirtCheck == false)
        {
            const tile = weightedRandomTile(tileMappingArray);
            if (this.canPlaceObject(layer, x, y, tile.objectWidth, tile.objectHeight, layersToCheck)) 
            {
                this.placeObject(layer, x, y, tile);
            }
        }

        const neighbors = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 }
        ];

        neighbors.forEach(offset => {
            const nx = x + offset.dx;
            const ny = y + offset.dy;

            if (!layer.hasTileAt(nx, ny) && Math.random() < clusterChance) {
                this.tryPlaceClustered(layer, tileMappingArray, nx, ny,layersToCheck, clusterChance * 0.7, maxDepth, depth + 1);
            }
        });
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


    checkCollisionAt(worldX, worldY) {
        const tileX = this.obstacleLayer.worldToTileX(worldX);
        const tileY = this.obstacleLayer.worldToTileY(worldY);

        const tile = this.obstacleLayer.getTileAt(tileX, tileY);

        if (tile) {
            const tileProps = this.tilesetProperties['tiles-obstacles'][tile.index];
            if (tileProps && tileProps.collides) {
                return true;
            }
        }

        return false;
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

    update() {
        const speed = 100;
        const { W, A, S, D } = this.keys;
        const cursors = this.cursors;

        let vx = 0;
        let vy = 0;

        if (W.isDown || cursors.up.isDown) vy -= 1;
        if (S.isDown || cursors.down.isDown) vy += 1;
        if (A.isDown || cursors.left.isDown) vx -= 1;
        if (D.isDown || cursors.right.isDown) vx += 1;

        const len = Math.hypot(vx, vy);
        if (len > 0) {
            vx = (vx / len) * speed;
            vy = (vy / len) * speed;

            const lookaheadDistance = 8;
            const lookaheadX = this.player.x + Math.sign(vx) * lookaheadDistance;
            const lookaheadY = this.player.y + Math.sign(vy) * lookaheadDistance;

            if (vx !== 0 && vy === 0) {
                if (this.checkCollisionAt(lookaheadX, this.player.y)) {
                    this.player.setVelocity(0);
                    this.player.anims.stop();
                    return;
                }
            }

            if (vy !== 0 && vx === 0) {
                if (this.checkCollisionAt(this.player.x, lookaheadY)) {
                    this.player.setVelocity(0);
                    this.player.anims.stop();
                    return;
                }
            }

            if (vx !== 0 && vy !== 0) {
                if (
                    this.checkCollisionAt(lookaheadX, this.player.y) ||
                    this.checkCollisionAt(this.player.x, lookaheadY)
                ) {
                    this.player.setVelocity(0);
                    this.player.anims.stop();
                    return;
                }
            }

            this.player.setVelocity(vx, vy);

            if (Math.abs(vx) > Math.abs(vy)) {
                this.player.anims.play(vx > 0 ? 'walk-right' : 'walk-left', true);
            } else {
                this.player.anims.play(vy > 0 ? 'walk-down' : 'walk-up', true);
            }
        } else {
            this.player.setVelocity(0);
            this.player.anims.stop();
        }
    }
}
