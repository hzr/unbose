module("Tools");

test("isFunction()", function() {
    expect(6);
    equals(Unbose.isFunction(function() {}), true);
    equals(Unbose.isFunction([]), false);
    equals(Unbose.isFunction(), false);
    equals(Unbose.isFunction(null), false);
    equals(Unbose.isFunction(1234), false);
    equals(Unbose.isFunction(document.createElement("div")), false);
});

test("isElement()", function() {
    expect(6);
    equals(Unbose.isElement(document.createElement("div")), true);
    equals(Unbose.isElement(function() {}), false);
    equals(Unbose.isElement([]), false);
    equals(Unbose.isElement(), false);
    equals(Unbose.isElement(null), false);
    equals(Unbose.isElement(1234), false);
});

test("list()", function() {
    equals(Unbose.list([0,1,2]).join('-'), '0-1-2');
    equals(Unbose.list([0],[1],[2]).join('-'), '0-1-2');
    equals(Unbose.list([],[0],[1,2],[3,4]).join('-'), '0-1-2-3-4');
    equals(Unbose.list("list").join('-'), 'l-i-s-t');
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
    equals(ele.html(), "");
    ele.html(html);
    equals(ele.html(), html);


});
