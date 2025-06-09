// tile-utils.js

/**
 * Picks a random tile based on weights.
 * Returns an object: { tileset, index }
 * 
 * @param {Array} tileSetMappingArray
 */
export function weightedRandomTile(tileSetMappingArray) {
    const totalWeight = tileSetMappingArray.reduce((sum, entry) => sum + entry.weight, 0);
    let random = Math.random() * totalWeight;

    for (const entry of tileSetMappingArray) {
        if (random < entry.weight) {
            // If index is an array → pick random index from that array
            const tileIndex = Array.isArray(entry.index)
                ? Phaser.Utils.Array.GetRandom(entry.index)
                : entry.index;
            return {
                tileset: entry.tileset,
                index: tileIndex,
                objectWidth: entry.objectWidth || 1,
                objectHeight: entry.objectHeight || 1,
            };
        }
        random -= entry.weight;
    }

    // Fallback (should not happen)
    return {
        tileset: tileSetMappingArray[0].tileset,
        index: tileSetMappingArray[0].index
    };
}
