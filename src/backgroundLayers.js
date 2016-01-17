
/* globals cc, res, ParallaxContainer */


var BackgroundAndGameLayers = ParallaxContainer.extend({

    ctor:function (gameLayer, gameWidth, gameHeight) {
        "use strict";
        this._super();
        var size = cc.winSize;
        cc.spriteFrameCache.addSpriteFrames(res.Backgrounds_plist);

        var centerX = size.width / 2;
        var centerY = size.height/ 2;

        var sky = new cc.Sprite("#Sky.png");
        this.addParallaxLayer(sky, centerX, centerY, 0.1);

        var clouds = new cc.Sprite("#Clouds.png");
        clouds.setScale(1.5, 1.5);
        this.addParallaxLayer(clouds, centerX, centerY+200, 0.15);

        var mountains = new cc.Sprite("#Mountains.png");
        mountains.setScale(1.5, 1.5);
        this.addParallaxLayer(mountains, centerX, centerY, 0.22);

        var grass = new cc.Sprite("#Grass.png");
        grass.setScale(1.5, 1.5);
        this.addParallaxLayer(grass, centerX, centerY-400, 0.3);

        //finally add the game layer
        if(gameLayer) {
            this.addParallaxLayer(gameLayer, centerX - (gameWidth / 2), centerY - (gameHeight / 2), 1.0, 1.0);
        }

        //this.scheduleUpdate();
        return true;
    },
    totalTime:0,
    update: function(dt) {
        "use strict";
        this.totalTime += dt;
        //this.setScrollPosition(480*Math.sin(this.totalTime), 240*Math.sin(this.totalTime*0.7));
    }
});