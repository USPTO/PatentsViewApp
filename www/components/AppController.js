app.controller("AppController", ['$scope', '$state', '$ionicHistory', '$ionicSideMenuDelegate', 'SettingsService', function($scope, $state, $ionicHistory, $ionicSideMenuDelegate, SettingsService){

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.toggleRight = function() {
    $ionicSideMenuDelegate.toggleRight();
  };

  $scope.backButton = function(){
    $ionicHistory.goBack();
  };

  $scope.openLink = function(url) {
        window.open(url, '_system');
  };

  $scope.load = function(){
	$scope.settings = SettingsService.load();
  };

  $scope.load();

}]);
