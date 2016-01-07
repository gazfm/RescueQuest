

var GameLayer = cc.Layer.extend({
    onCrash: null,
    onWin: null,
    ctor:function (onCrash, onWin) {
        this._super();

        this.onCrash = onCrash;
        this.onWin = onWin;

        var size = cc.winSize;

         //Label
         var helloLabel = new cc.LabelTTF("GOOD GAME", "Arial", 38);
         helloLabel.x = size.width / 2;
         helloLabel.y = 0;
         this.addChild(helloLabel, 5);


        //Set up keyboard listener
        if ('keyboard' in cc.sys.capabilities) {
            var listener = cc.EventListener.create({event: cc.EventListener.KEYBOARD});
            var thisLayer = this;
            listener.onKeyPressed = function (keyCode, event) {
                if(keyCode == 13) {
                    // Return pressed - next level
                    thisLayer.onWin();
                } else if(keyCode == 32) {
                    thisLayer.onCrash();
                }
            }
            cc.eventManager.addListener(listener, this);
        }

         //Draw layer
         //var draw = new cc.DrawNode();
         //draw.drawCircle(new cc.Point(100, 100), 150, 0, 10);
         //draw.drawDot(new cc.Point(300,100), 150);
         //this.addChild(draw, 1);

        /*
        this.addChild(new CityLayer(), 2);

        this.ship = new FlyingSaucer();
        this.addChild(this.ship, 3);

        for(var i = 0; i < 10; i++) {
            var b = new Bomb();
            this.bombs.push(b);
            this.addChild(b);
        }
        */

        this.scheduleUpdate();

        return true;
    },
    update: function(dt) {
        //

    }
});





var MessageLayer = cc.Layer.extend({
    ctor:function (message, onKeyPressed) {
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
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


var GameStateSceneBase = cc.Scene.extend({
    gameStateHandler: null,
    ctor: function(gameStateHandler) {
        this._super();
        this.gameStateHandler = gameStateHandler;
    }
});


var MessageScene = GameStateSceneBase.extend({
    message: "",
    ctor: function(message, handler) {
        this._super(handler);
        this.message = message;
    },
    onEnter: function () {
        this._super();
        this.addChild(new BackgroundLayer());
        var that = this;
        this.addChild(new MessageLayer(this.message, function () {
            that.gameStateHandler.keyPressed();
        }));
    }
});


var GameScene = GameStateSceneBase.extend({
    level: 0,
    ctor: function(level, handler) {
        this._super(handler);
        this.level = level;
    },
    onEnter:function () {
        this._super();

        var model = [];
        switch((this.level - 1) % 4) {
            case 0:
                model.push('                    ');
                model.push('                    ');
                model.push('            =====\\  ');
                model.push('/===\\               ');
                model.push('                    ');
                model.push('  ======            ');
                model.push('                    ');
                model.push('  /===========      ');
                model.push('                    ');
                model.push('====================');
                break;
            case 1:
                model.push('====================');
                model.push('=                  =');
                model.push('=                  =');
                model.push('=======            =');
                model.push('=                  =');
                model.push('=                  =');
                model.push('=            =======');
                model.push('=                  =');
                model.push('=                  =');
                model.push('====================');
                break;
            case 2:
                model.push('====================');
                model.push('=                  =');
                model.push('=         =====    =');
                model.push('=======            =');
                model.push('=         =====    =');
                model.push('=                  =');
                model.push('=            =======');
                model.push('=   =====          =');
                model.push('=            =     =');
                model.push('====================');
                break;
            case 3:
                model.push('                    ');
                model.push('                    ');
                model.push('   =  =     =====   ');
                model.push('=========  ======== ');
                model.push('                    ');
                model.push('  ====   ========   ');
                model.push('                    ');
                model.push('======= ======      ');
                model.push('                    ');
                model.push('====================');
                break;
        }

        this.addChild(new BackgroundLayer());
        this.addChild(new TileLayer(model));
        //this.addChild(new ManyTilesSpeedTestLayer());
        //this.addChild(new PhysicsTestLayer(model));
        this.addChild(new SpritesLayer(model));
//        var tileLayers = new TileLayers();
//        this.addChild(tileLayers.behind());
//        this.addChild(new PhysicsTestLayer());
//        this.addChild(tileLayers.ontop());
        var that = this;
        this.addChild(new GameLayer(
            function () {
                that.gameStateHandler.crash();
            },
            function () {
                that.gameStateHandler.win();
            }
        ));
    }
});



function StartGameStateMachine() {

    var lives = 5;
    var score = 0;
    var level = 1;


    var StartMenuScene = MessageScene.extend({
        ctor: function() {
            this._super("Press a key to start", {keyPressed: changeStateStartGame});
        }
    });

    var LifeLostScene = MessageScene.extend({
        ctor: function() {
            this._super("Try again, lives remaining: " + lives, {keyPressed: changeStateContinueGame});
        }
    });

    var NextLevelScene = MessageScene.extend({
        ctor: function() {
            this._super("Proceed to level " + level, {keyPressed: changeStateContinueGame});
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
        cc.director.runScene(new GameScene(level, {crash: changeStateCrash, win: changeStateWin}));
    }

    function changeStateContinueGame() {
        cc.director.runScene(new GameScene(level, {crash: changeStateCrash, win: changeStateWin}));
    }


    function changeStateCrash() {
        lives -= 1;
        var nextScene;
        if (lives == 0) {
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

