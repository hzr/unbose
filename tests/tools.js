module("Tools");

test("isFunction()", function() {
    expect(6);
    equal(Unbose.isFunction(function() {}), true);
    equal(Unbose.isFunction([]), false);
    equal(Unbose.isFunction(), false);
    equal(Unbose.isFunction(null), false);
    equal(Unbose.isFunction(1234), false);
    equal(Unbose.isFunction(document.createElement("div")), false);
});

test("isElement()", function() {
    expect(6);
    equal(Unbose.isElement(document.createElement("div")), true);
    equal(Unbose.isElement(function() {}), false);
    equal(Unbose.isElement([]), false);
    equal(Unbose.isElement(), false);
    equal(Unbose.isElement(null), false);
    equal(Unbose.isElement(1234), false);
});

test("list()", function() {
    equal(Unbose.list([0,1,2]).join('-'), '0-1-2');
    equal(Unbose.list([0],[1],[2]).join('-'), '0-1-2');
    equal(Unbose.list([],[0],[1,2],[3,4]).join('-'), '0-1-2-3-4');
    equal(Unbose.list("list").join('-'), 'l-i-s-t');
});

test("Adding functions to prototype", function() {
    var htmlfun = function(html) {
        if (html === undefined) {
            return (this[0] && this[0].innerHTML) || "";
        }
        else {
            return this._elements.forEach(function(ele) {
                ele.innerHTML = html;
            });
        }
    }
    Unbose.prototype.html = htmlfun;

    html = '<a href="#"><strong>link</strong></a>';
    var ele = Unbose.fromZen("div");
    equal(ele.html(), "");
    ele.html(html);
    equal(ele.html(), html);


});
