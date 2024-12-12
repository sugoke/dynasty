import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import './login.html';

Template.login.events({
  'submit #login-form'(event, instance) {
    event.preventDefault();
    
    const email = event.target.email.value;
    const password = event.target.password.value;
    
    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        alert(error.reason);
      } else {
        FlowRouter.go('/');
      }
    });
  },
  
  'click #show-register'(event) {
    event.preventDefault();
    $('#login-card').fadeOut(300, function() {
      $('#register-card').removeClass('d-none').hide().fadeIn(300);
    });
  },
  
  'click #show-login'(event) {
    event.preventDefault();
    $('#register-card').fadeOut(300, function() {
      $('#login-card').removeClass('d-none').hide().fadeIn(300);
    });
  },
  
  'submit #register-form'(event, instance) {
    event.preventDefault();
    
    const email = event.target['reg-email'].value;
    const password = event.target['reg-password'].value;
    
    Accounts.createUser({
      email,
      password,
      profile: {
        credits: 0
      }
    }, (error) => {
      if (error) {
        alert(error.reason);
      } else {
        FlowRouter.go('/');
      }
    });
  }
}); 