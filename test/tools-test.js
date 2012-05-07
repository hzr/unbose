var assert = buster.assertions.assert;

buster.testCase("Tools", {
    "isFunction()": function () {
        assert.equals(Unbose.isFunction(function() {}), true);
        assert.equals(Unbose.isFunction([]), false);
        assert.equals(Unbose.isFunction(), false);
        assert.equals(Unbose.isFunction(null), false);
        assert.equals(Unbose.isFunction(1234), false);
        assert.equals(Unbose.isFunction(document.createElement("div")), false);
    },

    "isElement()": function() {
        assert.equals(Unbose.isElement(document.createElement("div")), true);
        assert.equals(Unbose.isElement(function() {}), false);
        assert.equals(Unbose.isElement([]), false);
        assert.equals(Unbose.isElement(), false);
        assert.equals(Unbose.isElement(null), false);
        assert.equals(Unbose.isElement(1234), false);
    },

    "list()": function() {
        assert.equals(Unbose.list([0,1,2]).join('-'), '0-1-2');
        assert.equals(Unbose.list([0],[1],[2]).join('-'), '0-1-2');
        assert.equals(Unbose.list([],[0],[1,2],[3,4]).join('-'), '0-1-2-3-4');
        assert.equals(Unbose.list("list").join('-'), 'l-i-s-t');
    },

    "Adding functions to prototype": function() {
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
        var ele = Unbose(document.createElement("div"));
        assert.equals(ele.html(), "");
        ele.html(html);
        assert.equals(ele.html(), html);
    }
});