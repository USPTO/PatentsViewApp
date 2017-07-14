app.controller("PatentViewer", ['$scope', '$state', '$stateParams', '$location', '$anchorScroll', '$ionicScrollDelegate', '$ionicPopover', '$ionicHistory', '$ionicLoading', '$timeout', '$cordovaSocialSharing', 'DocumentService', 'NotebookService', 'LibraryService', function($scope, $state, $stateParams, $location, $anchorScroll, $ionicScrollDelegate, $ionicPopover, $ionicHistory, $ionicLoading, $timeout, $cordovaSocialSharing, DocumentService, NotebookService, LibraryService){

    $scope.pageFind = false;
    $scope.find = { term: '' };
    $scope.highlight = new Hilitor("patent-doc");
    $scope.showPageFind = function(){
        $scope.moreMenuPopover.hide();
        $scope.pageFind = true;
    };

    $scope.closePageFind = function(){
        $scope.pageFind = false;
        $scope.highlight.remove();
    };

    $scope.clearPageFind = function(){
        $scope.find.term = "";
        $scope.highlight.remove();
    };

    $scope.selection = false;
    $scope.onHold = function(){
        $scope.selection = !$scope.selection;
    };

    //console.log($scope.result);

    $scope.showMenu = function(){
        $ionicHistory.nextViewOptions({
            disableAnimate: true
        });
        $state.go("patent-menu", {}, {'location': false, 'reload': false});
    };

    $scope.patentSearch = function(){
         $ionicHistory.nextViewOptions({
            disableAnimate: true
         });
         $state.go("search-view", {}, {'location': false, 'reload': true});
    };

   $scope.bookmark = function(){
        $scope.moreMenuPopover.hide();

        var stateParams = {'id': $scope.patentDocId};

        var bookmarkObj = {
            'id': $scope.patentDocId,
            'type': 'document',
            'subtype': 'grant',
            'name': $scope.inventionTitle,
            'open': { 'stateName': 'document.id', 'stateParams': stateParams },
            'stored': false
        };

        NotebookService.preliminaryBookmark = bookmarkObj;
        $state.go("bookmark.item", {}, {'location': false, 'reload': true});
    };

    $scope.share = function(){
        $scope.moreMenuPopover.hide();

        $cordovaSocialSharing.share($scope.patentDocId)
            .then( function(){
                console.log("share sucess.");
            }, function() {
                console.log("error sharing.");
            }
            );

        //window.plugins.socialsharing.share($scope.patentDocId);
    };

    // Patent Viewer More Menu Popup.
    $ionicPopover.fromTemplateUrl("components/patentViewer/patentViewerMorePopupMenu.html", {
        scope: $scope
    }).then(function(popover) {
        $scope.moreMenuPopover = popover;
    });

    $scope.moreMenuPopup = function($event){
        $scope.moreMenuPopover.show($event);
    };

    $scope.pageFindText = function(){
        var text = $scope.find.term;

        $scope.highlight.setMatchType("open");
        $scope.highlight.apply(text);
        var hash = $scope.highlight.next();

        $location.hash(hash);
        $ionicScrollDelegate.anchorScroll(false);
   };

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

   $scope.abortDownload = function(){
        $ionicLoading.hide();
        $scope.downloadProcess.abort();
   };

   $scope.fetchDocument = function(patentDocId){
           if ( !LibraryService.hasDocumentId(patentDocId) ){

               $scope.showProgressPopup();
               $scope.progress.state = "Downloading...";

               $scope.downloadProcess = DocumentService.downloadAndStage([ patentDocId ]).then(
                    function(){
                        $scope.progress.state = "Loading...";
                        DocumentService.readLocalPatentDoc(patentDocId).then(
                            function(data){
                               $scope.result = xmlToJSON.parseString(data, {childrenAsArray: false, normalize: false, grokText: false});

                               $scope.bib = $scope.result['us-patent-grant']['us-bibliographic-data-grant'];
                               $scope.patentDocId = $scope.bib['publication-reference']['document-id']['doc-number']._text;
                               $scope.inventionTitle = $scope.bib['invention-title']._text;

                               $scope.progress.state = "Complete";
                               $scope.hideProgressPopup();
                               console.log("---done---");
                            },
                            function(error){
                                $scope.progress.state = "ERROR";
                                console.log(error);
                            }
                        );
                    },
                    function(error){
                        $scope.progress.state = "ERROR";
                        console.log(error);
                    },
                    $scope.progressCallback
                );
           } else {
                $scope.showProgressPopup();
                $scope.progress.state = "Loading...";
                DocumentService.readLocalPatentDoc(patentDocId).then(
                        function(data){
                           $scope.result = xmlToJSON.parseString(data, {childrenAsArray: true, normalize: false, grokText: false});

                           $scope.bib = $scope.result['us-patent-grant'][0]['us-bibliographic-data-grant'][0];
                           $scope.patentDocId = $scope.bib['publication-reference'][0]['document-id'][0]['doc-number'][0]._text;
                           $scope.inventionTitle = $scope.bib['invention-title'][0]._text;

                           $scope.progress.state = "Complete";
                           $scope.hideProgressPopup();
                           console.log("---done---");
                        },
                        function(error){
                            $scope.progress.state = "ERROR";
                            console.log(error);
                        }
                    );
           }
   };

   $scope.load = function(){
       if (typeof cordova !== 'undefined'){

           var patentDocId = '07428585'; //  07428585, D0695990, D0695993
           //var patentDocId = $stateParams.id;

           $scope.fetchDocument(patentDocId);

       } else { // Load Test Document.

            var testDoc = "test3.xml";

            DocumentService.readTestPatentDocXML(testDoc).then(function(data){
               $scope.result = xmlToJSON.parseString(data, {childrenAsArray: true, normalize: false, grokText: false});
               $scope.bib = $scope.result['us-patent-grant'][0]['us-bibliographic-data-grant'][0];
               $scope.patentDocId = $scope.bib['publication-reference'][0]['document-id'][0]['doc-number'][0]._text;
               $scope.inventionTitle = $scope.bib['invention-title'][0]._text;
            }, function(status){
               console.log(status);
            });
       }
   };

   $scope.load();

}]);
