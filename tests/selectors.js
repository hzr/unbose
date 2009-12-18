


module("Selectors");

test("Basic tests", function() {
    var subject = Unbose("#qunit-header");
    equal(subject.length, 1);

    subject = Unbose("*");
    equal(subject.length, 15);

    equal(subject.elements[0].nodeName.toLowerCase(),"html");

    subject = document.createDocumentFragment();
    subject.appendChild(document.createElement("div"));
    subject.appendChild(document.createElement("div"));
    equal(Unbose(subject).length, 2);
});


test("Find method", function() {
    var subject = Unbose("#qunit-header");
    subject = Unbose(document.body);
    equal(subject.length, 1);

    var headers = subject.find("h1");
    equal(headers.length, 1);

    headers = subject.find("h2");
    equal(headers.length, 2);

    var elem = document.createElement("div");
    var h1 = document.createElement("h1");
    h1.textContent = "test";
    elem.appendChild(h1);

    subject = Unbose(elem);
    equal(subject.find("h1").length, 1);
    equal(subject.find("h1").text(), "test");

});




