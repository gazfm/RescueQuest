
var BaddyBase = cc.Class.extend({
    layer: null,
    getLayer: function () {
        return this.layer;
    }
});


var BaddyWalker = BaddyBase.extend({
    levelWidthPx: 0,
    ctor: function(pos, levelMap) {
        this.layer = new cc.Sprite("#BadGuy1.png");
        this.layer.setPosition(pos);
        this.levelWidthPx = levelMap.getWidthInPixels();
    },
    update: function(dt) {
        this.layer.setPositionX((this.layer.getPositionX() + 5) % this.levelWidthPx);
    }
});


var BaddyPathFollower = BaddyBase.extend({
    pathPosition: 0,
    frames: 0,
    path: null,
    ctor: function(pos, path) {
        this.layer = new cc.Sprite("#BadGuy1.png");
        this.layer.setPosition(pos);
        this.path = path;

    },
    update: function(dt) {
        //TODO: warning, this assumes 60 FPS frame-rate (will change speed if gameplayFPS is changed)
        var dx= 0;
        var dy= 0;
        switch(this.path[this.pathPosition]) {
            case "u":
                dy = 1;
                break;
            case "d":
                dy = -1;
                break;
            case "l":
                dx = -1;
                break;
            case "r":
                dx = 1;
                break;
            case "U":
                dy = 2;
                break;
            case "D":
                dy = -2;
                break;
            case "L":
                dx = -2;
                break;
            case "R":
                dx = 2;
                break;
        }

        this.layer.setPositionX(this.layer.getPositionX() + dx);
        this.layer.setPositionY(this.layer.getPositionY() + dy);

        this.frames++;
        if(this.frames >= 64) {
            this.frames = 0;
            this.pathPosition = (this.pathPosition + 1) % this.path.length;
        }
    }
});


//TODO: make some sort of physics baddy base
var BaddyBouncer = BaddyBase.extend({
    angle: 0,
    pos: null,
    ctor: function(pos) {
        this.layer = new cc.Sprite("#BadGuy1.png");
        //this.layer.setPosition(pos);
        this.pos = pos;

    },
    update: function(dt) {
        this.angle += dt;
        this.layer.setPositionX(this.pos.x + 250 * Math.sin(this.angle));
        this.layer.setPositionY(this.pos.y + 250 * Math.cos(this.angle));
    }
});


var BaddyFactory = cc.Class.extend({
    levelMap: null,
    ctor: function(levelMap) {
        this.levelMap = levelMap;
    },
    createFromJSON: function(definition) {
        var startPos;
        switch(definition.type) {
            case "walker":
                startPos = this.levelMap.baddyStartPositions[definition.start];
                return new BaddyWalker(startPos, this.levelMap);
                break;
            case "bouncer":
                startPos = this.levelMap.baddyStartPositions[definition.start];
                return new BaddyBouncer(startPos);
                break;
            case "pathFollower":
                startPos = this.levelMap.baddyStartPositions[definition.start];
                return new BaddyPathFollower(startPos, definition.path);
                break;
        }
   }
});