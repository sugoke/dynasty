import { Template } from 'meteor/templating';
import './header.html';

Template.header.events({
  'click #logoutBtn'(event) {
    const btn = event.currentTarget;
    const spinner = btn.querySelector('.spinner-border');
    const btnText = btn.querySelector('.btn-text');
    
    // Show spinner
    spinner.classList.remove('d-none');
    btnText.classList.add('d-none');
    btn.disabled = true;
    
    Meteor.logout((error) => {
      // Hide spinner
      spinner.classList.add('d-none');
      btnText.classList.remove('d-none');
      btn.disabled = false;
      
      if (error) {
        alert(error.reason);
      } else {
        // Redirect to home on successful logout
        FlowRouter.go('/');
      }
    });
  }
}); 