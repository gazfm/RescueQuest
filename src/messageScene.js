/**
 * Created by garryf on 12/01/16.
 *
 * Message scene - a scene that displays a text message and waits for a key press
 *
 */




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
