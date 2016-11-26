var NUM_FIELDS = 40;
var NUM_PLAYER_FIGURES = 4;
var MOVEMENT_SPEED = 10;

var PLAYERS = {
    TOP:1,
    RIGHT:2,
    BOTTOM:3,
    LEFT:4
}

function figure(id, p) {
    this.id = id;
    this.player = p;
    this.finish = false;
}

function field(id, currentFigure, nextField, nextFinishField, finishPlayer, isFinishField, isStartingField) {
    this.id = id;
    this.currentFigure = currentFigure;
    this.nextField = nextField;
    this.nextFinishField = nextFinishField;
    this.finishPlayer = finishPlayer;
    this.isFinishField = isFinishField;
    this.isStartingField = isStartingField;
}

var game = {
    visuals:null,
    fields:[],
    finish_fields_top:[],
    finish_fields_right:[],
    finish_fields_bottom:[],
    finish_fields_left:[],
    finishes:{},
    player_figures:{},
    player_starts:{},
    movement_queue:[],
    createFields:(function() {
        var i;
        for (i = 0; i < NUM_FIELDS; i++) {
            this.fields.push(new field(i, null, null, null, null, false, false));
        };
        // alert(this.fields.length);
        for (i = 0; i < (this.fields.length-1); i++) {
            this.fields[i].nextField = this.fields[(i + 1)];
        };
        this.fields[this.fields.length-1].nextField = this.fields[0];
        for (i = 0; i < NUM_PLAYER_FIGURES; i++) {
            this.finish_fields_top.push(    new field(i, null, null, null, PLAYERS.TOP, true, false));
            this.finish_fields_right.push(  new field(i, null, null, null, PLAYERS.RIGHT, true, false));
            this.finish_fields_bottom.push( new field(i, null, null, null, PLAYERS.BOTTOM, true, false));
            this.finish_fields_left.push(   new field(i, null, null, null, PLAYERS.LEFT, true, false));
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
            this.player_figures[PLAYERS.TOP].push(      new figure(i, PLAYERS.TOP));
            this.player_figures[PLAYERS.RIGHT].push(    new figure(i, PLAYERS.RIGHT));
            this.player_figures[PLAYERS.BOTTOM].push(   new figure(i, PLAYERS.BOTTOM));
            this.player_figures[PLAYERS.LEFT].push(     new figure(i, PLAYERS.LEFT));

            this.player_starts[PLAYERS.TOP].push(    new field(i, null, this.fields[2], null, PLAYERS.TOP, false, true));
            this.player_starts[PLAYERS.RIGHT].push(  new field(i, null, this.fields[12], null, PLAYERS.RIGHT, false, true));
            this.player_starts[PLAYERS.BOTTOM].push( new field(i, null, this.fields[22], null, PLAYERS.BOTTOM, false, true));
            this.player_starts[PLAYERS.LEFT].push(   new field(i, null, this.fields[32], null, PLAYERS.LEFT, false, true));
        }

    }),
    initialize:(function () {
        for (i = 0; i < NUM_PLAYER_FIGURES; i++) {
            this.setPosition(this.player_starts[PLAYERS.TOP][i], this.player_figures[PLAYERS.TOP][i]);
            this.setPosition(this.player_starts[PLAYERS.RIGHT][i], this.player_figures[PLAYERS.RIGHT][i]);
            this.setPosition(this.player_starts[PLAYERS.BOTTOM][i], this.player_figures[PLAYERS.BOTTOM][i]);
            this.setPosition(this.player_starts[PLAYERS.LEFT][i], this.player_figures[PLAYERS.LEFT][i]);
        }
    }),
    setPosition:(function (position, figure) {
        position.currentFigure = figure;
        visuals.setPosition(position, figure);
    }),
    canMove:(function () {

    }),
    update:(function () {

    }),
    move:(function (a, b) {
        if (a.isStartingField) {
            this.movement_queue.push([a, a.nextField]);
            if (a.nextField != b) {
                a = a.nextField;
            }
        }
        if (this.fields.indexOf(a) >= 0 && this.fields.indexOf(b) >= 0) {
            // alert(this.fields.indexOf(b))
            if (a.id < b.id) {
                for(var i = a.id; i < b.id; i++) {
                    this.movement_queue.push([this.fields[i], this.fields[i+1]]);
                }
            } else {
                for(var i = a.id; i < this.fields.length-2; i++) {
                    this.movement_queue.push([this.fields[i], this.fields[i+1]]);
                }
                for(var i = 0; i < b.id; i++) {
                    this.movement_queue.push([this.fields[i], this.fields[i+1]]);
                }
            }
        } else if (this.fields.indexOf(a) >= 0 && b.isFinishField) {
            // alert("Hier");
            var cur = a;
            var next = a.nextField;
            do {
                this.movement_queue.push([cur, next]);
                cur = next;
                next = cur.nextField;
            } while (cur.finishPlayer != b.finishPlayer);
            this.movement_queue.push([cur, this.finishes[b.finishPlayer][0]]);
            for(var i = 0; i < b.id; i++) {
                this.movement_queue.push([this.finishes[b.finishPlayer][i], this.finishes[b.finishPlayer][i+1]]);
            }
        }
        if (this.movement_queue.length > 0) {
            this.make_move();
        }
    }),
    make_move:(function () {
        var pair = this.movement_queue.shift();
        this.visuals.make_move(pair[0], pair[1], pair[0].currentFigure);
        var fig = pair[0].currentFigure;
        pair[1].currentFigure = fig;
        pair[0].currentFigure = null;
    }),
    finished_move_callback:(function () {
        if (this.movement_queue.length > 0) {
            this.make_move();
        } else {
            this.update();
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
    player_figures:{},
    player_starts:{},
    interval:null,
    game:null,
    movable:(document.getElementById("movable-player")),
    moving:false,
    createFields:(function() {
        var i;
        for (i = 1; i <= NUM_FIELDS; i++) {
            this.fields.push(document.getElementById("field"+i));
        }
        for (i = 1; i <= NUM_PLAYER_FIGURES; i++) {
            this.finish_fields_top.push(    document.getElementById("inner-field-top-"+i));
            this.finish_fields_right.push(  document.getElementById("inner-field-right-"+i));
            this.finish_fields_bottom.push( document.getElementById("inner-field-bottom-"+i));
            this.finish_fields_left.push(   document.getElementById("inner-field-left-"+i));
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

        for (i = 1; i <= NUM_PLAYER_FIGURES; i++) {
            this.player_figures[PLAYERS.TOP].push(      document.getElementById("player-top-"+i));
            this.player_figures[PLAYERS.RIGHT].push(    document.getElementById("player-right-"+i));
            this.player_figures[PLAYERS.BOTTOM].push(   document.getElementById("player-bottom-"+i));
            this.player_figures[PLAYERS.LEFT].push(     document.getElementById("player-left-"+i));

            this.player_starts[PLAYERS.TOP].push(      document.getElementById("start-player-top-"+i));
            this.player_starts[PLAYERS.RIGHT].push(    document.getElementById("start-player-right-"+i));
            this.player_starts[PLAYERS.BOTTOM].push(   document.getElementById("start-player-bottom-"+i));
            this.player_starts[PLAYERS.LEFT].push(     document.getElementById("start-player-left-"+i));
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

        var finish_top = finish_top + ((finish_width- finish_child2_width) / 2);
        var finish_left = finish_left + ((finish_width - finish_child2_width) / 2);

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
            return;
        }
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
        var finish_child1_width = b.childNodes[0].clientWidth;
        var finish_child2_width = b.childNodes[0].childNodes[0].clientWidth;

        var start_top = start_top + ((start_width - start_child2_width) / 2);
        var start_left = start_left + ((start_width - start_child2_width) / 2);

        var finish_top = finish_top + ((finish_width- finish_child2_width) / 2);
        var finish_left = finish_left + ((finish_width - finish_child2_width) / 2);

        // this.movable.className = a.childNodes[0].childNodes[0].className;
        // // movable.style.backgroundColor = "brown";
        // this.movable.style.display = "block";
        // this.movable.style.zIndex = "100";
        // this.movable.style.top = movable_top + "px";
        // this.movable.style.left = movable_left + "px";
        // this.movable.style.position = "absolute";

        // reset start to normal
        // a.childNodes[0].childNodes[0].className = "field-inner";

        // This can't be the solution...
        var that = this;
        this.interval = setInterval(function(){
            that.updateMove(start_top, start_left, finish_top, finish_left, p);
        }, MOVEMENT_SPEED);

    }),
    make_move:(function (a, b, p) {
        this.moveFromTo(this.getFieldDiv(a), this.getFieldDiv(b), this.getPlayerDiv(p));
    })
};

function start() {
    game.createFields();
    game.visuals = visuals;
    game.visuals.game = game;
    game.visuals.createFields();
    game.initialize();

    // game.visuals.moveFromTo(visuals.fields[31], visuals.finish_fields_left[0]);
    game.test_move();
};

// addFields();

start();

// interval = window.setInterval(function(){
//     flicker()
// }, 1000);