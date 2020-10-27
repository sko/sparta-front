import Component from '@ember/component';
import { alias } from '@ember/object/computed';

export default Component.extend({
  isMobile: false,
  subject: null,
  currentStep: alias('subject.currentHowToStep')
});
