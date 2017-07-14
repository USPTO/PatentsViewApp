app.controller("SearchResultsController", ['$scope', '$state', '$stateParams', 'SearchService', 'NotebookService', '$ionicPopup', function($scope, $state, $stateParams, SearchService, NotebookService, $ionicPopup){

    $scope.pageSizeByScreenSize = function(){
        return Math.floor((window.innerHeight / 610) * 5);
    };

    $scope.resultsPerPage = $scope.pageSizeByScreenSize();
    $scope.currentPage = 1;
    $scope.totalResults = 0;
    $scope.searching = false;

    $scope.hasViewed = function(patentDocId){
        return SearchService.hasViewed(patentDocId);
    };

    $scope.backPage = function(){
        if ($scope.data.pageNumber > 1){
            return $scope.data.pageNumber - 1;
        }
        return 0;
    };

    $scope.nextPage = function(){
        if ( $scope.data.pageNumber < ($scope.totalPages - 1) ){
            return $scope.data.pageNumber + 1;
        }
        return ($scope.totalPages - 1);
    };

    $scope.goBackPage = function(){
        $state.go('results', {'pageNo': $scope.backPage()}, {'reload': false, 'inherit': true});
    };

    $scope.goNextPage = function(){
        $scope.nextPage();
        $state.go('results', {'pageNo': $scope.nextPage()}, {'reload': false, 'inherit': true});
    };

    $scope.showPagePopup = function(){
        $scope.pageData = {};
        $ionicPopup.show({
            template: '<input type="number" min="1" max="' + $scope.totalPages + '" ng-model="pageData.number" autofocus>',
            title: 'Enter Page Number',
            subTitle: 'page you wish to jump to.',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Go</b>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.pageData.number) {
                    e.preventDefault();
                  } else {
                       $state.go('results', {'pageNo': $scope.pageData.number - 1 }, {'reload': false, 'inherit': true});
                  }
                }
              }
            ]
        });
    };

    $scope.bookmark = function(){
        var ignore = ['detailedView', 'pageSize', 'sort', 'clear'];
        var vals = Object.keys($stateParams).map(function (key) {
            if (typeof $stateParams[key] !== 'undefined' && ignore.indexOf(key) === -1){
                return key + ":" + $stateParams[key];
            }
        });
        var name = vals.join(' ').trim();

        var bookmarkObj = {
            'id': name,
            'type': 'search',
            'subtype': 'search',
            'name': name,
            'open': { 'stateName': 'results', 'stateParams': $stateParams}
        };

        NotebookService.preliminaryBookmark = bookmarkObj;
        $state.go("bookmark.item", {}, {'location': false, 'reload': true});
    };

    $scope.load = function(){
        console.log("loading search results");
        $scope.searching = false;
        $scope.data = SearchService.searchResults;
        $scope.totalPages = Math.ceil($scope.data.total_patent_count / $scope.resultsPerPage);
    };

    $scope.$on('SearchComplete', $scope.load);

    $scope.$on('SearchStarted', function(){
        $scope.error = {};
        $scope.searching = true;
    });

    $scope.$on('SearchFailed', function(event, error){
        $scope.error = error;
        $scope.searching = false;
        console.log("search failed");
    });

    $scope.$on('$ionicView.beforeLeave', function() {
        $scope.searching = false;
    });

    $scope.init = function(){
        $scope.data = SearchService.searchResults;

        if ($stateParams){
            $stateParams.pageSize = $scope.resultsPerPage;
            SearchService.search($stateParams);
        }

        $scope.currentViewDocument = SearchService.lastDocumentId;
    };

    $scope.init();
}]);
