
module("Attributes");

test("text()", function() {
    var subject = unbose("#qunit-header");

    equals(subject.text(), "unbose tests");

});

test("attr -> getAttr", function() {
    var ele = document.createElement("div");
    ele.foo = "bar";
    ele.setAttribute("meh", "bleh");
    var subject = unbose(ele);
    equals(subject.getAttr("foo"), "bar");
    equals(subject.getAttr("meh"), "bleh");
    equals(subject.attr("foo"), "bar");
    equals(subject.attr("meh"), "bleh");
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

    equals(subject, subject.addClass("flabaten"));

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
    ele.className = "asdf";
    equals(subject, subject.delClass("asdf"));

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


// should move to a core test suite I guess
test("elem()", function() {
    var ele = document.createElement("div");
    document.body.appendChild(ele);
    var subject = unbose(ele);

    equals(ele, subject.elem(0));
    var h2s = unbose("h2");
    equals(h2s.length, 2);
    equals(h2s.elem(0), document.getElementsByTagName("h2")[0]);
    equals(h2s.elem(1), document.getElementsByTagName("h2")[1]);
});

test("parent()", function() {
    var ele = document.createElement("div");
    document.body.appendChild(ele);
    var subject = unbose(ele);
    equals(subject.parent().elem(0), document.body);
    document.body.removeChild(ele);
});
