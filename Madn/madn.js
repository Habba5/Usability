var NUM_FIELDS = 40;
var NUM_PLAYER_FIGURES = 4;
var MOVEMENT_SPEED = 10;

var PLAYERS = {
    TOP:1,
    RIGHT:2,
    BOTTOM:3,
    LEFT:4
}

function figure(p) {
    this.player = p;
    this.finish = false;
}

function field(id, currentFigure, nextField, nextFinishField, finishPlayer, isFinishField) {
    this.id = id;
    this.currentFigure = currentFigure;
    this.nextField = nextField;
    this.nextFinishField = nextFinishField;
    this.finishPlayer = finishPlayer;
    this.isFinishField = isFinishField;
}

var game = {
    visuals:null,
    fields:[],
    finish_fields_top:[],
    finish_fields_right:[],
    finish_fields_bottom:[],
    finish_fields_left:[],
    finishes:{},
    movement_queue:[],
    createFields:(function() {
        var i;
        for (i = 0; i < NUM_FIELDS; i++) {
            this.fields.push(new field(i, null, null, null, null, false));
        };
        // alert(this.fields.length);
        for (i = 0; i < (this.fields.length-1); i++) {
            this.fields[i].nextField = this.fields[(i + 1)];
        };
        this.fields[this.fields.length-1].nextField = this.fields[0];
        for (i = 0; i < NUM_PLAYER_FIGURES; i++) {
            this.finish_fields_top.push(    new field(i, null, null, null, PLAYERS.TOP, true));
            this.finish_fields_right.push(  new field(i, null, null, null, PLAYERS.RIGHT, true));
            this.finish_fields_bottom.push( new field(i, null, null, null, PLAYERS.BOTTOM, true));
            this.finish_fields_left.push(   new field(i, null, null, null, PLAYERS.LEFT, true));
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

    }),
    update:(function () {

    }),
    move:(function (a, b) {
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
            } while (cur.finishPlayer != b.finishPlayer)
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
        this.visuals.make_move(pair[0], pair[1]);
    }),
    finished_move_callback:(function () {
        if (this.movement_queue.length > 0) {
            this.make_move();
        } else {
            this.update();
        }
    }),
    test_move:(function (){
        var fig = new figure(PLAYERS.LEFT);
        this.fields[0].currentFigure = fig;
        // this.move(this.fields[0], this.fields[5]);
        this.move(this.fields[0], this.finish_fields_left[3]);
    })
};


var visuals = {
    fields:[],
    finish_fields_top:[],
    finish_fields_right:[],
    finish_fields_bottom:[],
    finish_fields_left:[],
    finishes:{},
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
    }),
    updateMove:(function(a, b, p) {
        console.log("updateMove");

        var player_left = parseInt(p.style.left);
        var player_top = parseInt(p.style.top);
        var player_width = parseInt(p.clientWidth);
        var player_height = parseInt(p.clientWidth);

        var start_rect = a.getBoundingClientRect();
        var start_top = start_rect.top;
        var start_left = start_rect.left;

        var start_width = a.clientWidth;
        var start_child2_width = a.childNodes[0].childNodes[0].clientWidth;

        var finish_rect = b.getBoundingClientRect();
        var finish_top = finish_rect.top;
        var finish_left = finish_rect.left;

        var finish_width = b.clientWidth;
        var finish_child1_width = b.childNodes[0].clientWidth;
        var finish_child2_width = b.childNodes[0].childNodes[0].clientWidth;

        var start_top = start_top + ((start_width - start_child2_width) / 2);
        var start_left = start_left + ((start_width - start_child2_width) / 2);

        var finish_top = finish_top + ((finish_width- finish_child2_width) / 2);
        var finish_left = finish_left + ((finish_width - finish_child2_width) / 2);

        var distance = Math.abs((finish_top - start_top)) + Math.abs((finish_left - start_left));
        var distance_done = Math.abs((finish_top - player_top)) + Math.abs((finish_left - player_left));
        var fac = 10;
        var step = distance / fac;

        var transform_fac = Math.abs((finish_width - start_width))/fac;

        if (finish_top == player_top && finish_left == player_left) {
            var that = this;
            clearInterval(that.interval);
            this.moving = false;
            b.childNodes[0].childNodes[0].className = p.className;
            p.style.display = "none";
            this.game.finished_move_callback();
            return;
        }

        if (finish_left > player_left) {
            //move right
            // console.log(p.style.left);
            p.style.left = (player_left + 1) + "px";
            // console.log(p.style.left);
        }

        if (finish_left < player_left) {
            //move left
            // console.log(p.style.left);
            p.style.left = (player_left - 1) + "px";
            // console.log(p.style.left);
        }

        if (finish_top > player_top) {
            //move up
            // console.log(p.style.top);
            p.style.top = (player_top + 1) + "px";
            // console.log(p.style.top);
        }

        if (finish_top < player_top) {
            //move down
            // console.log(p.style.top);
            p.style.top = (player_top - 1) + "px";
            // console.log(p.style.top);
        }
    }),
    moveFromTo:(function(a, b) {
        var start_rect = a.getBoundingClientRect();
        var start_top = start_rect.top;
        var start_left = start_rect.left;

        var start_width = a.clientWidth;
        var start_child1_width = a.childNodes[0].clientWidth;
        var start_child2_width = a.childNodes[0].childNodes[0].clientWidth;
        var movable_top = start_top + ((start_width - start_child2_width) / 2);
        var movable_left = start_left + ((start_width - start_child2_width) / 2);

        this.movable.className = a.childNodes[0].childNodes[0].className;
        // movable.style.backgroundColor = "brown";
        this.movable.style.display = "block";
        this.movable.style.zIndex = "100";
        this.movable.style.top = movable_top + "px";
        this.movable.style.left = movable_left + "px";
        this.movable.style.position = "absolute";

        // reset start to normal
        a.childNodes[0].childNodes[0].className = "field-inner";

        // This can't be the solution...
        var that = this;
        this.interval = setInterval(function(){
            that.updateMove(a, b, that.movable);
        }, MOVEMENT_SPEED);

    }),
    make_move:(function (a, b) {
        if (!a.isFinishField && !b.isFinishField) {
            this.moveFromTo(this.fields[a.id], this.fields[b.id]);
        } else if (!a.isFinishField && b.isFinishField) {
            this.moveFromTo(this.fields[a.id], this.finishes[b.finishPlayer][0]);
        } else if (a.isFinishField && b.isFinishField) {
            this.moveFromTo(this.finishes[a.finishPlayer][a.id], this.finishes[b.finishPlayer][b.id]);
        }
        this.moving = true;
    })
};

function start() {
    game.createFields();
    game.visuals = visuals;
    game.visuals.game = game;
    game.visuals.createFields();

    // game.visuals.moveFromTo(visuals.fields[31], visuals.finish_fields_left[0]);
    game.test_move();
};

// addFields();

start();

// interval = window.setInterval(function(){
//     flicker()
// }, 1000);