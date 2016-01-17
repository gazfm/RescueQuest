/* globals cc, MessageLayer */

var MessageScene = cc.Scene.extend({
    message: "",
    stateTransitionCallbacks: null,
    ctor: function(message, stateTransitionCallbacks) {
        "use strict";
        this._super();
        this.stateTransitionCallbacks = stateTransitionCallbacks;
        this.message = message;
    },
    onEnter: function () {
        "use strict";
        this._super();
        this.addChild(new MessageLayer(this.message, this.stateTransitionCallbacks.keyPressed));
    }
});
