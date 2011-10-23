

module("Style");


test("hide()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    ele.position = "absolute";
    ele.visibility = "hidden";
    document.body.appendChild(ele);
    ok(ele.style.display != "none");
    subject.hide();
    equals(ele.style.display, "none");
});

test("show()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    ele.position = "absolute";
    ele.visibility = "hidden";
    document.body.appendChild(ele);
    equals(subject.style("display"), "block");
    ele.style.display = "inline-block";
    subject.hide();
    subject.show();
    equals(subject.style("display"), "inline-block");
    subject.hide();
    subject.hide();
    subject.show();
    equals(ele.style.display, "inline-block");
});

test("style()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    document.body.appendChild(ele);
    subject.style({"width": "10px", "height": "20px"});
    equals(subject.style("width"), "10px");
    equals(subject.style("height"), "20px");
    document.body.removeChild(ele);
});

test("getStyle()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    document.body.appendChild(ele);
    ele.style.width = "100px";
    ele.style.height = "12ex";
    ele.style.border = "solid gold thin";
    equals(subject.style("width"), "100px");
    document.body.removeChild(ele);
});

test("setStyle()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    document.body.appendChild(ele);
    subject.style("display", "inline");
    equals(subject.style("display"), "inline");
    subject.style("display", null);
    equals(subject.style("display"), "block");
    subject.style("padding-right", "1px"); // handle properties with dash
    equals(subject.style("padding-right"), "1px");
    subject.style("padding-right", 2); // handle properties without unit
    equals(subject.style("padding-right"), "2px");
    subject.style("padding-right", 3.5); // Floor the value
    equals(subject.style("padding-right"), "3px");
    subject.style("font-size", "10px");
    subject.style("line-height", 2); // Should not append "px" to this property
    equals(subject.style("line-height"), "20px");
    document.body.removeChild(ele);
});
