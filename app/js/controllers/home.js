var controllersIndex = require('./index');

function HomeCtrl() {

  this.title = "Test Title";

}

controllersIndex.controller('homeCtrl', HomeCtrl);