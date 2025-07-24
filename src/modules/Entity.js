export class Entity {
    constructor(scene, x, y, config, pathfinder) {
        this.scene = scene;
        this.pathfinder = pathfinder;
        this.baseDepth = 1000;
        this.spriteKey = config.base;
        this.hairKey = config.hair;
        this.runSpeed = 100;
        this.visualOffsetY = 10; // Adjust this based on where the feet actually are
        //8 = half of 16 sprite + 2 for padding on wal behind detection

        // Create base and hair sprites
        this.baseSprite = scene.add.sprite(0, 0, `${this.spriteKey}_idle`, 0);
        this.hairSprite = scene.add.sprite(0, 0, `${this.hairKey}hair_idle`, 0);

        this.baseSprite.setDepth(this.baseDepth);
        // Put hair above base
        this.hairSprite.setDepth(this.baseDepth+1);

        this.toolSprite = scene.add.sprite(0, 0, `tools_idle`, 0);
        this.toolSprite.setDepth(this.baseDepth+2); // Above hair

        this.container = scene.add.container(x, y, [this.baseSprite, this.hairSprite, this.toolSprite]);
        scene.physics.add.existing(this.container);
        this.sprite = this.container; // Alias for compatibility with rest of code

        // Physics settings
        this.container.body.setCollideWorldBounds(true);

        this.path = [];
        this.targetTile = null;
        this.gridGenerated = false;

        this.lastMoveDirection = 'right';
        this.idleTimer = null;
        this.idleDelay = 500;
        this.isIdle = false;
        this.isSelected = false;
        this.setDepth(this.baseDepth);
    }

    setSelected(isSelected) {
        this.isSelected = isSelected;
    }

    moveTo(worldX, worldY) {
        const tileX = this.scene.groundLayer.worldToTileX(worldX);
        const tileY = this.scene.groundLayer.worldToTileY(worldY);

        if (!this.gridGenerated) {
            const grid = this.scene.buildPathfindingGrid();
            this.pathfinder.setGrid(grid);
            this.pathfinder.setAcceptableTiles([0]);
            this.gridGenerated = true;
        }

        const currentTileX = this.scene.groundLayer.worldToTileX(this.container.x);
        const currentTileY = this.scene.groundLayer.worldToTileY(this.container.y);

        this.pathfinder.findPath(currentTileX, currentTileY, tileX, tileY, (path) => {
            if (path && path.length > 0) {
                this.path = path;
                this.targetTile = this.path.shift();
            }
        });

        this.pathfinder.calculate();
    }

    update(delta) {
        const dt = delta / 1000;

        if (this.targetTile) {
            const tileWorldX = this.scene.groundLayer.tileToWorldX(this.targetTile.x) + 8;
            const tileWorldY = this.scene.groundLayer.tileToWorldY(this.targetTile.y) + 8;

            const dx = tileWorldX - this.container.x;
            const dy = tileWorldY - this.container.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 2) {
                if (this.path.length > 0) {
                    this.targetTile = this.path.shift();
                } else {
                    this.targetTile = null;
                    this.container.body.setVelocity(0);

                    if (!this.isIdle && !this.idleTimer) {
                        this.idleTimer = setTimeout(() => {
                            this.isIdle = true;
                            this.baseSprite.anims.play(`${this.spriteKey}_idle`, true);
                            this.hairSprite.anims.play(`${this.hairKey}hair_idle`, true);
                            this.toolSprite.anims.play(`tools_idle`, true);

                            const flip = this.lastMoveDirection === 'left';
                            this.baseSprite.flipX = flip;
                            this.hairSprite.flipX = flip;
                            this.toolSprite.flipX = flip;
                        }, this.idleDelay);
                    }
                    return;
                }
            } else {
                this.isIdle = false;
                if (this.idleTimer) {
                    clearTimeout(this.idleTimer);
                    this.idleTimer = null;
                }

                const vx = (dx / distance) * this.runSpeed;
                const vy = (dy / distance) * this.runSpeed;

                this.container.body.setVelocity(vx, vy);

                this.baseSprite.anims.play(`${this.spriteKey}_run`, true);
                this.hairSprite.anims.play(`${this.hairKey}hair_run`, true);
                this.toolSprite.anims.play(`tools_run`, true);

                if (Math.abs(vx) > Math.abs(vy)) {
                    this.lastMoveDirection = vx > 0 ? 'right' : 'left';
                    const flip = this.lastMoveDirection === 'left';
                    this.baseSprite.flipX = flip;
                    this.hairSprite.flipX = flip;
                    this.toolSprite.flipX = flip;
                }
            }
        } else {
            this.container.body.setVelocity(0);
            if (!this.isIdle && !this.idleTimer) {
                this.idleTimer = setTimeout(() => {
                    this.isIdle = true;
                    this.baseSprite.anims.play(`${this.spriteKey}_idle`, true);
                    this.hairSprite.anims.play(`${this.hairKey}hair_idle`, true);
                    this.toolSprite.anims.play(`tools_idle`, true);
                    const flip = this.lastMoveDirection === 'left';
                    this.baseSprite.flipX = flip;
                    this.hairSprite.flipX = flip;
                    this.toolSprite.flipX = flip;
                }, this.idleDelay);
            }
        }
    }

    setDepth(baseDepth) {
        this.container.setDepth(baseDepth);
    }
}
