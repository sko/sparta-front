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
    assert.ok(false, 'components/sound-track-creator.js should pass ESLint\n\n26:18 - Don\'t use observers if possible (ember/no-observers)\n100:49 - Unexpected console statement. (no-console)\n106:7 - Don\'t introduce side-effects in computed properties (ember/no-side-effects)\n109:52 - Don\'t introduce side-effects in computed properties (ember/no-side-effects)\n112:9 - Don\'t introduce side-effects in computed properties (ember/no-side-effects)\n147:87 - Unnecessary escape character: \\/. (no-useless-escape)\n147:96 - Unnecessary escape character: \\/. (no-useless-escape)\n158:12 - \'moment\' is not defined. (no-undef)\n158:46 - \'moment\' is not defined. (no-undef)\n161:12 - \'moment\' is not defined. (no-undef)\n161:46 - \'moment\' is not defined. (no-undef)\n169:14 - \'moment\' is not defined. (no-undef)\n169:48 - \'moment\' is not defined. (no-undef)\n175:28 - \'moment\' is not defined. (no-undef)\n181:14 - \'moment\' is not defined. (no-undef)\n181:48 - \'moment\' is not defined. (no-undef)\n187:26 - \'moment\' is not defined. (no-undef)\n196:19 - Don\'t use observers if possible (ember/no-observers)\n248:7 - Unexpected console statement. (no-console)\n336:7 - Unexpected console statement. (no-console)\n398:11 - Unexpected console statement. (no-console)\n405:13 - Unexpected console statement. (no-console)\n414:11 - Unexpected constant condition. (no-constant-condition)\n450:9 - Unexpected console statement. (no-console)\n481:7 - Unexpected console statement. (no-console)\n570:9 - Unexpected console statement. (no-console)\n582:11 - Unexpected console statement. (no-console)\n599:9 - Unexpected console statement. (no-console)\n613:5 - Unexpected console statement. (no-console)\n623:9 - Unexpected console statement. (no-console)\n650:7 - Unexpected console statement. (no-console)\n684:5 - Unexpected console statement. (no-console)\n720:5 - Unexpected console statement. (no-console)\n773:9 - Unexpected console statement. (no-console)\n783:15 - Unexpected console statement. (no-console)\n825:9 - Unexpected console statement. (no-console)\n907:16 - Unexpected console statement. (no-console)\n916:7 - Unexpected console statement. (no-console)\n927:5 - Unexpected console statement. (no-console)\n930:7 - Unexpected console statement. (no-console)\n946:9 - Unexpected console statement. (no-console)\n956:7 - Unexpected console statement. (no-console)\n965:17 - Unexpected console statement. (no-console)\n973:19 - Unexpected console statement. (no-console)\n1006:9 - Unexpected console statement. (no-console)');
  });
  QUnit.test('helpers/format-float.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/format-float.js should pass ESLint\n\n');
  });
  QUnit.test('helpers/format-secs.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'helpers/format-secs.js should pass ESLint\n\n2:8 - \'moment\' is defined but never used. Allowed unused vars must match /^_/. (no-unused-vars)');
  });
  QUnit.test('helpers/inc.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/inc.js should pass ESLint\n\n');
  });
  QUnit.test('helpers/range.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/range.js should pass ESLint\n\n');
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
