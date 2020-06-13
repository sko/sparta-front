'use strict';

define("sparta/tests/integration/components/sound-track-creator-test", ["ember-qunit"], function (_emberQunit) {
  "use strict";

  (0, _emberQunit.moduleForComponent)('sound-track-creator', 'Integration | Component | sound track creator', {
    integration: true
  });
  (0, _emberQunit.test)('it renders', function (assert) {
    assert.expect(2);
    this.render(Ember.HTMLBars.template({
      "id": "ehok613Y",
      "block": "{\"symbols\":[],\"statements\":[[1,[23,\"sound-track-creator\"],false]],\"hasEval\":false}",
      "meta": {}
    }));
    assert.equal(this.$().text().trim(), '');
    this.render(Ember.HTMLBars.template({
      "id": "KcxamlW8",
      "block": "{\"symbols\":[],\"statements\":[[4,\"sound-track-creator\",null,null,{\"statements\":[[0,\"  template block text\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}",
      "meta": {}
    }));
    return assert.equal(this.$().text().trim(), 'template block text');
  });
});
define("sparta/tests/lint/app.lint-test", [], function () {
  "use strict";

  QUnit.module('ESLint | app');
  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });
  QUnit.test('components/how-to.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/how-to.js should pass ESLint\n\n');
  });
  QUnit.test('components/sound-track-creator.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/sound-track-creator.js should pass ESLint\n\n20:18 - Don\'t use observers if possible (ember/no-observers)\n109:87 - Unnecessary escape character: \\/. (no-useless-escape)\n109:96 - Unnecessary escape character: \\/. (no-useless-escape)\n128:19 - Don\'t use observers if possible (ember/no-observers)\n179:7 - Unexpected console statement. (no-console)\n264:7 - Unexpected console statement. (no-console)\n312:11 - Unexpected constant condition. (no-constant-condition)\n350:7 - Unexpected console statement. (no-console)\n423:9 - Unexpected console statement. (no-console)\n428:7 - Unexpected console statement. (no-console)\n444:9 - Unexpected console statement. (no-console)\n466:7 - Unexpected console statement. (no-console)\n493:5 - Unexpected console statement. (no-console)\n501:5 - Unexpected console statement. (no-console)\n516:9 - Unexpected console statement. (no-console)\n522:15 - Unexpected console statement. (no-console)\n541:9 - Unexpected console statement. (no-console)\n580:7 - Unexpected console statement. (no-console)\n589:5 - Unexpected console statement. (no-console)\n592:7 - Unexpected console statement. (no-console)\n615:9 - Unexpected console statement. (no-console)\n625:7 - Unexpected console statement. (no-console)\n634:17 - Unexpected console statement. (no-console)\n642:19 - Unexpected console statement. (no-console)\n669:9 - Unexpected console statement. (no-console)');
  });
  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });
  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });
  QUnit.test('services/backend-adapter.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'services/backend-adapter.js should pass ESLint\n\n21:5 - Unexpected console statement. (no-console)');
  });
  QUnit.test('services/record-audio.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'services/record-audio.js should pass ESLint\n\n51:5 - Unexpected console statement. (no-console)');
  });
});
define("sparta/tests/lint/templates.template.lint-test", [], function () {
  "use strict";

  QUnit.module('TemplateLint');
  QUnit.test('sparta/templates/application.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'sparta/templates/application.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('sparta/templates/components/dub-track-library.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'sparta/templates/components/dub-track-library.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('sparta/templates/components/how-to.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'sparta/templates/components/how-to.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('sparta/templates/components/sound-track-creator.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'sparta/templates/components/sound-track-creator.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('sparta/templates/index.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'sparta/templates/index.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('sparta/templates/library.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'sparta/templates/library.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('sparta/templates/new.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'sparta/templates/new.hbs should pass TemplateLint.\n\n');
  });
});
define("sparta/tests/lint/tests.lint-test", [], function () {
  "use strict";

  QUnit.module('ESLint | tests');
  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });
});
define("sparta/tests/test-helper", ["sparta/app", "sparta/config/environment", "@ember/test-helpers", "ember-qunit"], function (_app, _environment, _testHelpers, _emberQunit) {
  "use strict";

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));
  (0, _emberQunit.start)();
});
define('sparta/config/environment', [], function() {
  var prefix = 'sparta';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

require('sparta/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
