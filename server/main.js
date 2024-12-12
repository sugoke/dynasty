import { Meteor } from 'meteor/meteor';
import '../lib/collections';
import './publications';
import './methods';

Meteor.startup(() => {
  console.log('Server starting...');
  
  if (!Meteor.settings) {
    throw new Error('Settings not loaded. Please run with --settings settings.json');
  }
  
  if (!Meteor.settings.private?.stripe?.secretKey) {
    throw new Error('Stripe secret key not found in settings');
  }
  
  console.log('Server started successfully');
});
