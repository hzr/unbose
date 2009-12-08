
module("Attributes");

test("text()", function() {
    var subject = unbose("#qunit-header");

    equals(subject.text(), "unbose tests");

});

test("hasClass()", function() {
    var ele = document.createElement("div");
    ele.className = "test";
    var subject = unbose(ele);

    ok(subject.hasClass("test"));
    ok(!subject.hasClass("testt"));
    ok(!subject.hasClass("ttest"));

    ele.className = "foo flabaten bar";
    ok(subject.hasClass("foo"));
    ok(subject.hasClass("flabaten"));
    ok(subject.hasClass("bar"));

    ok(!subject.hasClass("ar"));
    ok(!subject.hasClass("baar"));
    ok(!subject.hasClass("bara"));
});
