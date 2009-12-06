


module("Selectors");

test("Basic tests", function() {
    var subject = new unbose("#qunit-header");
    equals(subject.length, 1);

    subject = new unbose("*");
    equals(subject.length, 12);

    equals(subject.element.nodeName.toLowerCase(),"html");

    subject = new unbose(document);
    equals(subject.length, 1);

});


test("Find method", function() {
    var subject = new unbose("#qunit-header");
    subject = new unbose(document.body);
    equals(subject.length, 1);


    var headers = subject.find("h1");
    equals(headers.length, 1);

    headers = subject.find("h2");
    equals(headers.length, 2);


});




