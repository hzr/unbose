
module("DOM");

test("Basic tests", function() {
    var subject = unbose("#qunit-header");

    equals(subject.text(), "unbose tests");

});
