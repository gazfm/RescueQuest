
/* globals MessageScene, cc, LoadLevelScene, GameScene */




function StartGameStateMachine() {
    "use strict";

    var lives = 5;
    //var score = 0;
    var level = 1;
    var levelDefinition = null;


    var StartMenuScene = MessageScene.extend({
        ctor: function() {
            this._super("Press a key to start", {keyPressed: changeStateStartGame});
        }
    });

    var LifeLostScene = MessageScene.extend({
        ctor: function() {
            this._super("Try again, lives remaining: " + lives, {keyPressed: changeStatePlayLevel});
        }
    });

    var NextLevelScene = MessageScene.extend({
        ctor: function() {
            this._super("Proceed to level " + level, {keyPressed: changeStateLoadLevel});
        }
    });

    var GameOverScene = MessageScene.extend({
        ctor: function() {
            this._super("Game over - better luck next time", {keyPressed: changeStateStartMenu});
        }
    });

    var GameCompletedScene = MessageScene.extend({
        ctor: function() {
            this._super("Game completed - congratulations", {keyPressed: changeStateStartMenu});
        }
    });



    function changeStateStartMenu() {
        cc.director.runScene(new StartMenuScene());
    }

    function changeStateStartGame() {
        lives = 5;
        level = 1;
        changeStateLoadLevel();
    }

    function changeStateLoadLevel() {
        cc.director.runScene(new LoadLevelScene(level, {failed: changeStateStartMenu,
                                                        levelLoaded: function(l) {
                                                            levelDefinition = l;
                                                            changeStatePlayLevel();
                                                        }}));
    }


    function changeStatePlayLevel() {
        cc.director.runScene(new GameScene(levelDefinition, {crash: changeStateCrash, win: changeStateWin}));
    }


    function changeStateCrash() {
        lives -= 1;
        if (lives === 0) {
            cc.director.runScene(new GameOverScene());
        } else {
            cc.director.runScene(new LifeLostScene());
        }
    }


    function changeStateWin() {
        level += 1;
        if(level >= 10) {
            cc.director.runScene(new GameCompletedScene());
        } else {
            cc.director.runScene(new NextLevelScene());
        }
    }

    changeStateStartMenu();

}

