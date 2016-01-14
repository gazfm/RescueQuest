
var BaddySingleSpriteBase = cc.class.extend({
    sprite: null
});



var BaddyWalker = BaddySingleSpriteBase.extend({
    ctor: function(pos, levelMap) {

    }
});

var BaddyPathFollower = BaddySingleSpriteBase.extend({
    ctor: function(pos, path) {

    }
});


//TODO: make some sort of physics baddy base
var BaddyBouncer = BaddySingleSpriteBase.extend({
    ctor: function(pos) {

    }
});


var BaddyFactory = cc.class.extend({
    levelMap: null,
    ctor: function(levelMap) {
        this._super();
        this.levelMap = levelMap;
    },
    createFromJSON: function(definition) {
        var startPos;
        switch(definition.type) {
            case "walker":
                startPos = this.levelMap.getBaddyStartPosition(definition.start);
                return new BaddyWalker(startPos, this.levelMap);
                break;
            case "bouncer":
                startPos = this.levelMap.getBaddyStartPosition(definition.start);
                return new BaddyBouncer(startPos);
                break;
            case "pathFollower":
                startPos = this.levelMap.getBaddyStartPosition(definition.start);
                return new BaddyBouncer(startPos, definition.path);
                break;
        }
   }
});