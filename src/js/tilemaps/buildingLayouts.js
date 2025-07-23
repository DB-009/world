export const building_blue_big = {
    tiles: [
    [-1, -1, 918, 919, 922, -1, -1],
    [980, 981, 982, 720, 986, 987, 988],
    [724, 725, 726, 728, 730, 731, 732],
    [788, 789, 790, 791, 794, 795, 796],
    [852, 791, 791, 1831, 791, 791, 860]
    ],
    obstacleRule: (x, y, layout) => y > 0,//blocks movement on these rows
    walkBehindRule: (x, y) => y === 0, // Player walks *behind* the first row
    walkBehindHeight: 4
};

export const building_blue_small = {
    tiles: [
    [672, 673, 674],
    [736, 737, 738],
    [800, 801, 802],
    [864, 865, 866]
    ],
    obstacleRule: (x, y, layout) => y > 0,
  walkBehindRule: (x, y) => y === 0,
  walkBehindHeight: 3
};