// The tests are copied from
// http://github.com/chrisdone/zencoding/blob/master/zencoding-mode.el


// Tests pass in latest opera and latest chrome on linux.
// Does not pass in firefox but that's due to the order of
// properties on the string returned from innerHTML. Opera
// and chrome uses insert order, firefox alphabetically it seems.
// Not a bug, just an implementation artifact. In other words, the
// emitted code should be correct in all three browsers.


// Helper function for making an html string we can compare with.
function zen(s) {
    var div = Unbose(document.createElement("div"));
    div.appendZen(s);
    return div.elem(0).innerHTML.toLowerCase();
}

module("Zencode");

test("Basic tests", function() {
    equals(zen("a"), "<a></a>");
    equals(zen("a.b"), '<a class="b"></a>');
    equals(zen("a#q"), '<a id="q"></a>');
    equals(zen("a#q.x"), '<a id="q" class="x"></a>');
    equals(zen("a#q.x.y.z"), '<a id="q" class="x y z"></a>');
//alert(zen("a#q.x.y.z"))
});


test("Siblings", function() {
    equals(zen("a+b"), "<a></a><b></b>");
    equals(zen("a.x+b"), '<a class="x"></a><b></b>');
    equals(zen("a#q.x+b"), '<a id="q" class="x"></a><b></b>');
    equals(zen("a#q.x.y.z+b#p.l.m.n"), '<a id="q" class="x y z"></a><b id="p" class="l m n"></b>');
});


test("Parent > Child", function() {
    equals(zen("a>b"), "<a><b></b></a>");
    equals(zen("a>b>c"), "<a><b><c></c></b></a>");
    equals(zen("a.x>b"), '<a class="x"><b></b></a>');
    equals(zen("a#q.x>b"), '<a id="q" class="x"><b></b></a>');
    equals(zen("a#q.x.y.z>b#p.l.m.n"), '<a id="q" class="x y z"><b id="p" class="l m n"></b></a>');
    equals(zen("a>b+c"), "<a><b></b><c></c></a>");
    equals(zen("a>b+c>d"), "<a><b></b><c><d></d></c></a>");
    equals(zen("a>b+c>d+e>f"), "<a><b></b><c><d></d><e><f></f></e></c></a>");
});

test("Multiplication", function() {
    equals(zen("a*2"), "<a></a><a></a>");
    equals(zen("a*2+b*2"), "<a></a><a></a><b></b><b></b>");
    equals(zen("a*2>b*2"), "<a><b></b><b></b></a><a><b></b><b></b></a>");
    equals(zen("a>b*2"), "<a><b></b><b></b></a>");
    equals(zen("a#q.x>b#q.x*2"), '<a id="q" class="x"><b id="q" class="x"></b><b id="q" class="x"></b></a>');
});

test("Properties", function() {
    equals(zen("a x=y"), "<a x=\"y\"></a>");
    equals(zen("a x=y m=l"), "<a x=\"y\" m=\"l\"></a>");
    equals(zen("a#foo x=y m=l"), "<a id=\"foo\" x=\"y\" m=\"l\"></a>");
    equals(zen("a.foo x=y m=l"), "<a class=\"foo\" x=\"y\" m=\"l\"></a>");
    equals(zen("a#foo.bar.mu x=y m=l"), "<a id=\"foo\" class=\"bar mu\" x=\"y\" m=\"l\"></a>");
    equals(zen("a x=y+b"), "<a x=\"y\"></a><b></b>");
    equals(zen("a x=y+b x=y"), "<a x=\"y\"></a><b x=\"y\"></b>");
    equals(zen("a x=y>b"), "<a x=\"y\"><b></b></a>");
    equals(zen("a x=y>b x=y"), "<a x=\"y\"><b x=\"y\"></b></a>");
    equals(zen("a x=y>b x=y+c x=y"), "<a x=\"y\"><b x=\"y\"></b><c x=\"y\"></c></a>");
});

test("Parenthesis", function() {
    equals(zen("(a)"), "<a></a>");
    equals(zen("(a)+(b)"), "<a></a><b></b>");
    equals(zen("a>(b)"), "<a><b></b></a>");
    equals(zen("(a>b)>c"), "<a><b></b></a>"); // yes, c is droppeed. group can't have children
    equals(zen("(a>b)+c"), "<a><b></b></a><c></c>");
    equals(zen("z+(a>b)+c+k"), "<z></z><a><b></b></a><c></c><k></k>");
    equals(zen("(a)*2"), "<a></a><a></a>");
    equals(zen("((a)*2)"), "<a></a><a></a>");
    equals(zen("(a>b)*2"), "<a><b></b></a><a><b></b></a>");
    equals(zen("(a+b)*2"), "<a></a><b></b><a></a><b></b>");

});
