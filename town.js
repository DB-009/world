// PixiJS Town Simulator
class TownSimulator {
    constructor() {
        this.app = null;
        this.world = null;
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.keys = {};
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

        // Generate the town
        this.generateTown();

        // Setup controls
        this.setupControls();

        // Start game loop
        this.app.ticker.add(() => this.update());
    }

    generateTown() {
        // Create ground
        this.createGround();
        
        // Create roads
        this.createRoads();
        
        // Create buildings
        this.createBuildings();
        
        // Add some decorations
        this.addDecorations();
    }

    createGround() {
        const ground = new PIXI.Graphics();
        ground.rect(0, 0, 2000, 1500);
        ground.fill(0x8FBC8F); // Light green
        this.world.addChild(ground);
    }

    createRoads() {
        const roads = new PIXI.Graphics();
        roads.fill(0x696969); // Gray

        // Main horizontal road
        roads.rect(0, 350, 2000, 80);
        roads.rect(0, 700, 2000, 80);
        roads.rect(0, 1050, 2000, 80);

        // Main vertical roads
        roads.rect(350, 0, 80, 1500);
        roads.rect(700, 0, 80, 1500);
        roads.rect(1050, 0, 80, 1500);
        roads.rect(1400, 0, 80, 1500);

        this.world.addChild(roads);

        // Add road markings
        this.addRoadMarkings();
    }

    addRoadMarkings() {
        const markings = new PIXI.Graphics();
        markings.fill(0xFFFFFF); // White

        // Horizontal road markings
        for (let x = 0; x < 2000; x += 60) {
            markings.rect(x, 385, 30, 4);
            markings.rect(x, 735, 30, 4);
            markings.rect(x, 1085, 30, 4);
        }

        // Vertical road markings
        for (let y = 0; y < 1500; y += 60) {
            markings.rect(385, y, 4, 30);
            markings.rect(735, y, 4, 30);
            markings.rect(1085, y, 4, 30);
            markings.rect(1435, y, 4, 30);
        }

        this.world.addChild(markings);
    }

    createBuildings() {
        // Residential houses
        this.createHouse(100, 100, 0x8B4513, 0xFF6347); // Brown with red roof
        this.createHouse(250, 120, 0x654321, 0x228B22); // Darker brown with green roof
        this.createHouse(150, 250, 0xD2691E, 0x4169E1); // Orange with blue roof
        
        this.createHouse(500, 80, 0x8B4513, 0xFF6347);
        this.createHouse(600, 180, 0x654321, 0x228B22);
        this.createHouse(520, 280, 0xD2691E, 0x4169E1);

        this.createHouse(850, 120, 0x8B4513, 0xFF6347);
        this.createHouse(950, 200, 0x654321, 0x228B22);

        // Commercial buildings
        this.createShop(100, 500, 0x4682B4, "SHOP"); // Blue shop
        this.createShop(250, 480, 0x32CD32, "CAFE"); // Green cafe
        this.createShop(500, 520, 0xFF69B4, "BANK"); // Pink bank

        // Larger buildings
        this.createOfficeBuilding(850, 500);
        this.createSchool(1200, 200);
        this.createPark(1200, 500);

        // Bottom row
        this.createHouse(120, 850, 0x8B4513, 0xFF6347);
        this.createHouse(280, 900, 0x654321, 0x228B22);
        this.createShop(500, 880, 0x9370DB, "DELI");
        this.createHouse(850, 920, 0xD2691E, 0x4169E1);
    }

    createHouse(x, y, wallColor, roofColor) {
        const house = new PIXI.Container();

        // House base
        const walls = new PIXI.Graphics();
        walls.rect(0, 20, 80, 60);
        walls.fill(wallColor);
        house.addChild(walls);

        // Roof
        const roof = new PIXI.Graphics();
        roof.moveTo(0, 20);
        roof.lineTo(40, 0);
        roof.lineTo(80, 20);
        roof.lineTo(0, 20);
        roof.fill(roofColor);
        house.addChild(roof);

        // Door
        const door = new PIXI.Graphics();
        door.rect(30, 50, 20, 30);
        door.fill(0x8B4513);
        house.addChild(door);

        // Windows
        const windows = new PIXI.Graphics();
        windows.fill(0x87CEEB);
        windows.rect(10, 35, 15, 15);
        windows.rect(55, 35, 15, 15);
        house.addChild(windows);

        house.x = x;
        house.y = y;
        this.world.addChild(house);
    }

    createShop(x, y, color, text) {
        const shop = new PIXI.Container();

        // Shop base
        const base = new PIXI.Graphics();
        base.rect(0, 0, 120, 80);
        base.fill(color);
        shop.addChild(base);

        // Awning
        const awning = new PIXI.Graphics();
        awning.rect(-5, 60, 130, 15);
        awning.fill(0xFF0000);
        shop.addChild(awning);

        // Window
        const window = new PIXI.Graphics();
        window.rect(20, 20, 80, 35);
        window.fill(0x87CEEB);
        shop.addChild(window);

        // Door
        const door = new PIXI.Graphics();
        door.rect(45, 55, 30, 25);
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
        sign.x = 60 - sign.width / 2;
        sign.y = 5;
        shop.addChild(sign);

        shop.x = x;
        shop.y = y;
        this.world.addChild(shop);
    }

    createOfficeBuilding(x, y) {
        const building = new PIXI.Graphics();
        building.rect(0, 0, 150, 120);
        building.fill(0x708090); // Slate gray

        // Windows in grid
        building.fill(0x87CEEB);
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                building.rect(15 + col * 30, 15 + row * 30, 20, 20);
            }
        }

        building.x = x;
        building.y = y;
        this.world.addChild(building);
    }

    createSchool(x, y) {
        const school = new PIXI.Container();

        // Main building
        const base = new PIXI.Graphics();
        base.rect(0, 20, 200, 100);
        base.fill(0xDC143C); // Crimson
        school.addChild(base);

        // Roof
        const roof = new PIXI.Graphics();
        roof.moveTo(0, 20);
        roof.lineTo(100, 0);
        roof.lineTo(200, 20);
        roof.lineTo(0, 20);
        roof.fill(0x8B0000); // Dark red
        school.addChild(roof);

        // Windows
        const windows = new PIXI.Graphics();
        windows.fill(0x87CEEB);
        for (let i = 0; i < 6; i++) {
            windows.rect(20 + i * 30, 40, 20, 20);
        }
        school.addChild(windows);

        // Sign
        const signStyle = new PIXI.TextStyle({
            fontFamily: 'Courier New',
            fontSize: 12,
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        const sign = new PIXI.Text({ text: 'SCHOOL', style: signStyle });
        sign.x = 100 - sign.width / 2;
        sign.y = 80;
        school.addChild(sign);

        school.x = x;
        school.y = y;
        this.world.addChild(school);
    }

    createPark(x, y) {
        const park = new PIXI.Container();

        // Grass area
        const grass = new PIXI.Graphics();
        grass.rect(0, 0, 180, 120);
        grass.fill(0x228B22); // Forest green
        park.addChild(grass);

        // Trees
        for (let i = 0; i < 6; i++) {
            const tree = this.createTree();
            tree.x = 20 + (i % 3) * 60;
            tree.y = 20 + Math.floor(i / 3) * 60;
            park.addChild(tree);
        }

        // Pond
        const pond = new PIXI.Graphics();
        pond.ellipse(90, 60, 30, 20);
        pond.fill(0x0066CC);
        park.addChild(pond);

        park.x = x;
        park.y = y;
        this.world.addChild(park);
    }

    createTree() {
        const tree = new PIXI.Container();

        // Trunk
        const trunk = new PIXI.Graphics();
        trunk.rect(15, 25, 10, 15);
        trunk.fill(0x8B4513);
        tree.addChild(trunk);

        // Leaves
        const leaves = new PIXI.Graphics();
        leaves.ellipse(20, 20, 15, 15);
        leaves.fill(0x228B22);
        tree.addChild(leaves);

        return tree;
    }

    addDecorations() {
        // Street lamps
        for (let x = 200; x < 1800; x += 200) {
            this.createStreetLamp(x, 330);
            this.createStreetLamp(x, 450);
            this.createStreetLamp(x, 680);
            this.createStreetLamp(x, 800);
        }

        // Trees along roads
        for (let i = 0; i < 20; i++) {
            const tree = this.createTree();
            tree.x = Math.random() * 1800 + 100;
            tree.y = Math.random() * 1300 + 100;
            
            // Make sure trees don't spawn on roads
            if ((tree.y > 340 && tree.y < 440) || 
                (tree.y > 690 && tree.y < 790) ||
                (tree.y > 1040 && tree.y < 1140) ||
                (tree.x > 340 && tree.x < 440) ||
                (tree.x > 690 && tree.x < 790) ||
                (tree.x > 1040 && tree.x < 1140) ||
                (tree.x > 1390 && tree.x < 1490)) {
                continue;
            }
            
            this.world.addChild(tree);
        }
    }

    createStreetLamp(x, y) {
        const lamp = new PIXI.Graphics();
        
        // Pole
        lamp.rect(0, 0, 4, 30);
        lamp.fill(0x696969);
        
        // Light
        lamp.ellipse(2, 0, 8, 6);
        lamp.fill(0xFFFF00);

        lamp.x = x;
        lamp.y = y;
        this.world.addChild(lamp);
    }

    setupControls() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse wheel zoom
        this.app.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.camera.zoom = Math.max(0.3, Math.min(2, this.camera.zoom * zoomFactor));
        });
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
        const bounds = {
            minX: -1500 * this.camera.zoom + this.app.screen.width,
            maxX: 0,
            minY: -1000 * this.camera.zoom + this.app.screen.height,
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