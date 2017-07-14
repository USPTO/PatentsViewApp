app.controller("NotebookController", ['$scope', '$stateParams', '$state', '$timeout', '$compile', 'NotebookService', 'SearchService', '$ionicNavBarDelegate', '$ionicPopover', '$ionicPopup', '$cordovaFile', '$cordovaSocialSharing', function($scope, $stateParams, $state, $timeout, $compile, NotebookService, SearchService, $ionicNavBarDelegate, $ionicPopover, $ionicPopup, $cordovaFile, $cordovaSocialSharing){

    $scope.readOnly = true;
    $scope.editTitle = false;
    $scope.showReorder = false;
    $scope.showDesc = true;
    $scope.selectionMode = false;
    $scope.selectedBookmarks = {};

    $scope.setReadonly = function(bool){
        $scope.readOnly = bool;
        $scope.editTitle = false;
        $scope.showReorder = false;
        $scope.selectionModeUpdate(!bool);
    };

    $scope.toggleDesc = function(){
        $scope.showDesc = !$scope.showDesc;
    };

    $scope.toggleEditTitle = function(){
        $scope.editTitle = !$scope.editTitle;
        $scope.popover.hide();
    };

    $scope.selectionModeUpdate = function(inSelectionMode){
        $scope.selectionMode = inSelectionMode;
        console.log("select mode: " + inSelectionMode);
        if (inSelectionMode){
            var selectCount = Object.keys($scope.selectedBookmarks).length;
            $ionicNavBarDelegate.title("<font style='font-size:0.85em;'>" + selectCount + " &nbsp;Selected</font>");
        } else {
            $ionicNavBarDelegate.title("Notebook");
        }
    };

    $scope.toggleShowReorder = function(){
        $scope.popover.hide();
        $scope.showReorder = !$scope.showReorder;
    };

    $scope.openBookmark = function(notebookItem){
        if ($scope.readOnly){
            if (notebookItem.open.stateName === 'document.id'){
                var params = angular.copy(notebookItem.open.stateParams);
                params.notebook = $scope.notebook.name;
                $state.go('document.id', params);
            } else {
                $state.go(notebookItem.open.stateName, notebookItem.open.stateParams, {'reload': true, 'inherit': false});
            }
        }
    };

    $scope.editBookmark = function(bookmark){
        if ($scope.readOnly){
            NotebookService.preliminaryBookmark = bookmark;
            $state.go("bookmark.item", {'edit': true, 'notebook': $scope.notebook.name}, {'location': false, 'reload': true});
        }
    };

    $scope.toggleSelectBookmark = function(bookmarkId){
          if ($scope.selectedBookmarks[bookmarkId]){
              delete $scope.selectedBookmarks[bookmarkId];
          } else {
              $scope.selectedBookmarks[bookmarkId] = true;
          }
          $scope.selectionModeUpdate(true);
    };

    $scope.deleteSelected = function(notebookId){
        var selected = Object.keys($scope.selectedBookmarks);
        $ionicPopup.confirm({
            title: '<b>Delete</b> selected <u>Bookmarks</u>?',
            template: 'Are you sure you wish to delete?'
        }).then(function(res) {
            if (res){
                NotebookService.deleteBookmarks(notebookId, selected);
                $scope.selectedBookmarks = {};
                $scope.load();
            }
        });
    };

    $scope.moveBookmark = function(notebookId, bookmark, fromIndex, toIndex){
        NotebookService.moveBookmark(notebookId, bookmark, fromIndex, toIndex);
    };

    $scope.deleteBookmark = function(notebookId, bookmark){
        $ionicPopup.confirm({
            title: '<b>Delete</b> this <u>Bookmark</u>?',
            template: 'Are you sure you wish to delete?'
        }).then(function(res) {
            if (res){
                NotebookService.deleteBookmark(notebookId, bookmark);
            }
        });
    };

    $scope.shareBookmark = function(bookmark){
        var body = angular.element("<html></html>");

        var template = angular.element('<head><style>table{border-spacing:0;border-collapse:collapse;border-spacing:2px;border:1px solid #ddd;} th{font-weight: bold;} td, th {padding:8px;line-height:1.42857143;vertical-align:top;border-top:1px solid #ddd;} tr:nth-child(even){background-color:#eee;} tr:nth-child(odd){background-color:#fff;}</style></head><body><table><tbody><tr><th>Type</th><th>ID</th><th>Name</th><th>Tag</th></tr><tr><td>{{bookmark.type}}</td><td>{{bookmark.id}}</td><td>{{bookmark.name}}</td><td>{{bookmark.tag}}</td></tr></tbody></table></body>');

        var el = $compile(template)(bookmark.$parent);
        body.append(el);

        setTimeout(function() {
           $scope.performShare('Bookmark attached.', 'USPTO Grants: bookmark', body[0].outerHTML, 'bookmark.html');
        }, 1);
    };

    $scope.deleteNotebook = function(){
        $scope.popover.hide();
        $ionicPopup.confirm({
             title: '<b>Delete</b> this <u>Notebook</u>?',
             template: 'Are you sure you wish to delete?',
             scope: $scope
           }).then(function(res) {
                if (res){
                    $scope.setReadonly(true);
                    NotebookService.deleteNotebook($scope.notebookActionId);
                    $state.go("notebook.list");
                }
        });
    };

    $scope.saveNotebook = function(notebookId, notebook){
        NotebookService.saveNotebook(notebookId, notebook);
    };

    // More-menu.
    $ionicPopover.fromTemplateUrl("components/notebook/notebookMoreMenu.html", {
        scope: $scope
        }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.notebookMoreActions = function($event, notebookId){
        if ($scope.showReorder === true){
            $scope.showReorder = false;
        } else {
            $scope.notebookActionId = notebookId;
            $scope.popover.show($event);
        }
    };

    $scope.mergeNotebook = function(){
        //TODO add functionality, select notebook to merge with.
        $scope.popover.hide();
    };

    $scope.shareAsAttachment = function(message, subject, fileContents, filename){

        $cordovaFile.writeFile(cordova.file.dataDirectory, filename, fileContents, true)
            .then( function(progressEvent){
                   console.log(progressEvent);
                   console.log("file written success.");

                   $cordovaSocialSharing.share(message, subject, progressEvent.target.localURL)
                        .then( function(){
                            console.log("share success.");
                        },
                        function(){
                            console.log("failed to share.");
                        }
                    );
            },
            function(error){
                console.log(error.code);
                //$ionicPopup.alert({ title: 'Error', template: msg });
            }
          );

        /*
        window.requestFileSystem(LocalFileSystem.TEMPORARY, 1024 * 1024, function(filesystem) {

            filesystem.root.getFile(filename, {create: true}, function(fileEntry) {

                fileEntry.createWriter(function(writer) {
                    writer.onwriteend = function() {
                        window.plugins.socialsharing.share(message, subject, fileEntry.toURL());
                    };

                    writer.write(fileContents);

                }, fail);

            }, fail);

        }, fail);
        */
    };

    $scope.share = function(){
        var body = angular.element("<html></html>");

        var template = angular.element('<head><style>table{border-spacing:0;border-collapse:collapse;border-spacing:2px;border:1px solid #ddd;} th{font-weight: bold;} td, th {padding:8px;line-height:1.42857143;vertical-align:top;border-top:1px solid #ddd;} tr:nth-child(even){background-color:#eee;} tr:nth-child(odd){background-color:#fff;}</style></head><body><h3>{{notebook.name}}</h3><div>{{notebook.note}}</div><table><tbody><tr><th>Type</th><th>ID</th><th>Name</th><th>Tag</th></tr><tr ng-repeat="item in notebook.bookmarks"><td>{{item.type}}</td><td>{{item.id}}</td><td>{{item.name}}</td><td>{{item.tag}}</td></tr></tbody></table></body>');

        var el = $compile(template)($scope);
        body.append(el);

        $timeout(function() {
           $scope.shareAsAttachment('Notebook attached.', 'USPTO Grants notebook: ' + $scope.notebook.name, body[0].outerHTML, 'notebook.html');
        }, 1);

    };

    $scope.load = function(){
        $scope.notebookId = $stateParams.id;
        $scope.notebook = NotebookService.getNotebook($stateParams.id);
        $scope.notebookList = NotebookService.notebookNames();
        $scope.briefcase = NotebookService.load();
    };

    $scope.load();
}]);
