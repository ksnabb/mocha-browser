/* globals describe it */
describe("test suite", function () {
  "use strict";
  describe("nested test suite", function () {
    it("should pass", function (done) {
      done();
    });
  });

  it("should pend");

  it("should fail", function () {
    throw new Error("failing test");
  });
});
