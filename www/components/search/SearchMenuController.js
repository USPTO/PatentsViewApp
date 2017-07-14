app.controller("SearchMenuController", ['$scope', '$stateParams', '$state', 'SearchService', '$ionicSideMenuDelegate', 'FIELDS', 'SORT_FIELDS', function($scope, $stateParams, $state, SearchService, $ionicSideMenuDelegate, FIELDS, SORT_FIELDS){

  $scope.searchByExpand = true;

  $scope.searching = false;
  $scope.FIELDS = FIELDS;
  $scope.SORT_FIELDS = SORT_FIELDS;
  $scope.sort = {};

  $scope.sortBy = function(){
    SearchService.sortBy = $scope.sort.field;
    var query = SearchService.buildQuery();
    $state.go("results", query, {'inherit': false});
  };

  $scope.removeTerm = function(searchTerm){
    SearchService.removeSearchTerm(searchTerm);
    var query = SearchService.buildQuery();
    if ( SearchService.searchTermCount() > 0){
        $state.go("results", query, {'inherit': false});
    } else {
        $state.go("results", {clear: true}, {'inherit': false});
    }
  };

  $scope.load = function(){
    $scope.newQuery = SearchService.newQuery;
    $scope.sort.field = SearchService.sortBy;
  };

  $scope.$on('SearchComplete', function(){
      $scope.load();
  });

  $scope.load();

}]);
