
var assert = buster.assertions.assert;
var equals = assert.equals

buster.testCase("Selectors", {
    "setUp": function() {
        var html = [
            "<h1 id=header>",
            "<h2 id=subheader1>",
            "<div id=dummy>",
            "   <span>asdf</span><strong>qwer</strong>",
            "</div>",
            "<h2 id=subheader2>",
            "<div id=foo class='bar baz'>Some text content</div>",
            "<div class=a></div>",
            "<div class=b></div>"
        ].join("\n");

        document.body.innerHTML = html;
    },

    "basics": function() {
        var subject = Unbose("#header");
        assert.equals(subject.length, 1);

        subject = Unbose("#dummy *");
        equals(subject.length, 2);

        equals(Unbose("*")._elements[0].nodeName.toLowerCase(),"html");

        subject = document.createDocumentFragment();
        subject.appendChild(document.createElement("div"));
        subject.appendChild(document.createElement("div"));
        equals(Unbose(subject).length, 2);
    },

    "find": function() {
        var subject = Unbose(document.body);
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
    },

    "matchesSelector": function() {
        var ele = Unbose("div#foo.bar.baz");
        assert(ele.matchesSelector("*"));
        assert(ele.matchesSelector("div#foo"));
        assert(ele.matchesSelector("#foo"));
        assert(ele.matchesSelector(".bar"));
        assert(ele.matchesSelector(".baz"));
        assert(ele.matchesSelector(".bar.baz"));
        assert(ele.matchesSelector(".baz.bar"));
        assert(!ele.matchesSelector("span#foo"));
        assert(!ele.matchesSelector("#bar"));
        assert(ele.matchesSelector("#foo.bar"));
        assert(ele.matchesSelector("div#foo.bar"));
        assert(ele.matchesSelector("span,div"));
        assert(ele.matchesSelector("span, div"));
        assert(ele.matchesSelector("div,span"));
        assert(ele.matchesSelector("div\t\t ,\tspan"));
        assert(ele.matchesSelector(".foo, .bar"));
        assert(ele.matchesSelector("[class]"));
        assert(ele.matchesSelector("[id]"));

        // var eles = Unbose(Unbose.eleFromZen("div.a + div.b"));
        // assert(eles.matchesSelector(".a"));
        // assert(!eles.matchesSelector(".b"));

    }
});

