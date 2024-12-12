import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import * as bootstrap from 'bootstrap';

// Make bootstrap available globally
window.bootstrap = bootstrap;

// Import styles
import './styles/main.css';




// Import all templates
import './main.html';
import './templates/layouts/mainLayout.html';
import './templates/pages/home.html';
import './templates/pages/editor.html';
import './templates/pages/editor.js';
import './templates/pages/payment.html';
import './templates/pages/payment.js';
import './templates/pages/login.html';
import './templates/pages/login.js';

// Import routing
import './routes';

Template.navbar.onRendered(function() {
  // Initialize collapse
  const navbarCollapse = this.find('.navbar-collapse');
  if (navbarCollapse) {
    new bootstrap.Collapse(navbarCollapse, {
      toggle: false
    });
  }
});

Template.navbar.events({
  'click #logout'(event) {
    event.preventDefault();
    Meteor.logout();
  },
  'click .nav-link'(event, template) {
    const navbarCollapse = template.find('.navbar-collapse');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }
  }
});
