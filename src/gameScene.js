
// THe following line keeps JSHint happy
/* global globals, res, cc, cp, LevelMap, BaddyFactory, BackgroundAndGameLayers */

var TileLayer = cc.SpriteBatchNode.extend({

    ctor:function (levelMap) {
        "use strict";
        //TODO: check if using SpriteBatchNode is a performance benefit (I think it's deprecated in cocos 3.1 onwards)
        this._super(res.Sprites_png, 80);
        cc.spriteFrameCache.addSpriteFrames(res.Sprites_plist);

        this.initFromModel(levelMap);

        return true;
    },
    initFromModel: function(levelMap) {
        "use strict";
        this._clearChildren();
        for(var y = 0; y < globals.config.levelHeight; y++)
        {
            for(var x = 0; x < globals.config.levelWidth; x++)
            {
                var tile = levelMap.tiles[y][x];
                if(tile.imageFilename)
                {
                    var tileSprite = new cc.Sprite("#" + tile.imageFilename);
                    tileSprite.setPositionX((x+0.5)*globals.config.tileSize);
                    tileSprite.setPositionY((globals.config.levelHeight-y-0.5)*globals.config.tileSize);
                    this.addChild(tileSprite);
                }
            }
        }
    },
    _clearChildren: function() {
        "use strict";
        var numChildren = this.getChildrenCount();
        for(var i = 0; i < numChildren; i++) {
            this.removeChild(0);
        }
    }

});




// Contains the player and baddy sprites, and game-play event listeners
var GamePlayLayer = cc.Layer.extend({
    _space: null,
    player: null,
    princess: null,
    playerPositionListener: null,
    keyDownLeft: false,
    keyDownRight: false,
    baddies: null,
    onKilled: null,
    onWin: null,
    accumulatedTime: 0,
    updateCount: 0,
    deathAnimationTime: 0,
    winAnimationTime: 0,
    ctor:function (levelMap, playerPositionListener, onKilled, onWin) {
        "use strict";
        this._super();

        this.onKilled = onKilled;
        this.onWin = onWin;

        this.baddies = [];

        this.playerPositionListener = playerPositionListener;

        this._space = new cp.Space();
        this._space.gravity = cp.v(0, -350);

        //TODO: uncouple levelMap from chipmunk (it's annoying that we pass in staticBody below)
        var collisionShapes = levelMap.getCollisionShapes(this._space.staticBody);
        for(var i = 0; i < collisionShapes.length; i++) {
            this._space.addStaticShape(collisionShapes[i]);
        }

        var sprite = new cc.PhysicsSprite("#Prince.png");
        var contentSize = sprite.getContentSize();
        contentSize.width -= 30;
        contentSize.height -=14;
        var body = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height));
        body.p = levelMap.playerStartPosition;
        body.setMoment(Infinity);
        this._space.addBody(body);
        var shape = new cp.BoxShape(body, contentSize.width, contentSize.height);
        shape.setElasticity(0.5);
        this._space.addShape(shape);
        sprite.setBody(body);
        this.addChild(sprite, 0);
        this.player = sprite;

        this.princess = new cc.Sprite("#Pricess.png");   //TODO: fix spelling in filename
        this.princess.setPosition(levelMap.princessPosition.x, levelMap.princessPosition.y + 20);
        this.addChild(this.princess, 0);

        //Set up keyboard listener
        if ('keyboard' in cc.sys.capabilities) {
            var listener = cc.EventListener.create({event: cc.EventListener.KEYBOARD});
            var that = this;
            listener.onKeyPressed = function (keyCode /*, event*/) {
                if(keyCode === 65) { that.keyDownLeft = true; }
                if(keyCode === 68) { that.keyDownRight = true; }

                //TODO: remove this cheat mode (return skips to next level, escape dies)
                if(keyCode === 13) {
                    // Return pressed - next level
                    that.winAnimationTime = 0.7; //that.onWin();
                } else if(keyCode === 32) {
                    that.deathAnimationTime = 0.7; //that.onKilled();
                }

            };
            listener.onKeyReleased = function (keyCode /*, event*/) {
                if(keyCode === 65) { that.keyDownLeft = false; }
                if(keyCode === 68) { that.keyDownRight = false; }
            };
            cc.eventManager.addListener(listener, this);
        }

        //Draw layer
        //var draw = new cc.DrawNode();
        //draw.drawCircle(new cc.Point(100, 100), 150, 0, 10);
        //draw.drawDot(new cc.Point(300,100), 150);
        //this.addChild(draw, 1);


        this.scheduleUpdate();
    },
    update: function(dt) {
        "use strict";

        // This function is called at different intervals / different dt values, but in order to keep the simulation
        // and game play constant across different frame-rates we use a virtual 60FPS update rate (set by
        // globals.config.gamePlayFPS) for our game objects.
        // So if here we loop through e.g. 0, 1, 2 updates depending on dt
        this.accumulatedTime += dt;
        var framesSinceStart = Math.floor(this.accumulatedTime * globals.config.gamePlayFPS);

        if(framesSinceStart - this.updateCount > 5) {
            this.updateCount = framesSinceStart; //catch up if behind (will cause stutter)
        }

        dt = 1.0 / globals.config.gamePlayFPS;  //change dt for use below

        for(;this.updateCount < framesSinceStart;this.updateCount++) {

            if(this.deathAnimationTime > 0) {
                this.deathAnimationTime -= dt;
                if(this.deathAnimationTime <= 0) {
                    this.onKilled();
                }
                this.player.setRotation(this.player.getRotation() + 15);
                this.player.setScaleX(this.player.getScaleX() * 0.95);
                this.player.setScaleY(this.player.getScaleY() * 0.95);
            }
            else if(this.winAnimationTime > 0) {
                this.winAnimationTime -= dt;
                if(this.winAnimationTime <= 0) {
                    this.onWin();
                }
                this.player.setScaleX(this.player.getScaleX() + 0.3);
                this.player.setScaleY(this.player.getScaleY() + 0.3);
            }
            else if(this.keyDownLeft || this.keyDownRight) {
                var directionX = 0;
                if(this.keyDownLeft) {
                    directionX -= 1;
                }
                if(this.keyDownRight) {
                    directionX += 1;
                }
                this.player.body.applyImpulse(cp.v(directionX * 10, 20), cp.v(0, 0));
            }

            this.player.body.vx *= 0.99;
            this.player.body.vy *= 0.99;

            this._space.step(dt);

            //update baddies
            for(var i = 0; i < this.baddies.length; i++) {
                this.baddies[i].update(dt);
            }

            //bady collision detection
            ///TODO: should not assume badies are a single sprite, or a specific size
            for(i = 0; i < this.baddies.length; i++) {
                var p1 = this.baddies[i].layer.getPosition();
                var p2 = this.player.getPosition();
                if(cc.pDistance(p1, p2) < 50 && this.deathAnimationTime === 0) {
                    this.deathAnimationTime = 0.5;
                }
            }

            //princess collision detection
            if(cc.pDistance(this.player.getPosition(), this.princess.getPosition()) < 30) {
                this.winAnimationTime = 0.5;
            }

        }

        if(this.playerPositionListener) {
            this.playerPositionListener(this.player.getPositionX(), this.player.getPositionY());
        }
    },
    addBaddy: function(baddy) {
        "use strict";
        this.baddies.push(baddy);
        this.addChild(baddy.getLayer());
    }
});









var GameScene = cc.Scene.extend({
    levelDefinition: null,
    scrollingContainer: null,
    stateTransitionCallbacks: null,
    ctor: function(levelDefinition, stateTransitionCallbacks) {
        "use strict";
        this._super();
        this.levelDefinition = levelDefinition;
        this.stateTransitionCallbacks = stateTransitionCallbacks;
    },
    onEnter:function () {
        "use strict";
        this._super();

        var levelMap = new LevelMap(this.levelDefinition);

        var that = this;
        var gameLayer = new cc.Layer();
        gameLayer.addChild(new TileLayer(levelMap));


        var onKilled = function () { that.stateTransitionCallbacks.crash(); };
        var onWin = function () { that.stateTransitionCallbacks.win(); };

        var spritesLayer = new GamePlayLayer(levelMap,
                                            function(x, y) {that.updateScrollPosition(x,y);},
                                            onKilled,
                                            onWin);
        var baddyFactory = new BaddyFactory(levelMap);
        for(var i = 0; i < this.levelDefinition.baddies.length; i++) {
            var definition = this.levelDefinition.baddies[i];
            var baddy = baddyFactory.createFromJSON(definition);
            spritesLayer.addBaddy(baddy);
        }
        gameLayer.addChild(spritesLayer);


        var levelWidthPx = globals.config.levelWidth * globals.config.tileSize;
        var levelHeightPx = globals.config.levelHeight * globals.config.tileSize;
        this.scrollingContainer = new BackgroundAndGameLayers(gameLayer, levelWidthPx, levelHeightPx);
        this.addChild(this.scrollingContainer);
    },
    updateScrollPosition: function(playerX, playerY) {
        "use strict";
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
        maxScrollX += 64;
        maxScrollY += 64;

        if(this.scrollingContainer) {
            this.scrollingContainer.setScrollPosition(maxScrollX * playerXNormalized, maxScrollY * playerYNormalized);
        }
    }
});
