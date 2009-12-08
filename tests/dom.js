
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

test("addClass()", function() {
    var ele = document.createElement("div");
    var subject = unbose(ele);

    subject.addClass("foo");
    ok(subject.hasClass("foo"));

    subject.addClass("bar");
    ok(subject.hasClass("foo"));
    ok(subject.hasClass("bar"));

    subject.addClass("baz-meh");
    ok(subject.hasClass("foo"));
    ok(subject.hasClass("bar"));
    ok(subject.hasClass("baz-meh"));
});

test("delClass()", function() {
    var ele = document.createElement("div");
    ele.className = "foo bar baz meh";
    var subject = unbose(ele);

    subject.delClass("foo");
    ok(!subject.hasClass("foo"));
    ok(subject.hasClass("bar"));
    ok(subject.hasClass("baz"));
    ok(subject.hasClass("meh"));

    subject.delClass("meh");
    ok(!subject.hasClass("meh"));
    ok(subject.hasClass("bar"));
    ok(subject.hasClass("baz"));

    subject.delClass("bar");
    subject.delClass("baz");

    equals(ele.className, "");


});

test("toggleClass()", function() {
    var ele = document.createElement("div");
    ele.className = "foo bar baz";
    var subject = unbose(ele);

    ok(subject.hasClass("bar"));
    subject.toggleClass("bar");
    ok(!subject.hasClass("bar"));
    subject.toggleClass("bar");
    ok(subject.hasClass("bar"));

});

