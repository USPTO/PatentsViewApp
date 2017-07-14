app.controller("SettingsController", ['$scope', 'SettingsService', function($scope, SettingsService){

	$scope.settings = {

	};

	$scope.submit = function(){
		SettingsService.settings = $scope.settings;
		SettingsService.persist();
	};

	$scope.load = function(){
		$scope.settings = SettingsService.load();
	};

	$scope.load();
}]);
