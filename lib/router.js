FlowRouter.route('/', {
  name: 'home',
  action() {
    BlazeLayout.render('mainLayout', { main: 'editor' });
  }
});

// Add a not found route
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('mainLayout', { main: 'notFound' });
  }
};

// For FlowRouter
FlowRouter.route('/editor', {
  name: 'editor',
  triggersEnter: [(context, redirect) => {
    if (!Meteor.userId()) {
      redirect('/');
    }
  }],
  action() {
    BlazeLayout.render('mainLayout', { main: 'editor' });
  }
});

// Or for Iron Router
Router.route('/editor', {
  name: 'editor',
  onBeforeAction: function() {
    if (!Meteor.userId()) {
      this.redirect('/');
    } else {
      this.next();
    }
  }
}); 