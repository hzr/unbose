
module("DOM");

test("Basic tests", function() {
    var subject = new unbose("#qunit-header");

    equals(subject.text(), "unbose tests");

});
