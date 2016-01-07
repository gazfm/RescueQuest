


var BackgroundLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {

        this._super();

        var size = cc.winSize;

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.Sky_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2,
        });
        this.sprite.scaleX = 1.33;
        this.addChild(this.sprite, 0);

        return true;
    }
});

var TileLayer = cc.SpriteBatchNode.extend({
    tileSize: 32,
    textureWidth: 256,

    ctor:function (model) {
        this._super(res.Tiles_png, 100);

        this.initFromModel(model);

        return true;
    },
    initFromModel: function(model) {


        this._clearChildren();
        for(var y = 0; y < 10; y++)
        {
            for(var x = 0; x < 20; x++)
            {
                var c = model[y][x];
                var t = -1;
                if(c=='/') t = 0;
                if(c=='=') t = 1;
                if(c=='\\') t = 2;
                if(t >= 0)
                {
                    var tile = new cc.Sprite(res.Tiles_png, cc.rect(t * this.tileSize, Math.floor(t/(this.textureWidth/this.tileSize)), this.tileSize, this.tileSize));
                    tile.setPositionX((x+0.5)*this.tileSize);
                    tile.setPositionY(320-(y+0.5)*this.tileSize);
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



var PhysicsTestLayer = cc.Layer.extend({
    _space: null,
    ctor:function (model) {
        this._super();
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
            cp.v(640, 0),// start point
            cp.v(640, 4294967295),// MAX INT:4294967295
            0);// thickness of wall
        wallLeft.setElasticity(0.5);
        this._space.addStaticShape(wallRight);


        for(var y = 0; y < 10; y++) {
            for (var x = 0; x < 20; x++) {
                var c = model[y][x];
                if(c != ' ') {
                    //add box
                    var box = new cp.BoxShape2(this._space.staticBody, {l:x*32,r:x*32+32,b:(9-y)*32,t:(9-y)*32+32});
                    box.setElasticity(0.5);
                    this._space.addStaticShape(box);
                }
            }
        }


        for(var i = 0; i < 5; i++)
        {
            var sprite = new cc.PhysicsSprite(res.Tiles_png, cc.rect(224, 64, 32, 32));
            var contentSize = sprite.getContentSize();
            var body = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height));
            body.p = cc.p(i*50, 400);
            body.applyImpulse(cp.v(300, 0), cp.v(0, 0.4));//run speed
            this._space.addBody(body);
            var shape = new cp.BoxShape(body, contentSize.width, contentSize.height);
            shape.setElasticity(0.5);
            this._space.addShape(shape);
            sprite.setBody(body);
            this.addChild(sprite, 0);
        }


        this.scheduleUpdate();
    },
    update: function(dt) {
        this._space.step(dt);
    }
});




var SpritesLayer = cc.Layer.extend({
    _space: null,
    player: null,
    timeSinceLastJump: 0.0,
    ctor:function (model) {
        this._super();
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
            cp.v(640, 0),// start point
            cp.v(640, 4294967295),// MAX INT:4294967295
            0);// thickness of wall
        wallLeft.setElasticity(0.5);
        this._space.addStaticShape(wallRight);


        for(var y = 0; y < 10; y++) {
            for (var x = 0; x < 20; x++) {
                var c = model[y][x];
                if(c != ' ') {
                    //add box
                    var box = new cp.BoxShape2(this._space.staticBody, {l:x*32,r:x*32+32,b:(9-y)*32,t:(9-y)*32+32});
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
            var thisLayer = this;
            listener.onKeyPressed = function (keyCode, event) {
                console.log("Key pressed " + keyCode)
                if(thisLayer.timeSinceLastJump > 0.5) {
                    if(keyCode == '65') {
                        thisLayer.player.body.applyImpulse(cp.v(-300, 300), cp.v(0, 0));//run speed
                        thisLayer.timeSinceLastJump = 0;
                    }
                    if(keyCode == '68') {
                        thisLayer.player.body.applyImpulse(cp.v(300, 300), cp.v(0, 0));//run speed
                        thisLayer.timeSinceLastJump = 0;
                    }
                }
            }
            cc.eventManager.addListener(listener, this);
        }


        this.scheduleUpdate();
    },
    update: function(dt) {
        var vmsg = "Velocity: " + this.player.body.vx + "," + this.player.body.vy;

        this.timeSinceLastJump += dt;

        this.player.body.vx *= 0.99;
        this.player.body.vy *= 0.99;
        console.log(vmsg);
        this._space.step(dt);
    }
});



/*
var SpritesLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {

        this._super();

        var size = cc.winSize;

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.Sky_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2,
        });
        this.addChild(this.sprite, 0);

        return true;
    }
});
*/

