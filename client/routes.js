import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/pwix:blaze-layout';

// Routes
FlowRouter.route('/', {
  name: 'home',
  action() {
    BlazeLayout.render('mainLayout', {
      main: 'home'
    });
  }
});

FlowRouter.route('/editor', {
  name: 'editor',
  triggersEnter: [(context, redirect) => {
    if (!Meteor.userId()) {
      redirect('/login');
    }
  }],
  action() {
    BlazeLayout.render('mainLayout', {
      main: 'editor'
    });
  }
});

FlowRouter.route('/login', {
  name: 'login',
  action() {
    BlazeLayout.render('mainLayout', {
      main: 'login'
    });
  }
});

FlowRouter.route('/payment', {
  name: 'payment',
  triggersEnter: [(context, redirect) => {
    if (!Meteor.userId()) {
      redirect('/login');
    }
  }],
  action() {
    BlazeLayout.render('mainLayout', {
      main: 'payment'
    });
  }
});

FlowRouter.route('/payment/success', {
  name: 'paymentSuccess',
  triggersEnter: [(context, redirect) => {
    if (!Meteor.userId()) {
      redirect('/login');
    }
  }],
  action() {
    // Add credits to user
    Meteor.call('addCredits', 5, (error) => {
      if (error) {
        alert('Error adding credits: ' + error.reason);
      }
    });
    // Redirect to editor
    FlowRouter.go('/editor');
  }
});

FlowRouter.route('/payment/cancel', {
  name: 'paymentCancel',
  action() {
    // Redirect back to payment page
    FlowRouter.go('/payment');
  }
}); 