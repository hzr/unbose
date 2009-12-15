

module("Style");


test("Hide", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    ok(ele.style.display != "none");
    subject.hide();
    equals(ele.style.display, "none");

});
