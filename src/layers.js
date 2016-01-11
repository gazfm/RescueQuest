

var ParallaxContainer = cc.Layer.extend({
    parallaxLayers: [],
    scrollX:0,
    scrollY:0,
    addParallaxLayer: function(layer, offsetX, offsetY, scrollScale) {
        this.addChild(layer);
        this.parallaxLayers.push({layer: layer, offsetX: offsetX, offsetY: offsetY, scrollScale: scrollScale})
        this._updateLayerPositions();
    },
    setScrollPosition: function(scrollX, scrollY) {
        this.scrollX = scrollX;
        this.scrollY = scrollY;
        this._updateLayerPositions();
    },
    _updateLayerPositions: function() {
        for(var i = 0; i < this.parallaxLayers.length; i++) {
            var l = this.parallaxLayers[i];
            var px = l.offsetX - l.scrollScale * this.scrollX;
            var py = l.offsetY - l.scrollScale * this.scrollY;
            l.layer.setPositionX(px);
            l.layer.setPositionY(py);
        }
    }
});



var BackgroundAndGameLayers = ParallaxContainer.extend({

    ctor:function (gameLayer, gameWidth, gameHeight) {
        this._super();
        var size = cc.winSize;
        cc.spriteFrameCache.addSpriteFrames(res.Backgrounds_plist);

        var centerX = size.width / 2;
        var centerY = size.height/ 2;

        var sky = new cc.Sprite("#Sky.png");
        this.addParallaxLayer(sky, centerX, centerY, 0.1)

        var clouds = new cc.Sprite("#Clouds.png");
        clouds.setScale(1.5, 1.5);
        this.addParallaxLayer(clouds, centerX, centerY+200, 0.15)

        var mountains = new cc.Sprite("#Mountains.png");
        mountains.setScale(1.5, 1.5);
        this.addParallaxLayer(mountains, centerX, centerY, 0.22)

        var grass = new cc.Sprite("#Grass.png");
        grass.setScale(1.5, 1.5);
        this.addParallaxLayer(grass, centerX, centerY-400, 0.3)

        //finally add the game layer
        this.addParallaxLayer(gameLayer, centerX-(gameWidth/2), centerY-(gameHeight/2), 1.0, 1.0)

        //this.scheduleUpdate();
        return true;
    },
    totalTime:0,
    update: function(dt) {
        this.totalTime += dt;
        //this.setScrollPosition(480*Math.sin(this.totalTime), 240*Math.sin(this.totalTime*0.7));
    }
});


var TileLayer = cc.SpriteBatchNode.extend({

    ctor:function (model) {
        this._super(res.Sprites_png, 80);
        cc.spriteFrameCache.addSpriteFrames(res.Sprites_plist);

        this.initFromModel(model);

        return true;
    },
    initFromModel: function(model) {


        this._clearChildren();
        for(var y = 0; y < globals.config.levelHeight; y++)
        {
            for(var x = 0; x < globals.config.levelWidth; x++)
            {
                var c = model[y][x];
                var spriteName = null;
                if(c=='/') spriteName = "#EarthBlockUpLeft.png";
                if(c=='=') spriteName = "#EarthBlock.png";
                if(c=='\\') spriteName = "#EarthBlockUpRight.png";
                if(spriteName)
                {
                    var tile = new cc.Sprite(spriteName);
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
    ctor:function (model, playerPositionListener) {
        this._super();
        this.playerPositionListener = playerPositionListener;
        var size = cc.director.getWinSize();

        this._space = new cp.Space();
        this._space.gravity = cp.v(0, -350);

        var wallBottom = new cp.SegmentShape(this._space.staticBody,
            cp.v(0, 0),// start point
            cp.v(4294967295, 0),// MAX INT:4294967295
            0);// thickness of wall
        wallBottom.setElasticity(0.5);
        this._space.addStaticShape(wallBottom);

        var wallLeft = new cp.SegmentShape(this._space.staticBody,
            cp.v(0, 0),// start point
            cp.v(0, 4294967295),// MAX INT:4294967295
            0);// thickness of wall
        wallLeft.setElasticity(0.5);
        this._space.addStaticShape(wallLeft);

        var wallRight = new cp.SegmentShape(this._space.staticBody,
            cp.v(globals.config.tileSize * globals.config.levelWidth, 0),// start point
            cp.v(globals.config.tileSize * globals.config.levelWidth, 4294967295),// MAX INT:4294967295
            0);// thickness of wall
        wallLeft.setElasticity(0.5);
        this._space.addStaticShape(wallRight);

        var tileSize=globals.config.tileSize;
        for(var y = 0; y < globals.config.levelHeight; y++) {
            for (var x = 0; x < globals.config.levelWidth; x++) {
                var c = model[y][x];
                if(c != ' ') {
                    //add box
                    var box = new cp.BoxShape2(this._space.staticBody,
                            {l:x*tileSize,
                            r:x*tileSize+tileSize,
                            b:(globals.config.levelHeight-1-y)*tileSize,
                            t:(globals.config.levelHeight-1-y)*tileSize+tileSize});
                    box.setElasticity(0.5);
                    this._space.addStaticShape(box);
                }
            }
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


