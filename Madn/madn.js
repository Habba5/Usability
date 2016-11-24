
var fields = []

function addFields() {
    for (i = 1; i <= 40; i++) {
        fields.push(document.getElementById("field"+i));
    }
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

    for (i = 0; i < fields.length; i++) {
        var c = fields[i].childNodes[0].childNodes[0];
        if (c.className == "field-inner field-inner-green") {
            c.className = "field-inner";
        } else if (c.className == "field-inner") {
            c.className = "field-inner field-inner-red";
        } else {
            c.className = "field-inner field-inner-green";
        }
    }

    // alert(c)
}

addFields();
flicker();

window.setInterval(function(){
    flicker()
}, 1000);