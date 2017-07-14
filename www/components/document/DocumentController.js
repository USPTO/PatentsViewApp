app.controller("DocumentController", ['$scope', '$state', '$stateParams', '$filter', '$ionicNavBarDelegate', 'PatentDoc', 'SearchService', 'NotebookService', '$ionicLoading', '$cordovaSocialSharing', 'RestURL', 'DETAIL_RESULT_FIELDS', '$http', function($scope, $state, $stateParams, $filter, $ionicNavBarDelegate, PatentDoc, SearchService, NotebookService, $ionicLoading, $cordovaSocialSharing, RestURL, DETAIL_RESULT_FIELDS, $http){

    $scope.data = {
        edhPatentCollection: []
    };

    $scope.loading = function(){
        $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner><br/><br/> Loading&#8230;',
            duration: 10000
        });
    };

    $scope.loadResults = function(response){
        $scope.data = response.patents[0];
        //$ionicNavBarDelegate.title($scope.data.country + " Patent");
        $ionicLoading.hide();
    };

    $scope.failure = function(error){
        $ionicLoading.hide();
        $scope.error = {'code': error.status, 'text': error.statusText};
    };

    $scope.load = function(){
        $scope.error = {};

        if ($stateParams.notebook){
            $scope.notebook = $stateParams.notebook;
        }

        if ($stateParams.id){
            $scope.loading();
            var searchQuery = {"_and": [{"patent_id": $stateParams.id}]};
            var searchUrl = RestURL+"?q="+JSON.stringify(searchQuery)+"&f="+JSON.stringify(DETAIL_RESULT_FIELDS);
            $http.get(searchUrl).then(function(response){
                $scope.loadResults(response.data);
            }, function(response){
                $scope.failure();
            });            
            //PatentDoc.get({'patentDocId': $stateParams.id, 'detailedView': true}).$promise.then( $scope.loadResults, $scope.failure );
        } else {
             $scope.loadResults( SearchService.lastDocument );
        }
    };

    $scope.editBookmark = function(bookmarkId){
        var notebookId = NotebookService.getNotebookId($scope.notebook);
        NotebookService.preliminaryBookmark = NotebookService.getBookmark(notebookId, bookmarkId);
        $state.go("bookmark.item", {'notebook': $scope.notebook, 'edit': true}, {'location': false, 'reload': true});
    };

    $scope.bookmarkDocument = function(){
        if (typeof $scope.notebook !== 'undefined'){
            $scope.editBookmark($scope.data.patentDocId);
            return;
        }

        var stateParams = {'id': $scope.data.patentDocId};

        var bookmarkObj = {
            'id': $scope.data.patentDocId,
            'type': 'document',
            'subtype': 'grant',
            'name': $scope.data.inventionTitle,
            'open': { 'stateName': 'document.id', 'stateParams': stateParams },
            'stored': false
        };

        NotebookService.preliminaryBookmark = bookmarkObj;
        $state.go("bookmark.item", {}, {'location': false, 'reload': true});
    };

    $scope.bookmarkInventor = function(id){
        var patentInventors = $filter('orderBy')($scope.data.patentInventors, 'lastName', false);
        var inventor = patentInventors[id];

        var stateParams = {'inventorFirstName': inventor.firstName, 'inventorLastName': inventor.lastName};

        var bookmarkObj = {
            'id': inventor.patentPartyId,
            'type': 'person',
            'subtype': 'inventor',
            'name': inventor.firstName + " " + inventor.lastName,
            'open': { 'stateName': 'results', 'stateParams': stateParams }
        };

        NotebookService.preliminaryBookmark = bookmarkObj;
        $state.go("bookmark.item", {}, {'location': false, 'reload': true});
    };

    $scope.bookmarkApplicant = function(id){
        var patentApplicants = $filter('orderBy')($scope.data.patentApplicants, 'lastName', false);
        var applicant = patentApplicants[id];

        var type = "";
        var stateParams = {};
        var name = "";

        if ( applicant.orgName !== null ){
            type = 'org';
            stateParams = {'applicantOrgName': applicant.orgName};
            name = applicant.orgName;
        } else {
            type = 'person';
            stateParams = {'applicantFirstName': applicant.firstName, 'applicantLastName': applicant.lastName};
            name = applicant.firstName + " " + applicant.lastName;
        }

        var bookmarkObj = {
            'id': applicant.patentPartyId,
            'type': type,
            'subtype': 'applicant',
            'name': name,
            'open': { 'stateName': 'results', 'stateParams': stateParams }
        };

        NotebookService.preliminaryBookmark = bookmarkObj;
        $state.go("bookmark.item", {}, {'location': false, 'reload': true});
    };

    $scope.bookmarkAssignee = function(id){
        var patentAssignees = $filter('orderBy')($scope.data.patentAssignees, 'lastName', false);
        var assignee = patentAssignees[id];

        var bookmarkObj;
        if (typeof assignee.orgName !== 'undefined'){
            var stateParams = {'assigneeOrgName': assignee.orgName};

            bookmarkObj = {
                'id': assignee.patentAssigneeId,
                'type': 'org',
                'subtype': 'assignee',
                'name': assignee.orgName,
                'open': { 'stateName': 'results', 'stateParams': stateParams }
            };

        } else {
            var stateParams = {'assigneeFirstName': assignee.firstName, 'assigneeLastName': assignee.lastName};

            bookmarkObj = {
                'id': assignee.patentAssigneeId,
                'type': 'person',
                'subtype': 'assignee',
                'name': assignee.firstName + " " + assignee.lastName,
                'open': { 'stateName': 'results', 'stateParams': stateParams }
            };
        }

        NotebookService.preliminaryBookmark = bookmarkObj;
        $state.go("bookmark.item", {}, {'location': false, 'reload': true});
    };

    $scope.openText = function(patentDocId){
        var url = "http://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO2&Sect2=HITOFF&p=1&u=%2Fnetahtml%2FPTO%2Fsearch-adv.htm&r=0&f=S&l=50&d=PTXT&Query=";
        //var url = "http://patft.uspto.gov/netacgi/nph-Parser?patentnumber=";

        // left pad with zeroes
        patentDocId = ("0000"+patentDocId).substr(-8);

        /*
        var firstChar = patentDocId.substring(0, 1);
        if (firstChar === 0){
          patentDocId = patentDocId.substring(1, 8);
        }

        var secondChar = patentDocId.substring(1, 2);
        if (secondChar === 0){
            var part2 = patentDocId.substring(0, 1);
            var part3 = patentDocId.substring(2, 8);
            patentDocId = part2 + part3;
        }*/

        $scope.loading();

        var winRef = window.open(url + patentDocId, '_blank', 'location=yes,hidden=yes,closebuttoncaption=Back,enableViewportScale=yes');
        winRef.addEventListener('loadstop', function() {
            winRef.insertCSS({code: 'body{zoom:2;line-height:2;}' }, function(){
                $ionicLoading.hide(); winRef.show();
            });
        });
    };

    $scope.openPDF = function(patentDocId){
        /*
        var url = "http://pdfpiw.uspto.gov/.piw?idkey=NONE&Docid=" + patentDocId;
        */

        // left pad with zeroes
        patentDocId = ("0000"+patentDocId).substr(-8);

        var part1 = patentDocId.substring(0, 3);
        var part2 = patentDocId.substring(3, 6);
        var part3 = patentDocId.substring(6, 8);
        var url = "http://pimg-fpiw.uspto.gov/fdd/" + part3 + "/" + part2 + "/" + part1 + "/0.pdf";

        /*
         *    Following URL Returns a Zip file containing the TIF images.
         *    http://edhapi.uspto.gov/edh-rest/rest/grants/{patentDocId}/MultiPage/data/
         */

        $scope.loading();

        var winRef = window.open('https://drive.google.com/viewerng/viewer?embedded=true&url=' + url, '_blank', 'location=yes,ebuttoncaption=Back,enableViewportScale=yes,hidden=yes');
        winRef.addEventListener('loadstop', function() {
            $ionicLoading.hide(); winRef.show();
        });
    };

    $scope.share = function(){
        $cordovaSocialSharing.share($scope.data)
            .then( function(){
                console.log("share sucess.");
            }, function() {
                console.log("error sharing.");
            }
            );

        //window.plugins.socialsharing.share($scope.data);
    };

    $scope.load();
}]);
