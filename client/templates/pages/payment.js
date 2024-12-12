import { Template } from 'meteor/templating';
import './payment.html';

// Initialize Stripe
let stripe;
if (Meteor.settings.public?.stripe?.publicKey) {
  stripe = window.Stripe(Meteor.settings.public.stripe.publicKey);
}

Template.payment.helpers({
  credits() {
    const user = Meteor.user();
    return user?.profile?.credits || 0;
  }
});

Template.payment.events({
  'click #purchaseBtn'(event, instance) {
    if (!stripe) {
      alert('Stripe is not properly configured');
      return;
    }

    Meteor.call('createStripeCheckout', (error, sessionId) => {
      if (error) {
        alert('Error creating checkout session: ' + error.reason);
        return;
      }
      
      stripe.redirectToCheckout({
        sessionId: sessionId
      }).then((result) => {
        if (result.error) {
          alert(result.error.message);
        }
      });
    });
  }
}); 