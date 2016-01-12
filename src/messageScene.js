/**
 * Created by garryf on 12/01/16.
 *
 * Message scene - a scene that displays a text message and waits for a key press
 *
 */

var MessageLayer = cc.Layer.extend({
    ctor:function (message, onKeyPressed) {
        this._super();

        var size = cc.winSize;

        var message = new cc.LabelTTF(message, "Arial", 38);
        message.x = size.width / 2;
        message.y = 100;
        this.addChild(message, 5);

        if ('keyboard' in cc.sys.capabilities) {
            var listener = cc.EventListener.create({event: cc.EventListener.KEYBOARD});
            var thisLayer = this;
            listener.onKeyPressed = function (keyCode, event) {
                onKeyPressed();
            }
            cc.eventManager.addListener(listener, this);
        }

        return true;
    }
});


var MessageScene = cc.Scene.extend({
    message: "",
    stateTransitionCallbacks: null,
    ctor: function(message, stateTransitionCallbacks) {
        this._super();
        this.stateTransitionCallbacks = stateTransitionCallbacks;
        this.message = message;
    },
    onEnter: function () {
        this._super();
        var that = this;
        this.addChild(new MessageLayer(this.message, this.stateTransitionCallbacks.keyPressed));
    }
});
