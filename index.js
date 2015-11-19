#!/usr/bin/env node
"use strict";
var program = require("commander");

program
  .version("0.0.1")
  .option("-r, --root <root>", "root folder for the files to serve")
  .option("-e, --entry <entry>", "Entry html file to serve to run the mocha tests")
  .option("-b, --browser <browser>", "browser to run the test on e.g. firefox")
  .parse(process.argv);

var root = program.root;
var entry = program.entry;
var browser = program.browser || "firefox";
var port = 1337;

var koa = require("koa");
var app = koa();
app.use(require("koa-static")(root));
var server = app.listen(port);

var Mocha = require("mocha");
var mocha = new Mocha({
  ui: 'bdd',
  reporter: 'spec'
});
var EventEmitter = require("events");
var ee = new EventEmitter();
new mocha._reporter(ee);

var webdriver = require("selenium-webdriver");
var driver = new webdriver.Builder()
  .usingServer("http://" + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY + "@ondemand.saucelabs.com/wd/hub")
  .forBrowser(browser)
  .build();

driver.get("http://localhost:" + port + "/" + entry);
driver.wait(function() {
  return driver.executeScript("return mocha.suite.pending").then(function(pending) {
    return pending === false;
  });
}, 10000);

var fs = require('fs');
var parseEventsScript = fs.readFileSync(__dirname + '/parseEvents.js', 'utf8');

driver
  .executeScript(parseEventsScript)
  .then(function (events) {
    events = JSON.parse(events);
    events.forEach(function (evt) {
      if (evt[1] !== null) {
        evt[1].slow = evt[1].slow !== null ? function () {
          return evt[1].slow;
        } : undefined;
        evt[1]._fullTitle = evt[1].fullTitle;
        evt[1].fullTitle = function () {
          return evt[1]._fullTitle;
        };
        evt[1].slow = function () {
          return evt[1]._slow;
        };
      }
      if (evt[0] === "fail") {
        ee.emit(evt[0], evt[1], evt[1].err);
      } else {
        ee.emit(evt[0], evt[1]);
      }
      if (evt[0] === "end") {
        driver.quit();
        server.close();
      }
    });
  });