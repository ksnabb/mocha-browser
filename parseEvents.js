var events = [];
function parseTest(test) {
  var eventType = test.state;
  if (test.pending) {
    eventType = 'pending';
  } else if (eventType === 'failed') {
    eventType = 'fail';
  } else if (eventType === 'passed') {
    eventType = 'pass';
  }
  events.push([eventType, {
    "err": test.err !== undefined ? {
      "message": test.err.message,
      "stack": test.err.stack,
      "actual": test.err.actual,
      "expected": test.err.expected
    } : undefined,
    "title": test.title,
    "type": test.type,
    "state": test.state,
    "timedOut": test.timedOut,
    "duration": test.duration,
    "_fullTitle": test.fullTitle(),
    "_slow": test.slow(),
    "_trace": test._trace
  }]);
  events.push(['test end', {}]);
}
function parseSuite(suite) {
  events.push(['suite', {
    "title": suite.title,
    "root": suite.root
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
  events.push(['start', undefined]);
  parseSuite(mocha.suite);
  events.push(['end', undefined])
}
parseMocha(mocha);
return JSON.stringify(events);