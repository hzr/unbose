


module("Selectors");

test("Basic tests", function() {
    var subject = Unbose("#qunit-header");
    equals(subject.length, 1);

    subject = Unbose("#dummy *");
    equals(subject.length, 2);

    equals(Unbose("*").elements[0].nodeName.toLowerCase(),"html");

    subject = document.createDocumentFragment();
    subject.appendChild(document.createElement("div"));
    subject.appendChild(document.createElement("div"));
    equals(Unbose(subject).length, 2);
});


test("find()", function() {
    var subject = Unbose("#qunit-header");
    subject = Unbose(document.body);
    equals(subject.length, 1);

    var headers = subject.find("h1");
    equals(headers.length, 1);

    headers = subject.find("h2");
    equals(headers.length, 2);

    var elem = document.createElement("div");
    var h1 = document.createElement("h1");
    h1.textContent = "test";
    elem.appendChild(h1);

    subject = Unbose(elem);
    equals(subject.find("h1").length, 1);
    equals(subject.find("h1").text(), "test");

});

test("matchesSelector()", function() {
    var ele = Unbose(Unbose.eleFromZen("div#foo.bar.baz"));
    ok(ele.matchesSelector("*"));
    ok(ele.matchesSelector("div#foo"));
    ok(ele.matchesSelector("#foo"));
    ok(ele.matchesSelector(".bar"));
    ok(ele.matchesSelector(".baz"));
    ok(ele.matchesSelector(".bar.baz"));
    ok(ele.matchesSelector(".baz.bar"));
    ok(!ele.matchesSelector("span#foo"));
    ok(!ele.matchesSelector("#bar"));
    ok(ele.matchesSelector("#foo.bar"));
    ok(ele.matchesSelector("div#foo.bar"));
    ok(ele.matchesSelector("span,div"));
    ok(ele.matchesSelector("span, div"));
    ok(ele.matchesSelector("div,span"));
    ok(ele.matchesSelector("div\t\t ,\tspan"));
    ok(ele.matchesSelector(".foo, .bar"));
    ok(ele.matchesSelector("[class]"));
    ok(ele.matchesSelector("[id]"));

    var eles = Unbose(Unbose.eleFromZen("div.a + div.b"));
    ok(eles.matchesSelector(".a"));
    ok(eles.matchesSelector(".b"));
    ok(!eles.matchesSelector(".c"));
});


