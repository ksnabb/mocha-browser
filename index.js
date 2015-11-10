#!/usr/bin/env node
"use strict";
var program = require("commander");

program
  .version("0.0.1")
  .option("-r, --root <root>", "root folder for the files to serve")
  .option("-e, --entry <entry>", "Entry html file to serve to run the mocha tests")
  .parse(process.argv);

const root = program.root;
const entry = program.entry;
const port = 3000;

let app;
function startServer() {
  var koa = require("koa");
  app = koa();
  app.use(require("koa-static")(root));
  app.listen(port);
}

function runTests() {
  // start selenium and open the html
  const Mocha = require("mocha");
  const mocha = new Mocha({
    ui: 'bdd',
    reporter: 'spec'
  });
  const EventEmitter = require("events");
  const ee = new EventEmitter();
  new mocha._reporter(ee);

  const webdriver = require("selenium-webdriver");
  const driver = new webdriver.Builder()
      .forBrowser("firefox")
      .build();

  driver.get(`http://localhost:${port}/${entry}`);
  // read the events variable and print it out with the spec thingy,,
  let pending = true;

  function nextEvent() {
    driver
      .executeScript("return events.shift()")
      .then(function (evt) {
        if (evt[1] !== null) {
          evt[1].slow = evt[1].slow !== null ? () => evt[1].slow : undefined;
          evt[1]._fullTitle = evt[1].fullTitle;
          evt[1].fullTitle = function () {return evt[1]._fullTitle}
        }
        if(evt[0] === "fail") {
          ee.emit(evt[0], evt[1], evt[1].err);
        } else {
          ee.emit(evt[0], evt[1]);
        }
        if(evt[0] !== "end") nextEvent();
        else end()
      });
  }
  nextEvent();
}

function end() {
  process.exit(0);
}
startServer();
runTests();
