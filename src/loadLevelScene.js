


// callback args: err, Level
function loadLevel(levelNumber, callback) {
    cc.loader.loadJson("res/level0" + levelNumber + ".json", function(err, levelJson) {
        if(err)
            return callback(err, null);

        //create a Level object
        callback(null, LevelDefinition.createFromJson(levelJson));
    });
}



var LoadLevelScene = cc.Scene.extend({
    stateTransitionCallbacks: null,
    ctor: function(level, stateTransitionCallbacks) {
        this._super();
        this.stateTransitionCallbacks = stateTransitionCallbacks;
        this.level = level;
    },
    onEnter: function () {
        this._super();
        var that = this;
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
