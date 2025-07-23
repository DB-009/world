export function placeBuildingTiles(layer, startX, startY, layout) {
  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[y].length; x++) {
      const tileIndex = layout[y][x];
      if (tileIndex !== -1) {
        layer.putTileAt(tileIndex, startX + x, startY + y);
      }
    }
  }
}