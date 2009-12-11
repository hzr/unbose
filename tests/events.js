module("Events");



test("click", function() {
    expect(2);

    var ele = document.createElement("div");
    var subject = unbose(ele);
    subject.click(function(evt) { ok(evt); });
    simulateClick(ele);

    var ele2 = document.createElement("div");
    var subject2 = unbose(ele2);
    subject2.on("click", function(evt) { ok(evt); });
    simulateClick(ele2);
});


function simulateClick(ele) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window,
                       0, 0, 0, 0, 0, false, false, false, false, 0, null);
    var canceled = !ele.dispatchEvent(evt);
}