/* globals cc */

var MessageLayer = cc.Layer.extend({
    ctor:function (message, onKeyPressed) {
        "use strict";
        this._super();

        var size = cc.winSize;

        var messageLabel = new cc.LabelTTF(message, "Arial", 38);
        messageLabel.x = size.width / 2;
        messageLabel.y = 100;
        this.addChild(messageLabel, 5);

        if ('keyboard' in cc.sys.capabilities) {
            var listener = cc.EventListener.create({event: cc.EventListener.KEYBOARD});
            listener.onKeyPressed = function (/*keyCode, event*/) {
                if(onKeyPressed) {
                    onKeyPressed();
                }
            };
            cc.eventManager.addListener(listener, this);
        }

        return true;
    }
});


var ParallaxContainer = cc.Layer.extend({
    parallaxLayers: null,
    scrollX:0,
    scrollY:0,
    ctor: function() {
        "use strict";
        this._super();
        this.parallaxLayers = [];
    },
    addParallaxLayer: function(layer, offsetX, offsetY, scrollScale) {
        "use strict";
        this.addChild(layer);
        this.parallaxLayers.push({layer: layer, offsetX: offsetX, offsetY: offsetY, scrollScale: scrollScale});
        this._updateLayerPositions();
    },
    setScrollPosition: function(scrollX, scrollY) {
        "use strict";
        this.scrollX = scrollX;
        this.scrollY = scrollY;
        this._updateLayerPositions();
    },
    _updateLayerPositions: function() {
        "use strict";
        for(var i = 0; i < this.parallaxLayers.length; i++) {
            var l = this.parallaxLayers[i];
            var px = l.offsetX - l.scrollScale * this.scrollX;
            var py = l.offsetY - l.scrollScale * this.scrollY;
            l.layer.setPositionX(px);
            l.layer.setPositionY(py);
        }
    }
});
