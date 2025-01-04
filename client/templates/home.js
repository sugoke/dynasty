Template.home.events({
  'click .open-editor'(event) {
    event.preventDefault();
    Router.go('editor');
  }
}); 