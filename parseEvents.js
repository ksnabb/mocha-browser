var events = [];
function parseTest(test) {
  console.log(test);
  var eventType = test.state;
  if (test.pending) {
    eventType = 'pending';
  } else if (eventType === 'failed') {
    eventType = 'fail';
  } else if (eventType === 'passed') {
    eventType = 'pass';
  }
  events.push([eventType, {
    "err": test.err
  }]);
  events.push(['test end', {}]);
}
function parseSuite(suite) {
  console.log(suite);
  events.push(['suite', {
    'title': suite.title
}]);
  suite.tests.forEach(function (test) {
    parseTest(test);
  });
  suite.suites.forEach(function (suite) {
    parseSuite(suite);
  });
  events.push(['suite end', {}])
}
function parseMocha(mocha) {
  console.log(mocha);
  events.push(['start', undefined]);
  parseSuite(mocha.suite);
  events.push(['end', undefined])
}
parseMocha(mocha);
return JSON.stringify(events);