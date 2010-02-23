module("Events");


test("click", function() {
    expect(1);

    var ele = document.createElement("div");
    var subject = Unbose(ele);
    subject.click(function(evt) { ok(evt); });
    simulateMouseEvent(ele, "click");
});

test("on", function()
{
    expect(6);
    
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    subject.on("click", function(evt) { ok(evt);
                                  equal(this, subject.elem(0));
                                });
    simulateMouseEvent(ele, "click");
    
    var ele2 = document.createElement("div");
    var subject2 = Unbose(ele2);
    subject2.on("click", function(evt) { ok(evt); });
    subject2.on("click", function(evt) { ok(evt); });
    simulateMouseEvent(ele2, "click");; // should fire two events

    var ele3 = document.createElement("div");
    var subject3 = Unbose(ele3);
    subject3.on("click mouseover", function(evt) { ok(evt); });
    simulateMouseEvent(ele3, "click");
    simulateMouseEvent(ele3, "mouseover");
});
test("once()", function()
{
    expect(2);
    
    var ele = document.createElement("div");
    var subject = Unbose(ele);
    subject.once("click", function(evt) { ok(evt); });
    simulateMouseEvent(ele, "click");
    simulateMouseEvent(ele, "click"); // should not trigger event
    
    var ele2 = document.createElement("div");
    var subject2 = Unbose(ele2);
    subject2.once("click mouseover", function(evt) { ok(evt); });
    simulateMouseEvent(ele2, "click");
    simulateMouseEvent(ele2, "click"); // should not trigger event
    simulateMouseEvent(ele2, "mouseover"); // should not trigger event
    simulateMouseEvent(ele2, "mouseover"); // should not trigger event
});

test("once() - childTrigger", function()
{
    expect(1);
    
    var ele = document.createElement("div");
    var ele2 = document.createElement("div");
    ele.appendChild(ele2);
    var subject = Unbose(ele);
    subject.once("click", function(evt) { ok(evt); });
    simulateMouseEvent(ele2, "click");
    simulateMouseEvent(ele2, "click"); // should not trigger event
});

test("delegate()", function()
{
    expect(4);

    var ele = Unbose.fromZen("div > div.a > p.a + p");
    Unbose(ele).delegate("click", ".a", function(evt) {
        ok(evt);
    });
    simulateMouseEvent(ele.find("p").elem(0), "click");
    simulateMouseEvent(ele.find("p").elem(1), "click");

    ele = Unbose.fromZen("div > div.a > p.a");
    Unbose(ele).delegate("click", ".a", function(evt) {
        equals(evt.target, this);
    });
    simulateMouseEvent(ele.find("p").elem(0), "click");

    ele = Unbose.fromZen("div > div.a > p");
    Unbose(ele).delegate("click", ".a", function(evt) {
        equals(Unbose(this).name(), "div");
    });
    simulateMouseEvent(ele.find("p").elem(0), "click");
});

function simulateMouseEvent(ele, type) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(type, true, true, window,
                       0, 0, 0, 0, 0, false, false, false, false, 0, null);
    var canceled = !ele.dispatchEvent(evt);
}
