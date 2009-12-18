

module("Style");


test("Hide", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    ok(ele.style.display != "none");
    subject.hide();
    equal(ele.style.display, "none");

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
