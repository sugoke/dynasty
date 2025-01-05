import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import './login.html';

Template.login.events({
  'submit #login-form'(event, instance) {
    event.preventDefault();
    
    const btn = event.target.querySelector('#loginBtn');
    const spinner = btn.querySelector('.spinner-border');
    const btnText = btn.querySelector('.btn-text');
    
    // Show spinner
    spinner.classList.remove('d-none');
    btnText.classList.add('d-none');
    btn.disabled = true;
    
    const email = event.target.email.value;
    const password = event.target.password.value;
    
    Meteor.loginWithPassword(email, password, (error) => {
      // Hide spinner
      spinner.classList.add('d-none');
      btnText.classList.remove('d-none');
      btn.disabled = false;
      
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
    
    const btn = event.target.querySelector('#registerBtn');
    const spinner = btn.querySelector('.spinner-border');
    const btnText = btn.querySelector('.btn-text');
    
    // Show spinner
    spinner.classList.remove('d-none');
    btnText.classList.add('d-none');
    btn.disabled = true;
    
    const email = event.target['reg-email'].value;
    const password = event.target['reg-password'].value;
    
    Accounts.createUser({
      email,
      password,
      profile: {
        credits: 0
      }
    }, (error) => {
      // Hide spinner
      spinner.classList.add('d-none');
      btnText.classList.remove('d-none');
      btn.disabled = false;
      
      if (error) {
        alert(error.reason);
      } else {
        FlowRouter.go('/');
      }
    });
  },
  
  'click #show-forgot-password'(event) {
    event.preventDefault();
    $('#login-card').fadeOut(300, function() {
      $('#forgot-password-card').removeClass('d-none').hide().fadeIn(300);
    });
  },
  
  'click #show-login-from-forgot'(event) {
    event.preventDefault();
    $('#forgot-password-card').fadeOut(300, function() {
      $('#login-card').removeClass('d-none').hide().fadeIn(300);
    });
  },
  
  'submit #forgot-password-form'(event, instance) {
    event.preventDefault();
    
    const email = event.target['reset-email'].value;
    
    Accounts.forgotPassword({ email }, (error) => {
      if (error) {
        alert(error.reason);
      } else {
        alert('Password reset email sent. Please check your inbox.');
        // Switch back to login view
        $('#forgot-password-card').fadeOut(300, function() {
          $('#login-card').removeClass('d-none').hide().fadeIn(300);
        });
      }
    });
  }
}); 