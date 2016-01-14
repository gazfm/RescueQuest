



var TileLayer = cc.SpriteBatchNode.extend({

    ctor:function (levelMap) {
        this._super(res.Sprites_png, 80);
        cc.spriteFrameCache.addSpriteFrames(res.Sprites_plist);

        this.initFromModel(levelMap);

        return true;
    },
    initFromModel: function(levelMap) {


        this._clearChildren();
        for(var y = 0; y < globals.config.levelHeight; y++)
        {
            for(var x = 0; x < globals.config.levelWidth; x++)
            {
                var tile = levelMap.tiles[y][x];
                if(tile.imageFilename)
                {
                    var tile = new cc.Sprite("#" + tile.imageFilename);
                    tile.setPositionX((x+0.5)*globals.config.tileSize);
                    tile.setPositionY((globals.config.levelHeight-y-0.5)*globals.config.tileSize);
                    this.addChild(tile);
                }
            }
        }
    },
    _clearChildren: function() {
        var numChildren = this.getChildrenCount();
        for(var i = 0; i < this.getChildrenCount(); i++)
            this.removeChild(0);
    }

});

var ManyTilesSpeedTestLayer = cc.SpriteBatchNode.extend({
    numTiles: 1000,

    ctor: function () {
        this._super(res.Tiles_png, 100);

        var size = cc.director.getWinSize();

        for(var i = 0; i < this.numTiles; i++)
        {
            var tx = Math.floor(Math.random()*8);
            var ty = Math.floor(Math.random()*8);
            var sprite = new cc.Sprite(res.Tiles_png, cc.rect(tx*32, ty*32, 32, 32));
            sprite.setPosition(Math.random()*500, Math.random()*500);
            this.addChild(sprite, 0);
        }
        this.scheduleUpdate();
    },
    update: function(dt) {
        var speed = 150;
        for(var i = 0; i < this.numTiles; i++)
        {
            var sprite = this.children[i];
            var vx = Math.sin(i/10), vy = Math.cos(i/10);
            var x = sprite.getPositionX();
            var y = sprite.getPositionY();
            x = x + vx * dt * speed;
            y = y + vy * dt * speed;
            if(x < 0) x += 1000;
            if(x < 0) x += 800;
            if(x > 1000) x -= 1000;
            if(y > 800) y -= 800;
            sprite.setPositionX(x);
            sprite.setPositionY(y);
        }
    }
});




var SpritesLayer = cc.Layer.extend({
    _space: null,
    player: null,
    timeSinceLastJump: 0.0,
    playerPositionListener: null,
    keyDownLeft: false,
    keyDownRight: false,
    //baddies: null,
    ctor:function (levelMap, playerPositionListener) {
        this._super();
        this.playerPositionListener = playerPositionListener;
        var size = cc.director.getWinSize();

        this._space = new cp.Space();
        this._space.gravity = cp.v(0, -350);

        //TODO: uncouple levelMap from chipmonk (it's annoying that we pass in staticBody below)
        var collisionShapes = levelMap.getCollisionShapes(this._space.staticBody);
        for(var i = 0; i < collisionShapes.length; i++) {
            this._space.addStaticShape(collisionShapes[i]);
        }

        var sprite = new cc.PhysicsSprite(res.Tiles_png, cc.rect(224, 64, 32, 32));
        var contentSize = sprite.getContentSize();
        var body = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height));
        body.p = cc.p(50, 250);
        body.setMoment(Infinity);
        body.applyImpulse(cp.v(300, 0), cp.v(0, 0.4));//run speed
        this._space.addBody(body);
        var shape = new cp.BoxShape(body, contentSize.width, contentSize.height);
        shape.setElasticity(0.5);
        this._space.addShape(shape);
        sprite.setBody(body);
        this.addChild(sprite, 0);
        this.player = sprite;

        //Set up keyboard listener
        if ('keyboard' in cc.sys.capabilities) {
            var listener = cc.EventListener.create({event: cc.EventListener.KEYBOARD});
            var that = this;
            listener.onKeyPressed = function (keyCode, event) {
                if(keyCode == '65') { that.keyDownLeft = true; }
                if(keyCode == '68') { that.keyDownRight = true; }
            }
            listener.onKeyReleased = function (keyCode, event) {
                if(keyCode == '65') { that.keyDownLeft = false; }
                if(keyCode == '68') { that.keyDownRight = false; }
            }
            cc.eventManager.addListener(listener, this);
        }

        this.scheduleUpdate();
    },
    update: function(dt) {
        this.timeSinceLastJump += dt;

        if(this.keyDownLeft || this.keyDownRight) {
            var directionX = 0;
            if(this.keyDownLeft) directionX -= 1;
            if(this.keyDownRight) directionX += 1;
            this.player.body.applyImpulse(cp.v(directionX * 10, 20), cp.v(0, 0));
        }

        this.player.body.vx *= 0.99;
        this.player.body.vy *= 0.99;

        this._space.step(dt);

        if(this.playerPositionListener) {
            this.playerPositionListener(this.player.getPositionX(), this.player.getPositionY());
        }
    }
});



var GameLayer = cc.Layer.extend({
    onCrash: null,
    onWin: null,
    ctor:function (onCrash, onWin) {
        this._super();

        this.onCrash = onCrash;
        this.onWin = onWin;

        var size = cc.winSize;

        //Set up keyboard listener
        if ('keyboard' in cc.sys.capabilities) {
            var listener = cc.EventListener.create({event: cc.EventListener.KEYBOARD});
            var thisLayer = this;
            listener.onKeyPressed = function (keyCode, event) {
                if(keyCode == 13) {
                    // Return pressed - next level
                    thisLayer.onWin();
                } else if(keyCode == 32) {
                    thisLayer.onCrash();
                }
            }
            cc.eventManager.addListener(listener, this);
        }

        //Draw layer
        //var draw = new cc.DrawNode();
        //draw.drawCircle(new cc.Point(100, 100), 150, 0, 10);
        //draw.drawDot(new cc.Point(300,100), 150);
        //this.addChild(draw, 1);

        return true;
    }
});







var GameScene = cc.Scene.extend({
    levelDefinition: null,
    scrollingContainer: null,
    stateTransitionCallbacks: null,
    ctor: function(levelDefinition, stateTransitionCallbacks) {
        this._super();
        this.levelDefinition = levelDefinition;
        this.stateTransitionCallbacks = stateTransitionCallbacks;
    },
    onEnter:function () {
        this._super();

        var levelMap = new LevelMap(this.levelDefinition);

        var that = this;
        var gameLayer = new cc.Layer();
        gameLayer.addChild(new TileLayer(levelMap));
        gameLayer.addChild(new SpritesLayer(levelMap, function(x, y) {that.updateScrollPosition(x,y)}));
        gameLayer.addChild(new GameLayer(
            function () {
                that.stateTransitionCallbacks.crash();
            },
            function () {
                that.stateTransitionCallbacks.win();
            }
        ));
        var levelWidthPx = globals.config.levelWidth * globals.config.tileSize;
        var levelHeightPx = globals.config.levelHeight * globals.config.tileSize;
        this.scrollingContainer = new BackgroundAndGameLayers(gameLayer, levelWidthPx, levelHeightPx);
        this.addChild(this.scrollingContainer);

        var that = this;
    },
    updateScrollPosition: function(playerX, playerY) {
        //playerX and playerY are the player position relative to the bottom left of the level
        //The parallax layers are set up so that a scroll position of (0,0) shows the middle of the level in the middle of the screen
        var levelWidthPx = globals.config.levelWidth * globals.config.tileSize;
        var levelHeightPx = globals.config.levelHeight * globals.config.tileSize;
        var resolutionWidth = globals.config.resolutionWidth;
        var resolutionHeight = globals.config.resolutionHeight;
        //keep player in the middle:

        var playerXNormalized = (playerX / levelWidthPx) * 2 -1;    //-1 to 1, left to right
        var playerYNormalized = (playerY / levelHeightPx) * 2 -1;

        var maxScrollX = Math.max(0, (levelWidthPx - resolutionWidth) / 2);
        var maxScrollY = Math.max(0, (levelHeightPx - resolutionHeight) / 2);

        if(this.scrollingContainer) {
            this.scrollingContainer.setScrollPosition(maxScrollX * playerXNormalized, maxScrollY * playerYNormalized);
        }
    }
});
