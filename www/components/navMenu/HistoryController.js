app.controller("HistoryController", ['$scope', '$state', '$ionicHistory', '$ionicSideMenuDelegate', function($scope, $state, $ionicHistory, $ionicSideMenuDelegate){

  $scope.data = {};

  $scope.lastSearch = function(){
    var params = $scope.getLastStateParams('results');
    if (typeof params !== 'undefined'){
        $state.go('results', params);
        $ionicSideMenuDelegate.toggleLeft();
    } else {
        console.log("menu");
        $ionicSideMenuDelegate.toggleRight();
    }
  };

  $scope.lastDocument = function(){
    var params = $scope.getLastStateParams('document.id');
    if (typeof params !== 'undefined'){
        $state.go('document.id', params);
    }
  };

  $scope.getLastStateParams = function(stateName){
    var hist = $ionicHistory.viewHistory();
    var keys = Object.keys(hist.views);
    for (var i = keys.length - 1; i >= 0; i--){
        if (hist.views[ keys[i] ].stateName === stateName){
            return hist.views[ keys[i] ].stateParams;
        }
    }
  };

  $scope.load = function(){
    $scope.data = {};
    var hist = $ionicHistory.viewHistory();
    var keys = Object.keys(hist.views);
    var want = ['results', 'document.id'];
    for (var i = keys.length - 1; i >= 0; i--){
        var stateName = hist.views[ keys[i] ].stateName;
        var stateId = hist.views[ keys[i] ].stateId.split('_')[1];
        if (want.indexOf(stateName) !== -1){
            if (typeof $scope.data[stateName] === 'undefined'){
                $scope.data[stateName] = {};
            }
            $scope.data[stateName][stateId] = hist.views[ keys[i] ].stateParams;
        }
    }
  };

  $scope.$watch(function () {
    return $ionicSideMenuDelegate.isOpenLeft();
  }, function () {
    $scope.load();
  });

}]);
