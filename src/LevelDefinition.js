/**
 * Created by garryf on 12/01/16.
 */

/* Class Level contains all level definition stuff.
    Immutable, will be re-used when a level restarts
    Other classes e.g. Level, LevelMap etc. exist for a single instance of a level scene,
     (a single play on a level) and so can have mutable state, but not this one.
 */

var LevelDefinition = cc.Class.extend({
    width:0,
    height:0,
    tiles: null,
    baddies: null,
    ctor: function(tiles, width, height, baddies) {
        this.tiles = tiles;
        this.width = width;
        this.height = height;
        this.baddies = baddies;
    }
});

LevelDefinition.createFromJson = function(levelJson) {
    var valid = true;

    //TODO: remove global widths and heights? (or remove from level json)
    if(levelJson.width != globals.config.levelWidth)
        valid = false;
    if(levelJson.height != globals.config.levelHeight)
        valid = false;

    if(levelJson.tiles.length != levelJson.height)
        valid = false;

    for(var row = 0; row < levelJson.height; row++) {
        if(levelJson.tiles[row].length != levelJson.width)
            valid = false;
    }

    // TODO: validate baddies?

    if(!valid) {
        throw "Invalid level definition";
    }

    return new LevelDefinition(levelJson.tiles, levelJson.width, levelJson.height, levelJson.baddies)
}




