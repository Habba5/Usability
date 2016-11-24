
var fields = []
var finish_top = []
var finish_right = []
var finish_bottom = []
var finish_left = []

var interval;


function addFields() {
    for (i = 1; i <= 40; i++) {
        fields.push(document.getElementById("field"+i));
    }
    for (i = 1; i <= 4; i++) {
        finish_top.push(document.getElementById("inner-field-top-"+i));
    }
}

function finishMove(a, b, p) {

    if (b.className.includes("field-inner ")) {
        b.childNodes[0].childNodes[0].className = p.className;
    } else {
        b.childNodes[0].childNodes[0].className = p.className.replace('field-inner ','inner-field-inner ');
    }
    p.style.display = "none";

}

function updateMove(a, b, p) {
    console.log("updateMove");

    var player_left = parseInt(p.style.left);
    var player_top = parseInt(p.style.top);
    var player_width = parseInt(p.clientWidth);
    var player_height = parseInt(p.clientWidth);

    var start_top = a.offsetTop;
    var start_left = a.offsetLeft;

    var start_width = a.clientWidth;
    var start_child2_width = a.childNodes[0].childNodes[0].clientWidth;

    var finish_top = b.offsetTop;
    var finish_left = b.offsetLeft;

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
        clearInterval(interval);
        finishMove(a, b, p);
        return;
    }

    // console.log(transform_fac+"\n"+distance_done);

    if (distance_done % step == 0) {
        console.log("Transforming");
        if (finish_child2_width < player_width ) {
            p.style.width = (player_width - transform_fac) + "px";
            p.style.height = (player_height - transform_fac) + "px";
        }

        if (finish_child2_width > player_height) {
            p.style.width = (player_width + transform_fac) + "px";
            p.style.height = (player_height + transform_fac) + "px";
        }

    }


    // console.log(finish_left + " " + player_left);

    if (finish_left > player_left) {
        //move right
        // console.log(p.style.left);
        p.style.left = (player_left + 1) + "px";
        // console.log(p.style.left);
    }

    if (finish_left < player_left) {
        //move right
        // console.log(p.style.left);
        p.style.left = (player_left - 1) + "px";
        // console.log(p.style.left);
    }

    if (finish_top > player_top) {
        //move right
        // console.log(p.style.top);
        p.style.top = (player_top + 1) + "px";
        // console.log(p.style.top);
    }

    if (finish_top < player_top) {
        //move right
        // console.log(p.style.top);
        p.style.top = (player_top - 1) + "px";
        // console.log(p.style.top);
    }


}

function moveFromTo(a, b) {

    var movable = document.getElementById("movable-player")
    var start_top = a.offsetTop;
    var start_left = a.offsetLeft;

    var start_width = a.clientWidth;
    var start_child1_width = a.childNodes[0].clientWidth;
    var start_child2_width = a.childNodes[0].childNodes[0].clientWidth;
    var movable_top = start_top + ((start_width - start_child2_width) / 2);
    var movable_left = start_left + ((start_width - start_child2_width) / 2);


    // console.log("a:\n"
    //     + start_width + "px\n"
    //     + start_child1_width + "px\n"
    //     + start_child2_width + "px\n"
    //     + start_top + "px\n"
    //     + start_left + "px\n"
    //     + "\n"
    //     + movable_top + "px\n"
    //     + movable_left + "px\n"
    // );


    movable.className = a.childNodes[0].childNodes[0].className;
    // movable.style.backgroundColor = "brown";
    movable.style.display = "block";
    movable.style.zIndex = "100";
    movable.style.top = movable_top + "px";
    movable.style.left = movable_left + "px";
    movable.style.position = "absolute";

    // reset start to normal
    a.childNodes[0].childNodes[0].className = "field-inner"

    interval = setInterval(function(){
        updateMove(a, b, movable);
    }, 10);

}


function flicker() {

    // var c=document.getElementById("field1").childNodes[0].childNodes[0];
    // // alert(c);
    // if (c.className == "field-inner field-inner-green") {
    //     c.className = "field-inner";
    // } else {
    //     c.className = "field-inner field-inner-green";
    // }
    //

    // for (i = 0; i < fields.length; i++) {
    //     var c = fields[i].childNodes[0].childNodes[0];
    //     if (c.className == "field-inner field-inner-green") {
    //         c.className = "field-inner";
    //     } else if (c.className == "field-inner") {
    //         c.className = "field-inner field-inner-red";
    //     } else {
    //         c.className = "field-inner field-inner-green";
    //     }
    // }

    moveFromTo(fields[10], finish_top[1]);
    // alert(c)
}

addFields();

flicker();

// interval = window.setInterval(function(){
//     flicker()
// }, 1000);