import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Stripe from 'stripe';
import { Designs } from '../lib/collections';

console.log('Meteor settings:', Meteor.settings);
console.log('Stripe key:', Meteor.settings?.private?.stripe?.secretKey);

let stripe;
try {
  if (Meteor.settings?.private?.stripe?.secretKey) {
    stripe = new Stripe(Meteor.settings.private.stripe.secretKey, {
      apiVersion: '2023-10-16'
    });
    console.log('Stripe initialized successfully');
  } else {
    console.log('No Stripe secret key found in settings');
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

Meteor.methods({
  async saveDesign(design) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    // Log the design object to help debug
    console.log('Saving design:', design);
    
    try {
      // Define a pattern that matches either null or a string
      const StringOrNull = Match.OneOf(String, null);
      
      check(design, {
        frame: StringOrNull,
        leftAnimal: StringOrNull,
        rightAnimal: StringOrNull,
        crown: StringOrNull
      });
      
      const selector = { userId: this.userId };
      const modifier = {
        $set: {
          userId: this.userId,
          design,
          updatedAt: new Date()
        }
      };
      
      const result = await Designs.updateAsync(
        selector,
        modifier,
        { upsert: true }
      );
      
      return result;
    } catch (error) {
      console.error('Design validation error:', error);
      throw new Meteor.Error('validation-error', error.message);
    }
  },
  
  async useCredit() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user?.profile?.credits) {
      throw new Meteor.Error('no-credits', 'No export credits available');
    }
    
    return Meteor.users.updateAsync(this.userId, {
      $inc: {
        'profile.credits': -1
      }
    });
  },
  
  async addCredits(amount) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    check(amount, Number);
    
    return Meteor.users.updateAsync(this.userId, {
      $inc: {
        'profile.credits': amount
      }
    });
  },
  
  async createStripeCheckout() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    if (!stripe) {
      throw new Meteor.Error('stripe-not-configured', 'Stripe is not configured');
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: '5 Export Credits',
          },
          unit_amount: 2000, // $20.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: Meteor.absoluteUrl('payment/success'),
      cancel_url: Meteor.absoluteUrl('payment/cancel'),
    });
    
    return session.id;
  }
}); 