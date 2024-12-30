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