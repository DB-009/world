export function placeBuildingTiles(scene, startX, startY, layout) {
  
    const layer = scene.buildingLayer;
    for (let y = 0; y < layout.tiles.length; y++) {
      for (let x = 0; x < layout.tiles[y].length; x++) {
        const tileIndex = layout.tiles[y][x];
        if (tileIndex !== -1) {
          layer.putTileAt(tileIndex, startX + x, startY + y);
        }
      }
    }

  if(layout.tiles_inside != null)
  {
    const layer_inside = scene.buildingLayer_inside;
    for (let y = 0; y < layout.tiles_inside.length; y++) {
      for (let x = 0; x < layout.tiles_inside[y].length; x++) {
        const tileIndex = layout.tiles_inside[y][x];
        if (tileIndex !== -1) {
          layer_inside.putTileAt(tileIndex, startX + x, startY + y);
        }
      }
    }
  }

  if(layout.tiles_inside_floor != null)
  {
    const layer_inside = scene.buildingLayer_inside;
    for (let y = 0; y < layout.tiles_inside.length; y++) {
      for (let x = 0; x < layout.tiles_inside[y].length; x++) {
        const tileIndex = layout.tiles_inside[y][x];
        if (tileIndex !== -1) {
          layer_inside.putTileAt(tileIndex, startX + x, startY + y);
        }
      }
    }
  }

}