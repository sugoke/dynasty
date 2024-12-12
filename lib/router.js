FlowRouter.route('/editor', {
  name: 'editor',
  action() {
    BlazeLayout.render('mainLayout', { main: 'editor' });
  }
}); 