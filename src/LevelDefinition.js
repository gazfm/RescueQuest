/**
 * Created by garryf on 12/01/16.
 */

// Class Level contains all level definition stuff

var LevelDefinition = cc.Class.extend({
    width:0,
    height:0,
    tiles: null,
    ctor: function(tiles, width, height) {
        this.tiles = tiles;
        this.width = width;
        this.height = height;
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

    if(!valid) {
        throw "Invalid level definition";
    }

    return new LevelDefinition(levelJson.tiles, levelJson.width, levelJson.height)
}




