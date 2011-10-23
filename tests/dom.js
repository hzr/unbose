module("DOM");

test("add()", function() {
    var eles = Unbose.fromZen("div + div + div");
    equals(eles.length, 3);
    eles.add(document.createElement("div"));
    equals(eles.length, 4);
    eles.add("body");
    equals(eles.length, 5);
    eles.add(Unbose.fromZen("div + div"));
    equals(eles.length, 7);
    eles.add(Unbose.fromZen("div + div").add(Unbose.fromZen("div")));
    equals(eles.length, 10);

    eles = Unbose();
    eles.add(Unbose.fromZen("div")).add(Unbose.fromZen("p"));
    equals(eles.length, 2);
    eles = Unbose();
    eles.add(Unbose.fromZen("div").add(Unbose.fromZen("p")));
    equals(eles.length, 2);
});

test("forEach()", function() {
    var eles = Unbose.fromZen("div + div + div");
    eles.forEach(function(ele, idx) {
        ele.text(idx);
    });
    equals(eles.nth(0).text(), "0");
    equals(eles.nth(2).text(), "2");

    eles.forEach(function(ele, idx) {
        ele.text(idx);
        this.textContent += "0";
    });
    equals(eles.nth(0).text(), "00");
    equals(eles.nth(2).text(), "20");

    eles.nth(0).forEach(function() {
        equals(this, window);
    }, window);
});

test("find()", function() {
    var eles = Unbose.fromZen("div > p.a > b.a > i");
    equals(eles.find(".a").find("i").length, 1);
});

test("text()", function() {
    var subject = Unbose("#qunit-header");

    subject.text("Unbose tests");

    equals(subject.text(), "Unbose tests");
});

test("attr()", function() {
    var ele = document.createElement("div");
    ele.foo = "bar";
    ele.setAttribute("meh", "bleh");
    var subject = Unbose(ele);
    equals(subject.attr("foo"), undefined, "Properties should not be returned");
    equals(subject.attr("meh"), "bleh");
    equals(subject.attr("meh"), "bleh");
    equals(subject.attr("bogus"), undefined);
});

test("removeAttr()", function() {
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    subject.attr("meh", "bleh");
    equals(subject.attr("meh"), "bleh");
    subject.removeAttr("meh");
    equals(subject.attr("meh"), undefined);
});

test("empty()", function() {
    var ele = Unbose.eleFromZen("body>i+p+div>i+i+span");
    Unbose(ele).empty();
    equals(ele.innerHTML, "");
});

test("name()", function() {
    var ele = Unbose.eleFromZen("div");
    equals(Unbose(ele).name(), "div");
    equals(Unbose(ele).find("bogus").name(), undefined);
});

test("prev()", function() {
    var tpl = Unbose.eleFromZen("body>div+span+div+span+i#b.c+span");
    var ele = Unbose(tpl).find("span").prev();
    equals(ele.nth(0).name(), "div");
    equals(ele.length, 3);
    ele = Unbose(tpl).find("span").prev("i#b.c");
    equals(ele.length, 1);
});

test("next()", function() {
    var tpl = Unbose.eleFromZen("body>div+span+div+span+div+i");
    var ele = Unbose(tpl).find("div").next();
    equals(ele.nth(0).name(), "span");
    equals(ele.length, 3);
    ele = Unbose(tpl).find("div").next("i");
    equals(ele.length, 1);
    ele = Unbose(tpl).find("div").next("i").next().next().next();
    equals(ele.length, 0);
});

test("children()", function() {
    var ele = Unbose.eleFromZen("body>div+span+div+span");
    ele = Unbose(ele);
    equals(ele.children().length, 4);
    equals(ele.children("span").length, 2);
});

test("remove()", function() {
    var ele = Unbose.eleFromZen("div>span.a+span.b");
    var spans = Unbose(ele).find("span");
    spans.remove(".b");
    equals(Unbose(ele).find("span").length, 1);
    spans.remove();
    equals(Unbose(ele).find("span").length, 0);
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

    Object.prototype.customProperty = true;

    ele.className = "";
    try {
        ok (
            !subject.hasClass("customProperty") &&
            !subject.hasClass("toString") &&
            !subject.hasClass("constructor") &&
            !subject.hasClass("toLocaleString") &&
            !subject.hasClass("valueOf") &&
            !subject.hasClass("hasOwnProperty") &&
            !subject.hasClass("isPrototypeOf") &&
            !subject.hasClass("propertyIsEnumerable")
        );
    }
    catch (e) {
        ok(false, 'Error checking special class names');
    }
    ele.className = "customProperty toString constructor toLocaleString valueOf hasOwnProperty isPrototypeOf propertyIsEnumerable";
    try {
        ok (
            subject.hasClass("customProperty") &&
            subject.hasClass("toString") &&
            subject.hasClass("constructor") &&
            subject.hasClass("toLocaleString") &&
            subject.hasClass("valueOf") &&
            subject.hasClass("hasOwnProperty") &&
            subject.hasClass("isPrototypeOf") &&
            subject.hasClass("propertyIsEnumerable")
        );
    }
    catch (e) {
        ok(false, 'Error checking special class names');
    }

    delete Object.prototype.customProperty;
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

    equals(subject, subject.addClass("flabaten"));
});

test("removeClass()", function() {
    var ele = document.createElement("div");
    ele.className = "foo\rbar\nbaz\tmeh\vblah";
    var subject = Unbose(ele);

    subject.removeClass("foo");
    ok(!subject.hasClass("foo"));
    ok(subject.hasClass("bar"));
    ok(subject.hasClass("baz"));
    ok(!subject.hasClass("meh"), "Vertical tab (\\v) is not a space character per HTML5");
    subject.removeClass("meh");
    ok(!subject.hasClass("meh"));
    ok(subject.hasClass("bar"));
    ok(subject.hasClass("baz"));

    subject.removeClass("bar");
    subject.removeClass("baz");

    ok(!subject.hasClass("bar"));
    ok(!subject.hasClass("baz"));
    ele.className = "asdf";
    equals(subject, subject.removeClass("asdf"));

    ele.className = "";
    subject.addClass("foo bar baz");
    subject.removeClass("baz bar foo");
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

    ele.className = "foo";
    subject.toggleClass("foo bar");
    equals(subject.attr("class").trim(), "bar");
});

test("nth()", function() {
    var eles = Unbose.fromZen("div.a + div.b + div.c");
    equals(eles.nth(2).attr("class"), "c");
    equals(eles.nth(3).attr("class"), undefined);
    equals(eles.nth(-4).attr("class"), "c");
    equals(eles.nth().length, 3);
});

test("elem()", function() {
    var ele = document.createElement("div");
    document.body.appendChild(ele);
    var subject = Unbose(ele);

    equals(ele, subject.elem(0));
    var h2s = Unbose("h2");
    equals(h2s.length, 2);
    equals(h2s.elem(0), document.getElementsByTagName("h2")[0]);
    equals(h2s.elem(1), document.getElementsByTagName("h2")[1]);

    eles = Unbose.fromZen("div.a + div.b + div.c");
    equals(eles.elem(-1).className, "c");
    equals(eles.elem(-4).className, "c");
    var h2s = Unbose("h2").elem();
    ok(h2s);
    ok(h2s.constructor == Array);
    equals(h2s.length, 2);
});

test("slice()", function() {
    var eles = Unbose.fromZen("h1 + h2 + h3 + h4");
    equals(eles.slice(1).length, 3);
    equals(eles.slice(1,1).length, 0);
    equals(eles.slice(1,10).length, 3);
    equals(eles.slice(-1).nth(0).name(), "h4");
    equals(eles.slice(-3,-1).length, 2);
    equals(eles.slice(-3,4).length, 3);
    equals(eles.slice(-4,0).length, 0);
    equals(eles.slice(0,4,2).length, 2);
    equals(eles.slice(0,4,5).length, 1);
    equals(eles.slice(0,4,2).nth(0).name(), "h1");
    equals(eles.slice(0,4,2).nth(1).name(), "h3");
    equals(eles.slice(0,4,2).nth(2).length, 0);
    equals(eles.slice(1,4,2).nth(1).name(), "h4");
    equals(eles.slice(1,4,-2).nth(1).name(), "h4", "Should behave just like positive steps");
});

test("ancestors()", function() {
    var eles = Unbose.eleFromZen("body>div>div>span>div>i.t+b.t");
    ele = Unbose(eles).find("i");
    equals(ele.ancestors().length, 6);
    equals(ele.ancestors("div").length, 3);
    ele = Unbose(eles).find(".t");
    equals(ele.length, 2);
    equals(ele.ancestors().length, 6);
    equals(ele.ancestors("div").length, 3);
});

test("parent()", function() {
    var ele = document.createElement("div");
    document.body.appendChild(ele);
    var subject = Unbose(ele);
    equals(subject.parent().elem(0), document.body);
    document.body.removeChild(ele);

    ele = Unbose.eleFromZen("body>div+span+div+span");
    ele = Unbose(ele).find("div");
    equals(ele.parent().length, 1);

    ele = Unbose("html");
    equals(ele.parent().length, 0);
    ok(Unbose.fromZen("div").parent());
});


test("closest()", function() {
    var ele = Unbose(Unbose.eleFromZen("div.foo>div.bar>div.baz"));
    var tip = ele.find(".baz");

    equals(tip.closest(".bar").length, 1);
    equals(tip.closest(".bar").elem(0), ele.find(".bar").elem(0));
    ok(tip.closest(".bar").hasClass("bar"));

    equals(tip.closest(".foo").length, 1);
    equals(tip.closest(".foo").elem(0), ele.elem(0));
    ok(tip.closest(".foo").hasClass("foo"));

    equals(tip.closest("bogus").length, 0);
    equals(Unbose("p").closest("bogus").length, 0, "Should not go to the document node");

    ele = Unbose(Unbose.eleFromZen("div.a>(p.b>i)+(p>i)+i"));
    equals(ele.find("i").closest("p").length, 2);
    equals(ele.find("i").closest("p,div").first().elem(0).className, "b", "Multiple selectors");
    equals(ele.find("i").closest("p,div").last().elem(0).className, "a", "Multiple selectors");

    ele = Unbose(Unbose.eleFromZen("div.foo>div.bar+div.bar"));
    equals(ele.find(".bar").closest(".foo").length, 1);
});


test("siblings()", function() {
    var ele = Unbose.eleFromZen("body>i+p+div>i+i+span");
    var subject = Unbose(ele).find("p");
    equals(subject.siblings().length, 2);
    subject = Unbose(ele).find("i");
    equals(subject.siblings().length, 5);
    equals(subject.siblings("i").length, 2);
});


test("first()", function() {
    var ele = Unbose.eleFromZen("div+p");
    var subject = Unbose(ele);
    equals(subject.first().name(), "div");
});


test("last()", function() {
    var ele = Unbose.eleFromZen("div+p");
    equals(Unbose(ele).last().name(), "p");
    ele = Unbose.eleFromZen("div>p");
    equals(Unbose(ele).last().name(), "div");
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
    equals(ele.length, 1);
    equals(ele.find("a").attr("href"), "testlink");
    equals(ele.find("h1").length, 2);
    equals(ele.find("h1").nth(0).text(), "title1");
    equals(ele.find("h1").nth(1).text(), "title2");
    equals(ele.find("div>p>a").length, 1);
    equals(ele.find("h1").nth(1).attr("id"), "id");
    equals(ele.find("span").attr("id"), "id2");
    ok(ele.find("h1").nth(1).hasClass("class1"));
});

test("eleFromTpl class/id parsing", function() {
    var tpl = ["div#foo.bar#baz"];
    var ele = Unbose.eleFromTpl(tpl);
    ok(ele);
    ele = Unbose(ele);
    ok(ele);
    equals(ele.length, 1);
    equals(ele.attr("id"), "baz");
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
    equals(ele.length, 1);
    equals(ele.find("a").attr("href"), "testlink");
    equals(ele.find("h1").length, 2);
    equals(ele.find("div>p>a").length, 1);
});


test("append()", function() {
    // test zen
    var ele = Unbose(document.createElement("div"));
    ele.append("div.first+div.last");
    equals(ele.find("div").length, 2);
    ok(ele.find("div").nth(0).hasClass("first"));
    ok(ele.find("div").nth(1).hasClass("last"));

    // test tpl
    var ele = Unbose(document.createElement("div"));
    ele.append([["div", {"class": "first"}], ["div", {"class": "last"}]]);
    equals(ele.find("div").length, 2);
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
    equals(ele.find("div").length, 2);
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
    ele.append(tpl);
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
    var ele = Unbose(document.createElement("div"));
    ok(ele, "Elem generated");
    ele = Unbose(ele);
    ok(ele, "Unbose wraps zen elem");
    ele.append(zen);
    equals(ele.length, 1);
    equals(ele.find("a").attr("href"), "testlink");
    equals(ele.find("h1").length, 2);
    equals(ele.find("div>div>p>a").length, 1);
});


test("insert()", function() {
    // smoke testing insert behaviour
    var ele = document.createElement("div");
    Unbose(ele).append("span");
    Unbose(ele).insert("strong");
    equals(ele.childNodes.length, 2);
    equals(ele.firstChild.nodeName.toLowerCase(), "strong");

    ele = document.createElement("div");
    var child = Unbose.fromZen("strong");
    Unbose(ele).insert(child);
    equals(ele.childNodes.length, 1);
    equals(ele.firstChild.nodeName.toLowerCase(), "strong");

});


test("val()", function() {
    var ele = Unbose.eleFromZen("div>form>input#text type=text value=foo");
    var subject = Unbose(ele).find("input");
    equals(subject.val(), "foo");
    subject.val("bar");
    equals(subject.val(), "bar");
});


test("data()", function() {
    var ele = Unbose.fromZen("div");
    ele.data("prop", "value");
    equals(ele.data("prop"), "value");
    equals(ele.data("bogus"), undefined);
    ele.data("prop", "value2");
    equals(ele.data("prop"), "value2");
    ele.data("prop", {toString: function(){return "value3"}});
    equals(ele.data("prop"), "value3");
    ele.data("prop", {test: "value4"});
    equals(ele.data("prop").test, "value4");
});

test("height()", function() {
    var ele = document.createElement("div");
    ele.style.cssText = "width: 100px; height: 120px; padding: 2px 4px; border: 3px solid; margin: 5px; position: absolute; visibility: hidden;";
    document.body.appendChild(ele);
    equals(Unbose(ele).height(), 120);
    ele.style.height = "100px"; // Remove borders and padding
    equals(Unbose(ele).height(), 100);
    Unbose(ele).height(80);
    equals(Unbose(ele).height(), 80);
    Unbose(ele).height("0x10");
    equals(Unbose(ele).height(), 80);
    Unbose(ele).height("-1px");
    equals(Unbose(ele).height(), 0);
    Unbose(ele).height(80);
    Unbose(ele).height("bogus"); // should not set anything
    equals(Unbose(ele).height(), 80);
    Unbose(ele).hide();
    equals(Unbose(ele).height(), 80, "Element with display: none");
});

test("width()", function() {
    var ele = document.createElement("div");
    ele.style.cssText = "width: 120px; height: 100px; padding: 2px 4px; border: 3px solid; margin: 5px; position: absolute; visibility: hidden;";
    document.body.appendChild(ele);
    equals(Unbose(ele).width(), 120);
    ele.style.width = "100px"; // Remove borders and padding
    equals(Unbose(ele).width(), 100);
    Unbose(ele).width(80);
    equals(Unbose(ele).width(), 80);
    Unbose(ele).width(-1);
    equals(Unbose(ele).width(), 0);
    Unbose(ele).width(80);
    Unbose(ele).width("bogus"); // should not set anything
    equals(Unbose(ele).width(), 80);
    Unbose(ele).hide();
    equals(Unbose(ele).width(), 80, "Element with display: none");
});
