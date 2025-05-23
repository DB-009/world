// PixiJS Grid-Based Town Simulator
class TownSimulator {
    constructor() {
        this.app = null;
        this.world = null;
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.keys = {};
        
        // Grid system
        this.TILE_SIZE = 32; // Each grid tile is 32x32 pixels
        this.GRID_WIDTH = 50;
        this.GRID_HEIGHT = 40;
        this.grid = [];
        this.showGrid = true;
        
        this.init();
    }

    async init() {
        // Create PixiJS application
        this.app = new PIXI.Application();
        await this.app.init({
            width: 1000,
            height: 700,
            backgroundColor: 0x87CEEB, // Sky blue
            antialias: false, // Pixel art style
            resolution: 1
        });

        // Add to DOM
        document.body.appendChild(this.app.canvas);

        // Create world container
        this.world = new PIXI.Container();
        this.app.stage.addChild(this.world);

        // Initialize grid
        this.initializeGrid();

        // Generate the town
        this.generateTown();

        // Setup controls
        this.setupControls();

        // Start game loop
        this.app.ticker.add(() => this.update());
    }

    initializeGrid() {
        // Initialize 2D array for grid data
        this.grid = [];
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                this.grid[x][y] = {
                    type: 'grass', // grass, road, building, water, etc.
                    occupied: false,
                    building: null
                };
            }
        }
    }

    // Convert grid coordinates to world pixels
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.TILE_SIZE,
            y: gridY * this.TILE_SIZE
        };
    }

    // Convert world pixels to grid coordinates
    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.TILE_SIZE),
            y: Math.floor(worldY / this.TILE_SIZE)
        };
    }

    // Check if grid position is valid and available
    isValidGridPosition(gridX, gridY) {
        return gridX >= 0 && gridX < this.GRID_WIDTH && 
               gridY >= 0 && gridY < this.GRID_HEIGHT && 
               !this.grid[gridX][gridY].occupied;
    }

    // Set grid tile type and occupied status
    setGridTile(gridX, gridY, type, occupied = true, building = null) {
        if (gridX >= 0 && gridX < this.GRID_WIDTH && gridY >= 0 && gridY < this.GRID_HEIGHT) {
            this.grid[gridX][gridY].type = type;
            this.grid[gridX][gridY].occupied = occupied;
            this.grid[gridX][gridY].building = building;
        }
    }

    generateTown() {
        // Create ground first
        this.createGround();
        
        // Show grid lines
        if (this.showGrid) {
            this.createGridLines();
        }
        
        // Create roads in a grid pattern
        this.createGridRoads();
        
        // Create buildings on grid
        this.createGridBuildings();
        
        // Add decorations
        this.addGridDecorations();
    }

    createGround() {
        const ground = new PIXI.Graphics();
        ground.rect(0, 0, this.GRID_WIDTH * this.TILE_SIZE, this.GRID_HEIGHT * this.TILE_SIZE);
        ground.fill(0x8FBC8F); // Light green
        this.world.addChild(ground);
    }

    createGridLines() {
        const gridLines = new PIXI.Graphics();
        gridLines.stroke({ width: 1, color: 0x000000, alpha: 0.1 });

        // Vertical lines
        for (let x = 0; x <= this.GRID_WIDTH; x++) {
            gridLines.moveTo(x * this.TILE_SIZE, 0);
            gridLines.lineTo(x * this.TILE_SIZE, this.GRID_HEIGHT * this.TILE_SIZE);
        }

        // Horizontal lines
        for (let y = 0; y <= this.GRID_HEIGHT; y++) {
            gridLines.moveTo(0, y * this.TILE_SIZE);
            gridLines.lineTo(this.GRID_WIDTH * this.TILE_SIZE, y * this.TILE_SIZE);
        }

        this.world.addChild(gridLines);
    }

    createGridRoads() {
        // Main horizontal roads
        const horizontalRoads = [8, 16, 24, 32];
        horizontalRoads.forEach(y => {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                this.setGridTile(x, y, 'road');
                this.createRoadTile(x, y);
            }
        });

        // Main vertical roads
        const verticalRoads = [12, 20, 28, 36];
        verticalRoads.forEach(x => {
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                this.setGridTile(x, y, 'road');
                this.createRoadTile(x, y);
            }
        });
    }

    createRoadTile(gridX, gridY) {
        const pos = this.gridToWorld(gridX, gridY);
        const road = new PIXI.Graphics();
        road.rect(pos.x, pos.y, this.TILE_SIZE, this.TILE_SIZE);
        road.fill(0x696969); // Gray

        // Add road markings for center lines
        road.fill(0xFFFFFF);
        
        // Horizontal road markings
        if (this.grid[gridX][gridY].type === 'road' && gridY % 8 === 0) {
            road.rect(pos.x + 2, pos.y + this.TILE_SIZE/2 - 1, this.TILE_SIZE - 4, 2);
        }
        
        // Vertical road markings
        if (this.grid[gridX][gridY].type === 'road' && gridX % 8 === 0) {
            road.rect(pos.x + this.TILE_SIZE/2 - 1, pos.y + 2, 2, this.TILE_SIZE - 4);
        }

        this.world.addChild(road);
    }

    createGridBuildings() {
        // Residential area (top-left)
        this.createHouseCluster(2, 2, 8, 6);
        
        // Commercial area (bottom-left)
        this.createCommercialArea(2, 26, 8, 5);
        
        // Office district (right side)
        this.createOfficeDistrict(30, 10, 15, 12);
        
        // Parks and recreation
        this.createPark(22, 2, 4, 4);
        this.createPark(14, 18, 3, 4);
        
        // School
        this.createSchoolBuilding(14, 10, 4, 3);
        
        // Individual buildings
        this.placeBuilding(22, 18, () => this.createShop(0, 0, 0x4682B4, "SHOP"));
        this.placeBuilding(24, 18, () => this.createShop(0, 0, 0x32CD32, "CAFE"));
        this.placeBuilding(26, 18, () => this.createShop(0, 0, 0xFF69B4, "BANK"));
    }

    createHouseCluster(startX, startY, width, height) {
        const houseColors = [
            { wall: 0x8B4513, roof: 0xFF6347 },
            { wall: 0x654321, roof: 0x228B22 },
            { wall: 0xD2691E, roof: 0x4169E1 },
            { wall: 0xA0522D, roof: 0xFF4500 }
        ];

        for (let x = startX; x < startX + width; x += 2) {
            for (let y = startY; y < startY + height; y += 2) {
                if (this.isValidGridPosition(x, y) && this.isValidGridPosition(x+1, y+1)) {
                    const colorIndex = Math.floor(Math.random() * houseColors.length);
                    const colors = houseColors[colorIndex];
                    this.placeBuilding(x, y, () => this.createHouse(0, 0, colors.wall, colors.roof), 2, 2);
                }
            }
        }
    }

    createCommercialArea(startX, startY, width, height) {
        const shops = [
            { color: 0x4682B4, name: "SHOP" },
            { color: 0x32CD32, name: "CAFE" },
            { color: 0xFF69B4, name: "BANK" },
            { color: 0x9370DB, name: "DELI" },
            { color: 0xFF6347, name: "PIZZA" },
            { color: 0x20B2AA, name: "BOOKS" }
        ];

        let shopIndex = 0;
        for (let x = startX; x < startX + width; x += 3) {
            for (let y = startY; y < startY + height; y += 2) {
                if (this.isValidGridPosition(x, y)) {
                    const shop = shops[shopIndex % shops.length];
                    this.placeBuilding(x, y, () => this.createShop(0, 0, shop.color, shop.name), 3, 2);
                    shopIndex++;
                }
            }
        }
    }

    createOfficeDistrict(startX, startY, width, height) {
        for (let x = startX; x < startX + width; x += 4) {
            for (let y = startY; y < startY + height; y += 3) {
                if (this.isValidGridPosition(x, y)) {
                    this.placeBuilding(x, y, () => this.createOfficeBuilding(0, 0), 4, 3);
                }
            }
        }
    }

    createSchoolBuilding(gridX, gridY, width, height) {
        if (this.canPlaceBuilding(gridX, gridY, width, height)) {
            const pos = this.gridToWorld(gridX, gridY);
            const school = this.createSchool(pos.x, pos.y, width, height);
            this.world.addChild(school);
            
            // Mark grid as occupied
            for (let x = gridX; x < gridX + width; x++) {
                for (let y = gridY; y < gridY + height; y++) {
                    this.setGridTile(x, y, 'building', true, school);
                }
            }
        }
    }

    placeBuilding(gridX, gridY, buildingFactory, width = 2, height = 2) {
        if (this.canPlaceBuilding(gridX, gridY, width, height)) {
            const pos = this.gridToWorld(gridX, gridY);
            const building = buildingFactory();
            building.x = pos.x;
            building.y = pos.y;
            this.world.addChild(building);
            
            // Mark grid as occupied
            for (let x = gridX; x < gridX + width; x++) {
                for (let y = gridY; y < gridY + height; y++) {
                    this.setGridTile(x, y, 'building', true, building);
                }
            }
            return building;
        }
        return null;
    }

    canPlaceBuilding(gridX, gridY, width, height) {
        for (let x = gridX; x < gridX + width; x++) {
            for (let y = gridY; y < gridY + height; y++) {
                if (!this.isValidGridPosition(x, y)) {
                    return false;
                }
            }
        }
        return true;
    }

    createHouse(x, y, wallColor, roofColor) {
        const house = new PIXI.Container();
        const tileSize = this.TILE_SIZE;

        // House base (spans 2x2 tiles)
        const walls = new PIXI.Graphics();
        walls.rect(2, tileSize * 0.6, tileSize * 2 - 4, tileSize * 1.4 - 2);
        walls.fill(wallColor);
        house.addChild(walls);

        // Roof
        const roof = new PIXI.Graphics();
        roof.moveTo(0, tileSize * 0.6);
        roof.lineTo(tileSize, 0);
        roof.lineTo(tileSize * 2, tileSize * 0.6);
        roof.lineTo(0, tileSize * 0.6);
        roof.fill(roofColor);
        house.addChild(roof);

        // Door
        const door = new PIXI.Graphics();
        door.rect(tileSize - 6, tileSize * 1.5, 12, tileSize * 0.5 - 2);
        door.fill(0x8B4513);
        house.addChild(door);

        // Windows
        const windows = new PIXI.Graphics();
        windows.fill(0x87CEEB);
        windows.rect(8, tileSize, 12, 12);
        windows.rect(tileSize * 2 - 20, tileSize, 12, 12);
        house.addChild(windows);

        house.x = x;
        house.y = y;
        return house;
    }

    createShop(x, y, color, text) {
        const shop = new PIXI.Container();
        const tileSize = this.TILE_SIZE;

        // Shop base (spans 3x2 tiles)
        const base = new PIXI.Graphics();
        base.rect(0, 0, tileSize * 3, tileSize * 2);
        base.fill(color);
        shop.addChild(base);

        // Awning
        const awning = new PIXI.Graphics();
        awning.rect(-2, tileSize * 1.5, tileSize * 3 + 4, tileSize * 0.3);
        awning.fill(0xFF0000);
        shop.addChild(awning);

        // Window
        const window = new PIXI.Graphics();
        window.rect(tileSize * 0.5, tileSize * 0.3, tileSize * 2, tileSize * 0.8);
        window.fill(0x87CEEB);
        shop.addChild(window);

        // Door
        const door = new PIXI.Graphics();
        door.rect(tileSize * 1.3, tileSize * 1.1, tileSize * 0.4, tileSize * 0.4);
        door.fill(0x8B4513);
        shop.addChild(door);

        // Sign
        const signStyle = new PIXI.TextStyle({
            fontFamily: 'Courier New',
            fontSize: 8,
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        const sign = new PIXI.Text({ text: text, style: signStyle });
        sign.x = (tileSize * 3) / 2 - sign.width / 2;
        sign.y = 4;
        shop.addChild(sign);

        shop.x = x;
        shop.y = y;
        return shop;
    }

    createOfficeBuilding(x, y) {
        const building = new PIXI.Graphics();
        const tileSize = this.TILE_SIZE;

        // Building base (spans 4x3 tiles)
        building.rect(0, 0, tileSize * 4, tileSize * 3);
        building.fill(0x708090); // Slate gray

        // Windows in grid
        building.fill(0x87CEEB);
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                building.rect(tileSize * 0.5 + col * tileSize, tileSize * 0.5 + row * tileSize, 
                            tileSize * 0.6, tileSize * 0.6);
            }
        }

        building.x = x;
        building.y = y;
        return building;
    }

    createSchool(x, y, width, height) {
        const school = new PIXI.Container();
        const tileSize = this.TILE_SIZE;

        // Main building
        const base = new PIXI.Graphics();
        base.rect(0, tileSize * 0.5, tileSize * width, tileSize * height - tileSize * 0.5);
        base.fill(0xDC143C); // Crimson
        school.addChild(base);

        // Roof
        const roof = new PIXI.Graphics();
        roof.moveTo(0, tileSize * 0.5);
        roof.lineTo(tileSize * width / 2, 0);
        roof.lineTo(tileSize * width, tileSize * 0.5);
        roof.lineTo(0, tileSize * 0.5);
        roof.fill(0x8B0000); // Dark red
        school.addChild(roof);

        // Windows
        const windows = new PIXI.Graphics();
        windows.fill(0x87CEEB);
        for (let i = 0; i < width - 1; i++) {
            windows.rect(tileSize * 0.5 + i * tileSize, tileSize, tileSize * 0.4, tileSize * 0.4);
        }
        school.addChild(windows);

        // Sign
        const signStyle = new PIXI.TextStyle({
            fontFamily: 'Courier New',
            fontSize: 10,
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        const sign = new PIXI.Text({ text: 'SCHOOL', style: signStyle });
        sign.x = (tileSize * width) / 2 - sign.width / 2;
        sign.y = tileSize * 1.8;
        school.addChild(sign);

        school.x = x;
        school.y = y;
        return school;
    }

    createPark(gridX, gridY, width, height) {
        if (this.canPlaceBuilding(gridX, gridY, width, height)) {
            const pos = this.gridToWorld(gridX, gridY);
            const park = new PIXI.Container();
            const tileSize = this.TILE_SIZE;

            // Grass area
            const grass = new PIXI.Graphics();
            grass.rect(0, 0, tileSize * width, tileSize * height);
            grass.fill(0x228B22); // Forest green
            park.addChild(grass);

            // Trees
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    if (Math.random() > 0.7) {
                        const tree = this.createTree();
                        tree.x = x * tileSize + tileSize/2;
                        tree.y = y * tileSize + tileSize/2;
                        park.addChild(tree);
                    }
                }
            }

            // Pond in center if park is big enough
            if (width >= 3 && height >= 3) {
                const pond = new PIXI.Graphics();
                pond.ellipse(tileSize * width / 2, tileSize * height / 2, tileSize, tileSize * 0.7);
                pond.fill(0x0066CC);
                park.addChild(pond);
            }

            park.x = pos.x;
            park.y = pos.y;
            this.world.addChild(park);

            // Mark grid as occupied
            for (let x = gridX; x < gridX + width; x++) {
                for (let y = gridY; y < gridY + height; y++) {
                    this.setGridTile(x, y, 'park', true, park);
                }
            }
        }
    }

    createTree() {
        const tree = new PIXI.Container();

        // Trunk
        const trunk = new PIXI.Graphics();
        trunk.rect(-2, 5, 4, 10);
        trunk.fill(0x8B4513);
        tree.addChild(trunk);

        // Leaves
        const leaves = new PIXI.Graphics();
        leaves.ellipse(0, 0, 8, 8);
        leaves.fill(0x228B22);
        tree.addChild(leaves);

        return tree;
    }

    addGridDecorations() {
        // Add street lamps at intersections
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                if (this.grid[x][y].type === 'road') {
                    // Place lamp at some intersections
                    if ((x % 8 === 0 || y % 8 === 0) && Math.random() > 0.7) {
                        this.createStreetLamp(x, y);
                    }
                }
            }
        }
    }

    createStreetLamp(gridX, gridY) {
        const pos = this.gridToWorld(gridX, gridY);
        const lamp = new PIXI.Graphics();
        
        // Pole
        lamp.rect(pos.x + this.TILE_SIZE/2 - 1, pos.y + 8, 2, 16);
        lamp.fill(0x696969);
        
        // Light
        lamp.ellipse(pos.x + this.TILE_SIZE/2, pos.y + 8, 4, 3);
        lamp.fill(0xFFFF00);

        this.world.addChild(lamp);
    }

    setupControls() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Toggle grid with G key
            if (e.code === 'KeyG') {
                this.toggleGrid();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse wheel zoom
        this.app.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.camera.zoom = Math.max(0.3, Math.min(3, this.camera.zoom * zoomFactor));
        });
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
        // Remove all children and regenerate
        this.world.removeChildren();
        this.generateTown();
    }

    update() {
        // Camera movement
        const speed = 5 / this.camera.zoom;
        
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.camera.y += speed;
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.camera.y -= speed;
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            this.camera.x += speed;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            this.camera.x -= speed;
        }

        // Apply camera transform
        this.world.x = this.camera.x;
        this.world.y = this.camera.y;
        this.world.scale.set(this.camera.zoom);

        // Keep camera within bounds
        const worldWidth = this.GRID_WIDTH * this.TILE_SIZE;
        const worldHeight = this.GRID_HEIGHT * this.TILE_SIZE;
        const bounds = {
            minX: -worldWidth * this.camera.zoom + this.app.screen.width,
            maxX: 0,
            minY: -worldHeight * this.camera.zoom + this.app.screen.height,
            maxY: 0
        };

        this.camera.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.camera.x));
        this.camera.y = Math.max(bounds.minY, Math.min(bounds.maxY, this.camera.y));
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new TownSimulator();
}); 