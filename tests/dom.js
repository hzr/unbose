
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

    ok(!subject.hasClass("bar"));
    ok(!subject.hasClass("baz"));
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
test("elem(n)", function() {
    var ele = document.createElement("div");
    document.body.appendChild(ele);
    var subject = unbose(ele);

    equals(ele, subject.elem(0));
    var h2s = unbose("h2");
    equals(h2s.length, 2);
    equals(h2s.elem(0), document.getElementsByTagName("h2")[0]);
    equals(h2s.elem(1), document.getElementsByTagName("h2")[1]);
});

test("elem()", function() {
    var h2s = unbose("h2").elem();
    expect(3);
    ok(h2s);
    ok(h2s.constructor == Array);
    equals(h2s.length, 2);
});

test("parent()", function() {
    var ele = document.createElement("div");
    document.body.appendChild(ele);
    var subject = unbose(ele);
    equals(subject.parent().elem(0), document.body);
    document.body.removeChild(ele);
});

test("eleFromTpl", function() {
    var tpl = ["div", {id: "testid", "class": "testclass"},
        ["h1", "title1"],
        ["p", "paragraph", ["a", {"href": "testlink"}]],
        ["h1", "title2"]
    ];

    var ele = unbose.eleFromTpl(tpl);
    ok(ele);
    ele = unbose(ele);
    ok(ele);
    equals(ele.length, 1);
    equals(ele.find("a").attr("href"), "testlink");
    equals(ele.find("h1").length, 2);
    equals(ele.find("h1").nth(0).text(), "title1");
    equals(ele.find("h1").nth(1).text(), "title2");
    equals(ele.find("div>p>a").length, 1);
});

test("eleFromZen", function() {
    var zen = "div#testid.testclass>h1+(p>a href=testlink)+h1";
    var ele = unbose.eleFromZen(zen);
    ok(ele, "Elem generated");
    ele = unbose(ele);
    ok(ele, "Unbose wraps zen elem");
    equals(ele.length, 1);
    equals(ele.find("a").attr("href"), "testlink");
    equals(ele.find("h1").length, 2);
    equals(ele.find("div>p>a").length, 1);
});


test("appendTpl", function() {
    var tpl = ["div", {id: "testid", "class": "testclass"},
        ["h1", "title1"],
        ["p", "paragraph", ["a", {"href": "testlink"}]],
        ["h1", "title2"]
    ];

    var ele = unbose(document.createElement("div"));

    ok(ele);
    ele.appendTpl(tpl);
    ok(ele);
    equals(ele.length, 1);
    equals(ele.find("a").attr("href"), "testlink");
    equals(ele.find("h1").length, 2);
    equals(ele.find("h1").nth(0).text(), "title1");
    equals(ele.find("h1").nth(1).text(), "title2");
    equals(ele.find("div>div>p>a").length, 1);
});



test("appendZen", function() {
    var zen = "div#testid.testclass>h1+(p>a href=testlink)+h1";
    var ele = unbose(document.createElement("div"));
    ok(ele, "Elem generated");
    ele = unbose(ele);
    ok(ele, "Unbose wraps zen elem");
    ele.appendZen(zen);
    equals(ele.length, 1);
    equals(ele.find("a").attr("href"), "testlink");
    equals(ele.find("h1").length, 2);
    equals(ele.find("div>div>p>a").length, 1);
});
