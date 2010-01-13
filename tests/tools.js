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

test("isArray()", function() {
    expect(6);
    equal(Unbose.isArray([]), true);
    equal(Unbose.isArray(function() {}), false);
    equal(Unbose.isArray(), false);
    equal(Unbose.isArray(null), false);
    equal(Unbose.isArray(1234), false);
    equal(Unbose.isArray(document.createElement("div")), false);
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

test("trim()", function() {
    equal(Unbose.trim(" \v\t t e s t \f\r\n "), "t e s t");
});
