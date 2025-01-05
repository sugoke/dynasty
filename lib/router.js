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

// Add a route trigger that runs before any route
FlowRouter.triggers.enter([function(context, redirect) {
  // Check if trying to access editor while logged out
  if (context.route.name === 'editor' && !Meteor.userId()) {
    redirect('/');
  }
}]);

// Update editor route definition
FlowRouter.route('/editor', {
  name: 'editor',
  triggersEnter: [(context, redirect) => {
    if (!Meteor.userId()) {
      redirect('/');
    }
  }],
  action() {
    if (Meteor.userId()) {
      BlazeLayout.render('mainLayout', { main: 'editor' });
    }
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