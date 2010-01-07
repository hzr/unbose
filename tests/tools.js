module("Tools");

test("isFunction()", function() {
    equal(Unbose.isFunction(function() {}), true);
    equal(Unbose.isFunction([]), false);
});

test("isArray()", function() {
    equal(Unbose.isArray(function() {}), false);
    equal(Unbose.isArray([]), true);
});

test("trim()", function() {
    equal(Unbose.trim(" \v\t t e s t \f\r\n "), "t e s t");
});
