app.controller("LibraryController", ['$scope', '$stateParams', '$state', '$timeout', 'NotebookService', 'LibraryService', 'DocumentService', '$ionicNavBarDelegate', '$ionicPopover', '$ionicPopup', '$ionicLoading', function($scope, $stateParams, $state, $timeout, NotebookService, LibraryService, DocumentService, $ionicNavBarDelegate, $ionicPopover, $ionicPopup, $ionicLoading){

    $scope.selectionMode = false;
    $scope.selectedBookmarks = {};

    $scope.openBookmark = function(notebookItem){
        if (!$scope.selectionMode){
            if (notebookItem.open.stateName === 'document.id'){
                var params = angular.copy(notebookItem.open.stateParams);
                $state.go('document.id', params);
            } else {
                $state.go(notebookItem.open.stateName, notebookItem.open.stateParams, {'reload': true, 'inherit': false});
            }
        }
    };

    /*
    * Multi Select.
    */
    $scope.disableSelectionMode = function(){
        $scope.selectedBookmarks = {};
        $scope.selectionModeUpdate(false);
    };

    $scope.selectionModeUpdate = function(mode){
        if (mode === true){
            var selectCount = Object.keys($scope.selectedBookmarks).length;
            $ionicNavBarDelegate.title("<font style='font-size:0.85em;'>" + selectCount + "&nbsp; Selected</font>");
            $scope.selectionMode = true;
        } else {
            $ionicNavBarDelegate.title("Library");
            $scope.selectionMode = false;
        }
    };

    $scope.toggleSelectBookmark = function(bookmarkId, stored){
          if ($scope.selectedBookmarks[bookmarkId] === true){
              delete $scope.selectedBookmarks[bookmarkId];
              if (Object.keys($scope.selectedBookmarks).length === 0){
                 $scope.filterStored('');
                 $scope.selectionModeUpdate(false);
              } else {
                 $scope.selectionModeUpdate(true);
              }
          } else {
              if (stored === false){
                $scope.filterStored(false);
              } else {
                $scope.filterStored(true);
              }

              $scope.selectedBookmarks[bookmarkId] = true;
              $scope.selectionModeUpdate(true);
          }
    };

    /*
    * Filter
    */
    $ionicPopover.fromTemplateUrl("components/library/libraryFilterPopupMenu.html", {
        scope: $scope
    }).then(function(popover) {
        $scope.filterPopover = popover;
    });

    $scope.filterPopup = function($event){
        $scope.filterPopover.show($event);
    };

    $scope.filterStored = function(value){
        $scope.filter = value;
        $scope.filterPopover.hide();
    };

    /*
    * Download and Unzip.
    */
    $scope.showProgressPopup = function(){
        $scope.progress = {
            max: 100,
            value: 0,
            state: ''
        };

        $scope.downloadPopup = $ionicLoading.show(
            {
                scope: $scope,
                templateUrl: 'components/library/progress.html',
                hideOnStateChange: false
            }
        );
    };

    $scope.hideProgressPopup = function(){
        $timeout(function(){
               $ionicLoading.hide();
            }, 1600
        );
    };

    $scope.progressCallback = function(progressEvent) {
        $scope.progress.max = progressEvent.total;
        $scope.progress.value = progressEvent.loaded;
    };

    $scope.downloadAndUnzip = function(){
           var patentDocList = Object.keys($scope.selectedBookmarks);
           $scope.showProgressPopup();
           $scope.progress.state = "Downloading...";

           $scope.downloadProcess = DocumentService.downloadAndStage(patentDocList).then(
                function(){
                   $scope.progress.state = "Complete";
                   $scope.hideProgressPopup();
                   console.log("---done---");
                },
                function(error){
                    $scope.progress.state = "ERROR";
                    console.log(error);
                },
                $scope.progressCallback
            );
    };

    $scope.abortDownload = function(){
        $ionicLoading.hide();
        console.log("aborting..");
        $scope.downloadProcess.abort();
    };

    $scope.deleteStored = function(){
        $ionicPopup.confirm({
            title: '<b>Delete</b> selected <u>Documents from cache.</u>?',
            template: 'Are you sure you wish to delete?'
        }).then(function(res) {
            if (res){
                var selected = Object.keys($scope.selectedBookmarks);

                for (var i = 0; i < selected.length; i++){
                    DocumentService.removeDocument(selected[i]);
                }
                $scope.selectedBookmarks = {};
                $scope.load();
            }
        });
    };

   $scope.update = function(){
        console.log("update");

        NotebookService.load();
        $scope.documentList = NotebookService.getAllBookmarksOfType('document');
        console.log($scope.documentList);

        $scope.storedDocuments = LibraryService.load();
        console.log($scope.storedDocuments);

        for (var docid in $scope.documentList){
            if ( LibraryService.hasDocumentId(docid) ){
                $scope.documentList[docid].stored = true;
            } else {
                $scope.documentList[docid].stored = false;
            }
        }
   };

   $scope.load = function(){
        $scope.filter = '';

        $scope.update();

        console.log("Stored Documents: ");
        console.log($scope.storedDocuments);
    };

    $scope.load();

}]);
