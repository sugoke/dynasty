import { Mongo } from 'meteor/mongo';

export const Designs = new Mongo.Collection('designs');

// Define allow/deny rules
Designs.allow({
  insert(userId, doc) {
    return userId === doc.userId;
  },
  update(userId, doc) {
    return userId === doc.userId;
  },
  remove(userId, doc) {
    return userId === doc.userId;
  }
}); 