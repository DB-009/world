export class Entity {
    constructor(scene, x, y, spriteKey, pathfinder) {
        this.scene = scene;
        this.spriteKey = spriteKey;
        this.pathfinder = pathfinder;

        this.sprite = scene.physics.add.sprite(x, y, spriteKey, 0);
        this.sprite.setCollideWorldBounds(true);

        this.moveSpeed = 100; // pixels per second
        this.path = [];
        this.targetTile = null;
        this.gridGenerated = false;

        this.lastMoveDirection = 'down';
        this.idleTimer = null;
        this.idleDelay = 1500; // ms
        this.isIdle = false;

        this.isSelected = false;
    }

    setSelected(isSelected) {
        this.isSelected = isSelected;
        //this.sprite.setTint(isSelected ? 0xffff00 : 0xffffff);
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

        const currentTileX = this.scene.groundLayer.worldToTileX(this.sprite.x);
        const currentTileY = this.scene.groundLayer.worldToTileY(this.sprite.y);

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

            const dx = tileWorldX - this.sprite.x;
            const dy = tileWorldY - this.sprite.y;

            const distance = Math.hypot(dx, dy);
            if (distance < 2) {
                if (this.path.length > 0) {
                    this.targetTile = this.path.shift();
                } else {
                    this.targetTile = null;
                    this.sprite.setVelocity(0);
                    this.sprite.anims.stop();

                    if (!this.isIdle && !this.idleTimer) {
                        this.idleTimer = setTimeout(() => {
                            this.isIdle = true;
                            this.sprite.anims.play(`idle-${this.spriteKey}`, true);
                        }, this.idleDelay);
                    }
                    return;
                }
            } else {
                // Reset idle
                this.isIdle = false;
                if (this.idleTimer) {
                    clearTimeout(this.idleTimer);
                    this.idleTimer = null;
                }

                const vx = (dx / distance) * this.moveSpeed;
                const vy = (dy / distance) * this.moveSpeed;
                this.sprite.setVelocity(vx, vy);

                
                
                if (Math.abs(vx) > Math.abs(vy)) {
                    this.lastMoveDirection = vx > 0 ? 'right' : 'left';
                } else {
                    this.lastMoveDirection = vy > 0 ? 'down' : 'up';
                }

                this.sprite.anims.play(`walk-${this.spriteKey}`, true);                

                if (Math.abs(vx) > Math.abs(vy)) {
                    this.lastMoveDirection = vx > 0 ? 'right' : 'left';
                }

                this.sprite.flipX = this.lastMoveDirection === 'left';              
            }
        } else {
            this.sprite.setVelocity(0);
            if (!this.isIdle && !this.idleTimer) {
                this.idleTimer = setTimeout(() => {
                    this.isIdle = true;
                    
                    //this.sprite.anims.play(`idle-${this.lastMoveDirection}`, true);
                    this.sprite.anims.play(`idle-${this.spriteKey}`, true);
                    
                }, this.idleDelay);
            }
        }
    }
}
