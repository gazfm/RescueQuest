/* globals cc, cp, globals */

var Tile = cc.Class.extend({
    imageFilename: null,
    isSolid: false,
    ctor: function(imageFilename, isSolid) {
        "use strict";
        this.imageFilename = imageFilename;
        this.isSolid = isSolid;
    }
});


var TileFactory = cc.Class.extend({
    tileCache: null,
    nullTileCharacters: " ps0123456789",
    ctor: function() {
        "use strict";
        this.tileCache = {};
        this.tileCache[' '] = new Tile(null, false);
        this.tileCache['='] = new Tile("EarthBlock.png", true);
    },
    getTileForCharacter: function(c) {
        "use strict";
        return this.tileCache[c];
    }
});


//noinspection JSUnusedGlobalSymbols
var LevelMap = cc.Class.extend({
    width: 0,   //in tiles
    height: 0,  //in tiles
    tiles: null,
    playerStartPosition: null,
    princessPosition: null,
    baddyStartPositions: null,
    ctor: function(levelDefinition) {
        "use strict";
        this.width = levelDefinition.width;
        this.height = levelDefinition.height;
        this.tiles = [];
        this.baddyStartPositions = {};
        var tileFactory = new TileFactory();

        for(var y = 0; y < this.height; y++) {
            var row = [];
            for(var x = 0; x < this.width; x++) {
                var tileChar = levelDefinition.tiles[y][x];

                if("ps0123456789".indexOf(tileChar) > -1) {
                    //it's a special character to specify a characters starting position
                    var posX = (x + 0.5) * globals.config.tileSize;
                    var posY = (this.height - y - 0.5) * globals.config.tileSize;
                    var pos = cc.p(posX, posY);
                    if(tileChar === "p") {
                        this.princessPosition= pos;
                    } else if(tileChar === "s") {
                        this.playerStartPosition = pos;
                    } else {
                        var index = parseInt(tileChar);
                        this.baddyStartPositions[index] = pos;
                    }

                    tileChar = ' '; //replace with empty tile
                }

                row.push(tileFactory.getTileForCharacter(tileChar));

            }
            this.tiles.push(row);
        }
    },
    getCollisionShapes: function(rigidBody) {
        "use strict";
        var shapes = [];

        var levelWidth = this.getWidthInTiles();
        var levelHeight = this.getHeightInTiles();

        var maxint = 4294967295;
        var wallBottom = new cp.SegmentShape(rigidBody,
            cp.v(0, 0),
            cp.v(maxint, 0),
            0);// thickness of wall
        wallBottom.setElasticity(0.5);
        shapes.push(wallBottom);

        var wallLeft = new cp.SegmentShape(rigidBody,
            cp.v(0, 0),
            cp.v(0, maxint),
            0);// thickness of wall
        wallLeft.setElasticity(0.5);
        shapes.push(wallLeft);

        var wallRight = new cp.SegmentShape(rigidBody,
            cp.v(this.getWidthInPixels(), 0),
            cp.v(this.getWidthInPixels(), maxint),
            0);// thickness of wall
        wallLeft.setElasticity(0.5);
        shapes.push(wallRight);

        var tileSize=globals.config.tileSize;
        for(var y = 0; y < levelHeight; y++) {
            for (var x = 0; x < levelWidth; x++) {
                var t = this.tiles[y][x];
                if(t.isSolid) {
                    //add box
                    var box = new cp.BoxShape2(rigidBody,
                        {l:x*tileSize,
                            r:x*tileSize+tileSize,
                            b:(levelHeight-1-y)*tileSize,
                            t:(levelHeight-1-y)*tileSize+tileSize});
                    box.setElasticity(0.5);
                    shapes.push(box);
                }
            }
        }

        return shapes;
    },
    getWidthInTiles: function() {
        "use strict";
        return this.width;
    },
    getHeightInTiles: function() {
        "use strict";
        return this.height;
    },
    getWidthInPixels: function() {
        "use strict";
        return this.width * globals.config.tileSize;
    },
    getHeightInPixels: function() {
        "use strict";
        return this.height * globals.config.tileSize;
    }
});


