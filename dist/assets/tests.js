'use strict';

define('sparta/tests/app.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass jshint.');
  });
});
define('sparta/tests/helpers/destroy-app', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = destroyApp;

  function destroyApp(application) {
    _ember['default'].run(application, 'destroy');
  }
});
define('sparta/tests/helpers/destroy-app.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/destroy-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass jshint.');
  });
});
define('sparta/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'ember', 'sparta/tests/helpers/start-app', 'sparta/tests/helpers/destroy-app'], function (exports, _qunit, _ember, _spartaTestsHelpersStartApp, _spartaTestsHelpersDestroyApp) {
  var Promise = _ember['default'].RSVP.Promise;

  exports['default'] = function (name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _spartaTestsHelpersStartApp['default'])();

        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },

      afterEach: function afterEach() {
        var _this = this;

        var afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return Promise.resolve(afterEach).then(function () {
          return (0, _spartaTestsHelpersDestroyApp['default'])(_this.application);
        });
      }
    });
  };
});
define('sparta/tests/helpers/module-for-acceptance.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/module-for-acceptance.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass jshint.');
  });
});
define('sparta/tests/helpers/resolver', ['exports', 'sparta/resolver', 'sparta/config/environment'], function (exports, _spartaResolver, _spartaConfigEnvironment) {

  var resolver = _spartaResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _spartaConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _spartaConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});
define('sparta/tests/helpers/resolver.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass jshint.');
  });
});
define('sparta/tests/helpers/start-app', ['exports', 'ember', 'sparta/app', 'sparta/config/environment'], function (exports, _ember, _spartaApp, _spartaConfigEnvironment) {
  exports['default'] = startApp;

  function startApp(attrs) {
    var application = undefined;

    // use defaults, but you can override
    var attributes = _ember['default'].assign({}, _spartaConfigEnvironment['default'].APP, attrs);

    _ember['default'].run(function () {
      application = _spartaApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});
define('sparta/tests/helpers/start-app.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/start-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass jshint.');
  });
});
define('sparta/tests/integration/components/sound-track-creator-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForComponent)('sound-track-creator', 'Integration | Component | sound track creator', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    assert.expect(2);
    this.render(Ember.HTMLBars.template({
      'id': 'AmeXitdP',
      'block': '{"statements":[["append",["unknown",["sound-track-creator"]],false]],"locals":[],"named":[],"yields":[],"blocks":[],"hasPartials":false}',
      'meta': {}
    }));
    assert.equal(this.$().text().trim(), '');
    this.render(Ember.HTMLBars.template({
      'id': '84wkaMWn',
      'block': '{"statements":[["block",["sound-track-creator"],null,null,0]],"locals":[],"named":[],"yields":[],"blocks":[{"statements":[["text","  template block text\\n"]],"locals":[]}],"hasPartials":false}',
      'meta': {}
    }));
    return assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('sparta/tests/resolver.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass jshint.');
  });
});
define('sparta/tests/router.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | router.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass jshint.');
  });
});
define('sparta/tests/test-helper', ['exports', 'sparta/tests/helpers/resolver', 'ember-qunit'], function (exports, _spartaTestsHelpersResolver, _emberQunit) {

  (0, _emberQunit.setResolver)(_spartaTestsHelpersResolver['default']);
});
define('sparta/tests/test-helper.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | test-helper.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass jshint.');
  });
});
/* jshint ignore:start */

require('sparta/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;

/* jshint ignore:end */
//# sourceMappingURL=tests.map
