import { Meteor } from 'meteor/meteor';
import { Designs } from '../lib/collections';

Meteor.publish('userDesign', function() {
  if (!this.userId) {
    return this.ready();
  }
  return Designs.find({ userId: this.userId });
}); 