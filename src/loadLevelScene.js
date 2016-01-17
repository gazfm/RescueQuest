
/* globals cc, MessageLayer, LevelDefinition */

// callback args: err, Level
function loadLevel(levelNumber, callback) {
    "use strict";
    cc.loader.loadJson("res/level0" + levelNumber + ".json", function(err, levelJson) {
        if(err) {
            return callback(err, null);
        }

        //create a Level object
        callback(null, LevelDefinition.createFromJson(levelJson));
    });
}



var LoadLevelScene = cc.Scene.extend({
    stateTransitionCallbacks: null,
    ctor: function(level, stateTransitionCallbacks) {
        "use strict";
        this._super();
        this.stateTransitionCallbacks = stateTransitionCallbacks;
        this.level = level;
    },
    onEnter: function () {
        "use strict";
        this._super();
        this.addChild(new MessageLayer("Loading level "+ this.level, null));

        var that = this;
        //TODO: remove hardcoded 4 level limit
        loadLevel((this.level-1) % 4 + 1, function(err, level) {
           if(err) {
               that.stateTransitionCallbacks.failed();
           } else {
               that.stateTransitionCallbacks.levelLoaded(level);
           }
        });
    }
});
