


module("Selectors");

test("Basic tests", function() {
    var subject = Unbose("#qunit-header");
    equals(subject.length, 1);

    subject = Unbose("*");
    equals(subject.length, 14);

    equals(subject.element.nodeName.toLowerCase(),"html");

    subject = document.createDocumentFragment();
    subject.appendChild(document.createElement("div"));
    subject.appendChild(document.createElement("div"));
    equals(Unbose(subject).length, 2);
});


test("Find method", function() {
    var subject = Unbose("#qunit-header");
    subject = Unbose(document.body);
    equals(subject.length, 1);

    var headers = subject.find("h1");
    equals(headers.length, 1);

    headers = subject.find("h2");
    equals(headers.length, 2);

    var elem = document.createElement("div");
    var h1 = document.createElement("h1");
    h1.textContent = "test";
    elem.appendChild(h1);

    subject = Unbose(elem);
    equals(subject.find("h1").length, 1);
    equals(subject.find("h1").text(), "test");

});




