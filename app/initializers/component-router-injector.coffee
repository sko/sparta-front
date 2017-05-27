CRIInit =
  name: 'component-router-injector'
  initialize: (application) ->
    application.inject('component', 'router', 'router:main')

`export default CRIInit`
