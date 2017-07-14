app.controller("SearchController", ['$scope', '$stateParams', '$state', 'SearchService', 'FIELDS', '$cordovaBarcodeScanner', function($scope, $stateParams, $state, SearchService, FIELDS, $cordovaBarcodeScanner){

    $scope.FIELDS = FIELDS;
    $scope.showErrors = false;

    $scope.addSearchField = function(){
        SearchService.appendSearchObj($scope.field, $scope.searchForm);
        var query = SearchService.buildQuery();
        $state.go("results", query, {'reload': true, 'inherit': false});
    };

    $scope.backButton = function(){
        $state.go("search-view", null, { location: false});
    };

    $scope.load = function(){
        $scope.field = $stateParams.field;
        $scope.searchForm = {};
    };

    $scope.barcodeScan = function(){
        console.log("clicked barcode scan.");
        $cordovaBarcodeScanner.scan().then(
          function(result){ // result = { text: '', cancelled: false,  format: "CODE_39" }
              if (result.format === 'CODE_39' && !result.cancelled){
                var text = result.text;
                $scope.searchForm.patentDocId = text.substring(3, text.length - 2);

                // Search.
                // $scope.addSearchField();

                // Go Straight to document metadata view.
                //$state.go('document.id', { id: $scope.searchForm.patentDocId });
              } else {
                  if (result.format !== 'CODE_39'){
                    console.log(result);
                    var text = result.text;
                    $scope.searchForm.patentDocId = text.substring(3, text.length - 2);
                  }
              }
          },
          function(error) {
               console.log(error);
          },
          { 'PURE_BARCODE': true, 'POSSIBLE_FORMATS': ['CODE_39'], 'CHARACTER_SET': 'US-ASCII', 'ALLOWED_LENGTHS': [13], 'TRY_HARDER': true}
        );
    };

    $scope.load();
}]);
