

module("Style");


test("hide()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    ele.position = "absolute";
    ele.visibility = "hidden";
    document.body.appendChild(ele);
    ok(ele.style.display != "none");
    subject.hide();
    equal(ele.style.display, "none");
});

test("show()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    ele.position = "absolute";
    ele.visibility = "hidden";
    document.body.appendChild(ele);
    equal(subject.style("display"), "block");
    ele.style.display = "inline-block";
    subject.hide();
    subject.show();
    equal(subject.style("display"), "inline-block");
});

test("style()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    document.body.appendChild(ele);
    subject.style({"width": "10px", "height": "20px"});
    equal(subject.style("width"), "10px");
    equal(subject.style("height"), "20px");
    document.body.removeChild(ele);
});

test("getStyle()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    document.body.appendChild(ele);
    ele.style.width = "100px";
    ele.style.height = "12ex";
    ele.style.border = "solid gold thin";
    equal(subject.style("width"), "100px");
    document.body.removeChild(ele);
});

test("setStyle()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    document.body.appendChild(ele);
    subject.style("float", "right"); // float maps to cssFloat
    equal(subject.style("float"), "right");
    subject.style("padding-right", "1px"); // handle properties with dash
    equal(subject.style("padding-right"), "1px");
    subject.style("padding-right", 2); // handle properties without unit
    equal(subject.style("padding-right"), "2px");
    subject.style("padding-right", 3.5); // Floor the value
    equal(subject.style("padding-right"), "3px");
    subject.style("font-size", "10px");
    subject.style("line-height", 2); // Should not append "px" to this property
    equal(subject.style("line-height"), "20px");
    document.body.removeChild(ele);
});
