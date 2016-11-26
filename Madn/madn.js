var NUM_FIELDS = 40;
var NUM_PLAYER_FIGURES = 4;
var MOVEMENT_SPEED = 10;
var ROLLING_SPEED = 50;
var NUM_PLAYERS = 4;
var GUARANTEE_SIX=false;

var PLAYERS = {
    TOP:1,
    RIGHT:2,
    BOTTOM:3,
    LEFT:4
};

function Figure(id, p) {
    this.id = id;
    this.player = p;
    this.field = null;
    this.finish = false;
}

function Dice(p) {
    this.player = p;
    this.face = 1;
}

function Field(id, currentFigure, nextField, nextFinishField, finishPlayer, isFinishField, isStartingField) {
    this.id = id;
    this.currentFigure = currentFigure;
    this.nextField = nextField;
    this.nextFinishField = nextFinishField;
    this.finishPlayer = finishPlayer;
    this.isFinishField = isFinishField;
    this.isStartingField = isStartingField;
    this.getNextField = function (player) {
        if (this.nextFinishField && player == this.finishPlayer) {
            return this.nextFinishField;
        } else {
            return this.nextField;
        }
    }
}

var game = {
    visuals:null,
    fields:[],
    finish_fields_top:[],
    finish_fields_right:[],
    finish_fields_bottom:[],
    finish_fields_left:[],
    finishes:{},
    dices:{},
    player_figures:{},
    player_starts:{},
    player_turn:null,
    movement_queue:[],
    needs_roll:true,
    rolling:false,
    roll:0,
    rolling_interval:null,
    moves:[],
    moving:false,
    createFields:(function() {
        var i;
        for (i = 0; i < NUM_FIELDS; i++) {
            this.fields.push(new Field(i, null, null, null, null, false, false));
        }
        // alert(this.fields.length);
        for (i = 0; i < (this.fields.length-1); i++) {
            this.fields[i].nextField = this.fields[(i + 1)];
        }
        this.fields[this.fields.length-1].nextField = this.fields[0];
        for (i = 0; i < NUM_PLAYER_FIGURES; i++) {
            this.finish_fields_top.push(    new Field(i, null, null, null, PLAYERS.TOP, true, false));
            this.finish_fields_right.push(  new Field(i, null, null, null, PLAYERS.RIGHT, true, false));
            this.finish_fields_bottom.push( new Field(i, null, null, null, PLAYERS.BOTTOM, true, false));
            this.finish_fields_left.push(   new Field(i, null, null, null, PLAYERS.LEFT, true, false));
        }
        for (i = 0; i < NUM_PLAYER_FIGURES-1; i++) {
            this.finish_fields_top[i].nextField = this.finish_fields_top[i+1];
            this.finish_fields_right[i].nextField = this.finish_fields_right[i+1];
            this.finish_fields_bottom[i].nextField = this.finish_fields_bottom[i+1];
            this.finish_fields_left[i].nextField = this.finish_fields_left[i+1];
        }
        this.fields[1].nextFinishField = this.finish_fields_top[0];
        this.fields[11].nextFinishField = this.finish_fields_right[0];
        this.fields[21].nextFinishField = this.finish_fields_bottom[0];
        this.fields[31].nextFinishField = this.finish_fields_left[0];

        this.fields[1].finishPlayer = PLAYERS.TOP;
        this.fields[11].finishPlayer = PLAYERS.RIGHT;
        this.fields[21].finishPlayer = PLAYERS.BOTTOM;
        this.fields[31].finishPlayer = PLAYERS.LEFT;

        this.finishes[PLAYERS.TOP] = this.finish_fields_top;
        this.finishes[PLAYERS.RIGHT] = this.finish_fields_right;
        this.finishes[PLAYERS.BOTTOM] = this.finish_fields_bottom;
        this.finishes[PLAYERS.LEFT] = this.finish_fields_left;

        this.player_figures[PLAYERS.TOP] = [];
        this.player_figures[PLAYERS.RIGHT] = [];
        this.player_figures[PLAYERS.BOTTOM] = [];
        this.player_figures[PLAYERS.LEFT] = [];

        this.player_starts[PLAYERS.TOP] = [];
        this.player_starts[PLAYERS.RIGHT] = [];
        this.player_starts[PLAYERS.BOTTOM] = [];
        this.player_starts[PLAYERS.LEFT] = [];

        for (i = 0; i < NUM_PLAYER_FIGURES; i++) {
            this.player_figures[PLAYERS.TOP].push(      new Figure(i, PLAYERS.TOP));
            this.player_figures[PLAYERS.RIGHT].push(    new Figure(i, PLAYERS.RIGHT));
            this.player_figures[PLAYERS.BOTTOM].push(   new Figure(i, PLAYERS.BOTTOM));
            this.player_figures[PLAYERS.LEFT].push(     new Figure(i, PLAYERS.LEFT));

            this.player_starts[PLAYERS.TOP].push(    new Field(i, null, this.fields[2], null, PLAYERS.TOP, false, true));
            this.player_starts[PLAYERS.RIGHT].push(  new Field(i, null, this.fields[12], null, PLAYERS.RIGHT, false, true));
            this.player_starts[PLAYERS.BOTTOM].push( new Field(i, null, this.fields[22], null, PLAYERS.BOTTOM, false, true));
            this.player_starts[PLAYERS.LEFT].push(   new Field(i, null, this.fields[32], null, PLAYERS.LEFT, false, true));
        }

        this.dices[PLAYERS.TOP] = new Dice(PLAYERS.TOP);
        this.dices[PLAYERS.RIGHT] = new Dice(PLAYERS.RIGHT);
        this.dices[PLAYERS.BOTTOM] = new Dice(PLAYERS.BOTTOM);
        this.dices[PLAYERS.LEFT] = new Dice(PLAYERS.LEFT);
    }),
    getFieldFromDiv:(function (field) {
        if (field.id.includes("start-player")) {
            var split = field.id.split("-");
            var starts = [];
            switch (split[2]) {
                case "top":
                    starts = this.player_starts[PLAYERS.TOP];
                    break;
                case "right":
                    starts = this.player_starts[PLAYERS.RIGHT];
                    break;
                case "bottom":
                    starts = this.player_starts[PLAYERS.BOTTOM];
                    break;
                case "left":
                    starts = this.player_starts[PLAYERS.LEFT];
                    break;
            }
            var index = parseInt(split[3]);
            return starts[index-1];
        } else if (field.id.includes("inner-field")) {
            var split = field.id.split("-");
            var finishes = [];
            switch (split[2]) {
                case "top":
                    finishes = this.finishes[PLAYERS.TOP];
                    break;
                case "right":
                    finishes = this.finishes[PLAYERS.RIGHT];
                    break;
                case "bottom":
                    finishes = this.finishes[PLAYERS.BOTTOM];
                    break;
                case "left":
                    finishes = this.finishes[PLAYERS.LEFT];
                    break;
            }
            var index = parseInt(split[3]);
            return finishes[index-1];
        } else {
            var split = field.id.substring(5);
            var index = parseInt(split);
            return this.fields[index-1];
        }
    }),
    onClickFields:(function (field) {
        console.log("Click " + field.id);
        field = this.getFieldFromDiv(field);
        if (!this.needs_roll && !this.moving) {
            console.log("No needs roll")
            for (var i = 0; i < this.moves.length; i++) {
                console.log(this.moves[i][0] + " " + field);
                if (this.moves[i][0] == field) {
                    this.move(this.moves[i][0], this.moves[i][1]);
                    this.moves = [];
                    this.needs_roll = true;
                    break;
                }
            }
            // alert("Click on " + field.id);
        }
    }),
    rollDice:(function (dice) {
        this.roll++;
        if (this.roll > 50) {
            console.log("Clearing rolling interval");
            var that = this;
            clearInterval(that.rolling_interval);

            // REMOVE ME
            if (GUARANTEE_SIX) {
                dice.face = 6;
                this.visuals.setDice(dice);
            }

            this.rolling = false;
            this.needs_roll = false;
            this.update();
            return;
        }
        // slow down rolls
        if (this.roll > 45 && this.rolling < 49) {
            return
        }
        if (this.roll > 30 && this.roll % 2 == 0) {
            // console.log("Skipping > 70");
            return;
        }
        dice.face = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
        this.visuals.setDice(dice);
    }),
    getDiceFromDiv:(function (div) {
        switch (div.id) {
            case "dice-top":
                return this.dices[PLAYERS.TOP];
            case "dice-right":
                return this.dices[PLAYERS.RIGHT];
            case "dice-bottom":
                return this.dices[PLAYERS.BOTTOM];
            case "dice-left":
                return this.dices[PLAYERS.LEFT];
        }
    }),
    onClickDice:(function (dice) {
        if (this.needs_roll && !this.moving && !this.rolling) {
            dice = this.getDiceFromDiv(dice);
            // alert("On Click " + dice.id);
            this.rolling = true;
            this.roll = 0;
            var that = this;
            this.rolling_interval = setInterval(function () {
                that.rollDice(dice);
            }, ROLLING_SPEED)
        }
    }),
    initialize:(function () {
        for (var i = 0; i < NUM_PLAYER_FIGURES; i++) {
            this.setPosition(this.player_starts[PLAYERS.TOP][i], this.player_figures[PLAYERS.TOP][i]);
            this.setPosition(this.player_starts[PLAYERS.RIGHT][i], this.player_figures[PLAYERS.RIGHT][i]);
            this.setPosition(this.player_starts[PLAYERS.BOTTOM][i], this.player_figures[PLAYERS.BOTTOM][i]);
            this.setPosition(this.player_starts[PLAYERS.LEFT][i], this.player_figures[PLAYERS.LEFT][i]);
        }
        this.player_turn = PLAYERS.LEFT;
        console.log("Initialize: Player " + this.player_turn + " begins!");
    }),
    setPosition:(function (position, figure) {
        position.currentFigure = figure;
        figure.field = position;
        visuals.setPosition(position, figure);

    }),
    begin:(function () {
       this.update();
    }),
    canMove:(function () {

    }),
    update:(function () {
        console.log("Update");
        this.moves = this.getPossibleMoves();
        console.log("Possible moves: " + this.moves.length);
        if (this.moves.length > 0) {
            this.visuals.highlightMoves(this.moves);
        } else {
            this.nextTurn();
        }
    }),
    nextTurn:(function () {
        this.needs_roll = true;
        switch (this.player_turn) {
            case PLAYERS.TOP:
                this.player_turn = PLAYERS.RIGHT;
                break;
            case PLAYERS.RIGHT:
                this.player_turn = PLAYERS.BOTTOM;
                break;
            case PLAYERS.BOTTOM:
                this.player_turn = PLAYERS.LEFT;
                break;
            case PLAYERS.LEFT:
                this.player_turn = PLAYERS.TOP;
                break;
            default:
                this.player_turn = PLAYERS.TOP;
                break;
        }
        this.visuals.hideDice(this.dices[PLAYERS.TOP]);
        this.visuals.hideDice(this.dices[PLAYERS.RIGHT]);
        this.visuals.hideDice(this.dices[PLAYERS.BOTTOM]);
        this.visuals.hideDice(this.dices[PLAYERS.LEFT]);
        this.visuals.showDice(this.dices[this.player_turn]);
    }),
    getPossibleMoves:(function () {
        var moves = [];
        var figures = this.player_figures[this.player_turn];
        for (var i = 0; i < figures.length; i++) {
            if (!figures[i].finish) {
                var goto_field = figures[i].field;
                for (var j = 0; j < this.dices[this.player_turn].face; j++) {
                    goto_field = goto_field.getNextField(this.player_turn);
                }
                // finish field and empty
                if (!figures[i].field.isStartingField && goto_field.isFinishField && !goto_field.currentFigure) {
                    moves.push([figures[i].field, goto_field]);
                } else if (!figures[i].field.isStartingField && !goto_field.currentFigure) {
                    // field empty
                    moves.push([figures[i].field, goto_field]);
                } else if (!figures[i].field.isStartingField && goto_field.currentFigure.player != this.player_turn) {
                    // field occupied by enemy
                    moves.push([figures[i].field, goto_field]);
                } else if (figures[i].field.isStartingField && (!figures[i].field.nextField.currentFigure || figures[i].field.nextField.currentFigure.player != this.player_turn) && this.dices[this.player_turn].face == 6) {
                    moves.push([figures[i].field, figures[i].field.nextField]);
                }
            }
        }
        return moves;
    }),
    move:(function (a, b) {
        var i;
        if (a.isStartingField) {
            this.movement_queue.push([a, a.nextField, a.currentFigure]);
        } else if (this.fields.indexOf(a) >= 0 && this.fields.indexOf(b) >= 0) {
            // alert(this.fields.indexOf(b))
            var tmp = a;
            while (tmp != b) {
                this.movement_queue.push([tmp, tmp.nextField, a.currentFigure]);
                tmp = tmp.nextField;
            }

        } else if (this.fields.indexOf(a) >= 0 && b.isFinishField) {
            var cur = a;
            var next = a.nextField;
            do {
                this.movement_queue.push([cur, next, a.currentFigure]);
                cur = next;
                next = cur.nextField;
            } while (cur.finishPlayer != b.finishPlayer);
            this.movement_queue.push([cur, this.finishes[b.finishPlayer][0], a.currentFigure]);
            for(i = 0; i < b.id; i++) {
                this.movement_queue.push([this.finishes[b.finishPlayer][i], this.finishes[b.finishPlayer][i+1], a.currentFigure]);
            }
        }

        if (this.movement_queue.length > 0) {
            this.moving = true;
            a.currentFigure = null;
            this.make_move();
        }
    }),
    resetFigureToBase:(function (figure) {
        for (var i = 0; i < NUM_PLAYER_FIGURES; i++) {
            if (!this.player_starts[figure.player][i].currentFigure) {
                this.movement_queue.push([figure.field, this.player_starts[figure.player][i], figure]);
                break;
            }
        }


    }),
    make_move:(function () {
        var pair = this.movement_queue.shift();
        this.visuals.make_move(pair[0], pair[1], pair[2]);
        if (this.movement_queue.length == 0) {
            if (pair[1].currentFigure) {
                this.resetFigureToBase(pair[1].currentFigure);
            }
            pair[1].currentFigure = pair[2];
            pair[2].field = pair[1];
        }
        if (pair[1].isFinishField) {
            pair[2].finish = true;
        }
    }),
    finished_move_callback:(function () {
        if (this.movement_queue.length > 0) {
            this.make_move();
        } else {
            this.moving = false;
            this.nextTurn();
        }
    }),
    test_move:(function (){
        // var fig = new figure(0, PLAYERS.LEFT);
        // this.fields[0].currentFigure = fig;
        // this.move(this.fields[0], this.fields[5]);
        this.move(this.player_starts[PLAYERS.TOP][0], this.finish_fields_top[3]);
    })
};


var visuals = {
    fields:[],
    finish_fields_top:[],
    finish_fields_right:[],
    finish_fields_bottom:[],
    finish_fields_left:[],
    finishes:{},
    dices:{},
    player_figures:{},
    player_starts:{},
    interval:null,
    game:null,
    movable:(document.getElementById("movable-player")),
    moving:false,
    createEventListenerField:(function (field) {
        var that = this;
        field.addEventListener("click", function() {
            that.game.onClickFields(field)
        });
    }),
    createFields:(function() {
        var i;
        for (i = 1; i <= NUM_FIELDS; i++) {
            var field = document.getElementById("field"+i)
            this.fields.push(field);
            this.createEventListenerField(field);
        }
        for (i = 1; i <= NUM_PLAYER_FIGURES; i++) {
            var top = document.getElementById("inner-field-top-"+i);
            var right = document.getElementById("inner-field-right-"+i);
            var bottom = document.getElementById("inner-field-bottom-"+i);
            var left = document.getElementById("inner-field-left-"+i);
            this.finish_fields_top.push(top);
            this.finish_fields_right.push(right);
            this.finish_fields_bottom.push(bottom);
            this.finish_fields_left.push(left);

            this.createEventListenerField(top);
            this.createEventListenerField(right);
            this.createEventListenerField(bottom);
            this.createEventListenerField(left);
        }
        this.finishes[PLAYERS.TOP] = this.finish_fields_top;
        this.finishes[PLAYERS.RIGHT] = this.finish_fields_right;
        this.finishes[PLAYERS.BOTTOM] = this.finish_fields_bottom;
        this.finishes[PLAYERS.LEFT] = this.finish_fields_left;


        this.player_figures[PLAYERS.TOP] = [];
        this.player_figures[PLAYERS.RIGHT] = [];
        this.player_figures[PLAYERS.BOTTOM] = [];
        this.player_figures[PLAYERS.LEFT] = [];

        this.player_starts[PLAYERS.TOP] = [];
        this.player_starts[PLAYERS.RIGHT] = [];
        this.player_starts[PLAYERS.BOTTOM] = [];
        this.player_starts[PLAYERS.LEFT] = [];

        this.dices[PLAYERS.TOP] = document.getElementById("dice-top");
        this.dices[PLAYERS.RIGHT] = document.getElementById("dice-right");
        this.dices[PLAYERS.BOTTOM] = document.getElementById("dice-bottom");
        this.dices[PLAYERS.LEFT] = document.getElementById("dice-left");

        var that = this;
        this.dices[PLAYERS.TOP].addEventListener("click", function() {
            that.game.onClickDice(that.dices[PLAYERS.TOP])
        });
        this.dices[PLAYERS.RIGHT].addEventListener("click", function() {
            that.game.onClickDice(that.dices[PLAYERS.RIGHT])
        });
        this.dices[PLAYERS.BOTTOM].addEventListener("click", function() {
            that.game.onClickDice(that.dices[PLAYERS.BOTTOM])
        });
        this.dices[PLAYERS.LEFT].addEventListener("click", function() {
            that.game.onClickDice(that.dices[PLAYERS.LEFT])
        });



        for (i = 1; i <= NUM_PLAYER_FIGURES; i++) {
            this.player_figures[PLAYERS.TOP].push(      document.getElementById("player-top-"+i));
            this.player_figures[PLAYERS.RIGHT].push(    document.getElementById("player-right-"+i));
            this.player_figures[PLAYERS.BOTTOM].push(   document.getElementById("player-bottom-"+i));
            this.player_figures[PLAYERS.LEFT].push(     document.getElementById("player-left-"+i));

            var top = document.getElementById("start-player-top-"+i);
            var right = document.getElementById("start-player-right-"+i);
            var bottom = document.getElementById("start-player-bottom-"+i);
            var left = document.getElementById("start-player-left-"+i);

            this.player_starts[PLAYERS.TOP].push(top);
            this.player_starts[PLAYERS.RIGHT].push(right);
            this.player_starts[PLAYERS.BOTTOM].push(bottom);
            this.player_starts[PLAYERS.LEFT].push(left);

            this.createEventListenerField(top);
            this.createEventListenerField(right);
            this.createEventListenerField(bottom);
            this.createEventListenerField(left);
        }
    }),
    setPosition:(function (position, figure) {
        var selected_field = this.getFieldDiv(position);
        var selected_figure = this.getPlayerDiv(figure);

        var finish_rect = selected_field.getBoundingClientRect();
        var finish_top = finish_rect.top + window.scrollY;
        var finish_left = finish_rect.left + window.scrollX;

        var finish_width = selected_field.clientWidth;
        var finish_child2_width = selected_field.childNodes[0].childNodes[0].clientWidth;

        finish_top = finish_top + ((finish_width- finish_child2_width) / 2);
        finish_left = finish_left + ((finish_width - finish_child2_width) / 2);

        selected_figure.style.top = finish_top + "px";
        selected_figure.style.left = finish_left + "px";
    }),
    updateMove:(function(a_top, a_left, b_top, b_left, p) {
        var player_left = parseInt(p.style.left);
        var player_top = parseInt(p.style.top);


        if (b_left > player_left) {
            //move right
            p.style.left = (player_left + 1) + "px";
        }

        if (b_left < player_left) {
            //move left
            p.style.left = (player_left - 1) + "px";
        }

        if (b_top > player_top) {
            //move up
            p.style.top = (player_top + 1) + "px";
        }

        if (b_top < player_top) {
            //move down
            p.style.top = (player_top - 1) + "px";
        }

        if (b_top == player_top && b_left == player_left) {
            var that = this;
            clearInterval(that.interval);
            this.moving = false;
            this.game.finished_move_callback();
        }
    }),
    highlightMoves:(function () {

    }),
    getPlayerDiv:(function(p) {
        return this.player_figures[p.player][p.id];
    }),
    getFieldDiv:(function(f) {
        if (f.isStartingField) {
            return this.player_starts[f.finishPlayer][f.id];
        } else if (f.isFinishField) {
             return this.finishes[f.finishPlayer][f.id];
        } else {
             return this.fields[f.id];
        }
    }),
    getDiceDiv:(function (dice) {
        return this.dices[dice.player];
    }),
    showDice:(function (dice) {
        var vis_dice = this.getDiceDiv(dice);
        vis_dice.style.display = "block";
    }),
    hideDice:(function (dice) {
        var vis_dice = this.getDiceDiv(dice);
        vis_dice.style.display = "none";
    }),
    moveFromTo:(function(a, b, p) {
        this.moving = true;

        var start_rect = a.getBoundingClientRect();
        var start_top = start_rect.top + window.scrollY;
        var start_left = start_rect.left + window.scrollX;

        var start_width = a.clientWidth;
        var start_child2_width = a.childNodes[0].childNodes[0].clientWidth;

        var finish_rect = b.getBoundingClientRect();
        var finish_top = finish_rect.top + window.scrollY;
        var finish_left = finish_rect.left + window.scrollX;

        var finish_width = b.clientWidth;
        var finish_child2_width = b.childNodes[0].childNodes[0].clientWidth;

        start_top = start_top + ((start_width - start_child2_width) / 2);
        start_left = start_left + ((start_width - start_child2_width) / 2);

        finish_top = finish_top + ((finish_width- finish_child2_width) / 2);
        finish_left = finish_left + ((finish_width - finish_child2_width) / 2);

        // This can't be the solution...
        var that = this;
        this.interval = setInterval(function(){
            that.updateMove(start_top, start_left, finish_top, finish_left, p);
        }, MOVEMENT_SPEED);

    }),
    make_move:(function (a, b, p) {
        this.moveFromTo(this.getFieldDiv(a), this.getFieldDiv(b), this.getPlayerDiv(p));
    }),
    setDice:(function (dice) {
        var vis_dice = this.getDiceDiv(dice);
        vis_dice.className = "dice dice-"+dice.face;
    })
};

function start() {
    game.createFields();
    game.visuals = visuals;
    game.visuals.game = game;
    game.visuals.createFields();
    game.initialize();
    game.begin();

    // game.test_move();
}


start();
