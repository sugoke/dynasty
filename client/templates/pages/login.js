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
  
  'click #show-register'(event, instance) {
    event.preventDefault();
    document.getElementById('register-form-container').classList.remove('d-none');
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