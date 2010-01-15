

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

test("getStyle", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    document.body.appendChild(ele);
    ele.style.width = "100px";
    ele.style.height = "12ex";
    ele.style.border = "solid gold thin";
    equal(subject.getStyle("width"), "100px");
    equal(subject.getStyle("height"), "12ex");
    equal(subject.getStyle("border-left"), "solid gold 1px");
    document.body.removeChild(ele);
});

test("setStyle()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    document.body.appendChild(ele);
    subject.setStyle("float", "right"); // float maps to cssFloat
    equal(subject.getStyle("float"), "right");
    subject.style("padding-right", "1px"); // handle properties with dash
    equal(subject.getStyle("padding-right"), "1px");
    subject.style("padding-right", 2); // handle properties without unit
    equal(subject.getStyle("padding-right"), "2px");
    subject.setStyle("font-size", "10px");
    subject.setStyle("line-height", 2); // Should not append "px" to this property
    equal(subject.getStyle("line-height"), "20px");
    document.body.removeChild(ele);
});
