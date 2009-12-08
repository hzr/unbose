


module("Selectors");

test("Basic tests", function() {
    var subject = unbose("#qunit-header");
    equals(subject.length, 1);

    subject = unbose("*");
    equals(subject.length, 13);

    equals(subject.element.nodeName.toLowerCase(),"html");

    subject = unbose(document);
    equals(subject.length, 1);

});


test("Find method", function() {
    var subject = unbose("#qunit-header");
    subject = unbose(document.body);
    equals(subject.length, 1);


    var headers = subject.find("h1");
    equals(headers.length, 1);

    headers = subject.find("h2");
    equals(headers.length, 2);


});




