

module("Style");


test("Hide", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    ok(ele.style.display != "none");
    subject.hide();
    equal(ele.style.display, "none");

});
