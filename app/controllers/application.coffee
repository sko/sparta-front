export default Ember.Controller.extend
  backendUrlPrefix: Sparta.backendUrlPrefix
  isMobile: navigator.userAgent.match(/Mobile|webOS/)?
