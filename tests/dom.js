
module("DOM");

test("text()", function() {
    var subject = Unbose("#qunit-header");

    equal(subject.text(), "unbose tests");

    subject.text("Unbose tests");

    equal(subject.text(), "Unbose tests");
});

test("attr -> getAttr", function() {
    var ele = document.createElement("div");
    ele.foo = "bar";
    ele.setAttribute("meh", "bleh");
    var subject = Unbose(ele);
    equal(subject.getAttr("foo"), "bar");
    equal(subject.getAttr("meh"), "bleh");
    equal(subject.attr("foo"), "bar");
    equal(subject.attr("meh"), "bleh");
});

test("empty()", function() {
    var ele = Unbose.eleFromZen("body>i+p+div>i+i+span");
    Unbose(ele).empty();
    equal(ele.innerHTML, "");
});

test("prev()", function() {
    var tpl = Unbose.eleFromZen("body>div+span+div+span+i#b.c+span");
    var ele = Unbose(tpl).find("span").prev();
    equal(ele.nth(0).name(), "div");
    equal(ele.length, 3);
    ele = Unbose(tpl).find("span").prev("i#b.c");
    equal(ele.length, 1);
    ele = Unbose(tpl).find("span").prev(""); // Filter everything
    equal(ele.length, 0);
});

test("next()", function() {
    var tpl = Unbose.eleFromZen("body>div+span+div+span+div+i");
    var ele = Unbose(tpl).find("div").next();
    equal(ele.nth(0).name(), "span");
    equal(ele.length, 3);
    ele = Unbose(tpl).find("div").next("i");
    equal(ele.length, 1);
});

test("children()", function() {
    var ele = Unbose.eleFromZen("body>div+span+div+span");
    ele = Unbose(ele);
    equal(ele.children().length, 4);
    equal(ele.children("span").length, 2);
});

test("remove()", function() {
    var ele = Unbose.eleFromZen("div>span");
    ele = Unbose(ele).find("span");
    ele.remove();
    equal(ele.find("span").length, 0);
});

test("hasClass()", function() {
    var ele = document.createElement("div");
    ele.className = "test";
    var subject = Unbose(ele);

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
    var subject = Unbose(ele);

    subject.addClass("foo");
    ok(subject.hasClass("foo"));

    subject.addClass("bar");
    ok(subject.hasClass("foo"));
    ok(subject.hasClass("bar"));

    subject.addClass("baz-meh");
    ok(subject.hasClass("foo"));
    ok(subject.hasClass("bar"));
    ok(subject.hasClass("baz-meh"));

    equal(subject, subject.addClass("flabaten"));
});

test("delClass()", function() {
    var ele = document.createElement("div");
    ele.className = "foo\rbar\nbaz\tmeh\vblah";
    var subject = Unbose(ele);

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
    equal(subject, subject.delClass("asdf"));

    ele.className = "";
    subject.addClass("foo bar baz");
    subject.delClass("baz bar foo");
    ok(!subject.hasClass("foo"));
    ok(!subject.hasClass("bar"));
    ok(!subject.hasClass("baz"));

});

test("toggleClass()", function() {
    var ele = document.createElement("div");
    ele.className = "foo bar baz";
    var subject = Unbose(ele);

    ok(subject.hasClass("bar"));
    subject.toggleClass("bar");
    ok(!subject.hasClass("bar"));
    subject.toggleClass("bar");
    ok(subject.hasClass("bar"));

});

test("nth(n)", function() {
    var eles = Unbose.fromZen("div.a + div.b + div.c");
    equals(eles.nth(2).attr("class"), "c");
    equals(eles.nth(-4).attr("class"), "c");
});

test("elem(n)", function() {
    var ele = document.createElement("div");
    document.body.appendChild(ele);
    var subject = Unbose(ele);

    equal(ele, subject.elem(0));
    var h2s = Unbose("h2");
    equal(h2s.length, 2);
    equal(h2s.elem(0), document.getElementsByTagName("h2")[0]);
    equal(h2s.elem(1), document.getElementsByTagName("h2")[1]);

    eles = Unbose.fromZen("div.a + div.b + div.c");
    equals(eles.elem(-1).className, "c");
    equals(eles.elem(-4).className, "c");
});

test("elem()", function() {
    var h2s = Unbose("h2").elem();
    expect(3);
    ok(h2s);
    ok(h2s.constructor == Array);
    equal(h2s.length, 2);
});

test("parent()", function() {
    var ele = document.createElement("div");
    document.body.appendChild(ele);
    var subject = Unbose(ele);
    equal(subject.parent().elem(0), document.body);
    document.body.removeChild(ele);

    ele = Unbose.eleFromZen("body>div+span+div+span");
    ele = Unbose(ele).find("div");
    equal(ele.parent().length, 1);
});


test("ancestor()", function() {
    var ele = Unbose(Unbose.eleFromZen("div.foo>div.bar>div.baz"));
    var tip = ele.find(".baz");

    equal(tip.ancestor(".bar").length, 1);
    equal(tip.ancestor(".bar").elem(0), ele.find(".bar").elem(0));
    ok(tip.ancestor(".bar").hasClass("bar"));

    equal(tip.ancestor(".foo").length, 1);
    equal(tip.ancestor(".foo").elem(0), ele.elem(0));
    ok(tip.ancestor(".foo").hasClass("foo"));

    equal(tip.ancestor("bogus").length, 0);
    equal(tip.ancestor("").length, 0);
});


test("siblings()", function() {
    var ele = Unbose.eleFromZen("body>i+p+div>i+i+span");
    var subject = Unbose(ele).find("p");
    equal(subject.siblings().length, 2);
    subject = Unbose(ele).find("i");
    equal(subject.siblings().length, 5);
    equal(subject.siblings("i").length, 2);
});

test("eleFromTpl", function() {
    var tpl = ["div", {id: "testid", "class": "testclass"},
        ["h1", "title1"],
        ["p", "paragraph", ["a", {"href": "testlink"}]],
        ["h1#id.class1.class2", "title2"],
        ["span#id", {id: "id2"}]
    ];

    var ele = Unbose.eleFromTpl(tpl);
    ok(ele);
    ele = Unbose(ele);
    ok(ele);
    equal(ele.length, 1);
    equal(ele.find("a").attr("href"), "testlink");
    equal(ele.find("h1").length, 2);
    equal(ele.find("h1").nth(0).text(), "title1");
    equal(ele.find("h1").nth(1).text(), "title2");
    equal(ele.find("div>p>a").length, 1);
    equal(ele.find("h1").nth(1).attr("id"), "id");
    equal(ele.find("span").attr("id"), "id2");
    ok(ele.find("h1").nth(1).hasClass("class1"));
});

test("eleFromTpl class/id parsing", function() {
    var tpl = ["div#foo.bar#baz"];
    var ele = Unbose.eleFromTpl(tpl);
    ok(ele);
    ele = Unbose(ele);
    ok(ele);
    equal(ele.length, 1);
    equal(ele.attr("id"), "baz");
    ok(ele.hasClass("bar"));
});

test("eleFromZen", function() {
    expect(7);
    var zen = "div#testid.testclass>h1+(p>a href=testlink)+h1";
    var ele = Unbose.eleFromZen(zen);
    ok(ele, "Elem generated");
    ok(Unbose.eleFromZen("div+div"), "Elem generated");
    ele = Unbose(ele);
    ok(ele, "Unbose wraps zen elem");
    equal(ele.length, 1);
    equal(ele.find("a").attr("href"), "testlink");
    equal(ele.find("h1").length, 2);
    equal(ele.find("div>p>a").length, 1);
});


test("append()", function() {
    // test zen
    var ele = Unbose(document.createElement("div"));
    ele.append("div.first+div.last");
    equal(ele.find("div").length, 2);
    ok(ele.find("div").nth(0).hasClass("first"));
    ok(ele.find("div").nth(1).hasClass("last"));

    // test tpl
    var ele = Unbose(document.createElement("div"));
    ele.append([["div" {class: "first"}], ["div" {class: "last"}]]);
    equal(ele.find("div").length, 2);
    ok(ele.find("div").nth(0).hasClass("first"));
    ok(ele.find("div").nth(1).hasClass("last"));

    // test elem
    var ele = Unbose(document.createElement("div"));
    var ele2 = document.createElement("div");
    ele2.className="first";
    var ele3 = document.createElement("div");
    ele3.className="last";

    ele.append(ele2);
    ele.append(ele3);
    equal(ele.find("div").length, 2);
    ok(ele.find("div").nth(0).hasClass("first"));
    ok(ele.find("div").nth(1).hasClass("last"));

    // todo test appendUnbose

});


test("appendTpl", function() {
    var tpl = ["div", {id: "testid", "class": "testclass"},
        ["h1", "title1"],
        ["p", "paragraph", ["a", {"href": "testlink"}]],
        ["h1", "title2"]
    ];

    var ele = Unbose(document.createElement("div"));

    ok(ele);
    ele.appendTpl(tpl);
    ok(ele);
    equal(ele.length, 1);
    equal(ele.find("a").attr("href"), "testlink");
    equal(ele.find("h1").length, 2);
    equal(ele.find("h1").nth(0).text(), "title1");
    equal(ele.find("h1").nth(1).text(), "title2");
    equal(ele.find("div>div>p>a").length, 1);
});

test("appendZen", function() {
    var zen = "div#testid.testclass>h1+(p>a href=testlink)+h1";
    var ele = Unbose(document.createElement("div"));
    ok(ele, "Elem generated");
    ele = Unbose(ele);
    ok(ele, "Unbose wraps zen elem");
    ele.appendZen(zen);
    equal(ele.length, 1);
    equal(ele.find("a").attr("href"), "testlink");
    equal(ele.find("h1").length, 2);
    equal(ele.find("div>div>p>a").length, 1);
});

test("val()", function() {
    var ele = Unbose.eleFromZen("div>form>input#text type=text value=foo");
    var subject = Unbose(ele).find("input");
    equal(subject.val(), "foo");
    subject.val("bar");
    equal(subject.val(), "bar");
});

test("height()", function() {
    var ele = document.createElement("div");
    ele.style.cssText = "width: 100px; height: 120px; padding: 2px 4px; border: 3px solid; margin: 5px; position: absolute; visibility: hidden;";
    document.body.appendChild(ele);
    equal(Unbose(ele).height(), 120);
    ele.style.height = "100px"; // Remove borders and padding
    equal(Unbose(ele).height(), 100);
    Unbose(ele).height(80);
    equal(Unbose(ele).height(), 80);
    Unbose(ele).height("0x10");
    equal(Unbose(ele).height(), 80);
    Unbose(ele).height("-1px");
    equal(Unbose(ele).height(), 0);
    Unbose(ele).height(80);
    Unbose(ele).height("bogus"); // should not set anything
    equal(Unbose(ele).height(), 80);
});

test("width()", function() {
    var ele = document.createElement("div");
    ele.style.cssText = "width: 120px; height: 100px; padding: 2px 4px; border: 3px solid; margin: 5px; position: absolute; visibility: hidden;";
    document.body.appendChild(ele);
    equal(Unbose(ele).width(), 120);
    ele.style.width = "100px"; // Remove borders and padding
    equal(Unbose(ele).width(), 100);
    Unbose(ele).width(80);
    equal(Unbose(ele).width(), 80);
    Unbose(ele).width(-1);
    equal(Unbose(ele).width(), 0);
    Unbose(ele).width(80);
    Unbose(ele).width("bogus"); // should not set anything
    equal(Unbose(ele).width(), 80);
});
