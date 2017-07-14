app.controller("BookmarkController", ['$scope', '$stateParams', 'NotebookService', function($scope, $stateParams, NotebookService){

    $scope.form = {'notebookName': ''};

    $scope.documentTags = ['unread', 'read', 'follow-up', 'done', 'similar', 'different', 'informative', 'like', 'dislike'];

    $scope.defaultTags = ['follow-up', 'done'];

    $scope.toggleNewNotebook = function(bool){
        //$scope.newNotebook = !$scope.newNotebook;
        $scope.newNotebook = bool;
    };

    $scope.toggleSelectNotebook = function(bool){
        //$scope.selectNotebook = !$scope.selectNotebook;
        $scope.selectNotebook = bool;
    };

    $scope.selectedNotebook = function(notebook){
        $scope.notebook = notebook.name;
        $scope.toggleSelectNotebook(false);
    };

    $scope.addNotebook = function(){
        $scope.notebook = $scope.form.notebookName;
        $scope.toggleNewNotebook(false);
        $scope.toggleSelectNotebook(false);
    };

    $scope.load = function(){
        $scope.notebook = $stateParams.notebook;
        $scope.originalNotebook = $scope.notebook;
        $scope.bookmarkAction = "Add";
        $scope.selectNotebook = false;

        $scope.briefcase = NotebookService.load();

        if (typeof $stateParams.edit !== 'undefined'){
            $scope.edit = true;
            $scope.bookmarkAction = "Edit";
        }

        $scope.data = NotebookService.preliminaryBookmark;
        if (!$scope.notebook){
            $scope.notebook = NotebookService.recentModifiedName();
        }
    };

    $scope.save = function(){
        NotebookService.preliminaryBookmark = {};

        if ($scope.edit && ($scope.notebook !== $scope.originalNotebook)){
            var fromNotebookId = NotebookService.getNotebookId($scope.originalNotebook);
            var toNotebookId = NotebookService.getNotebookId($scope.notebook);
            NotebookService.transferUpdateBookmark($scope.data, fromNotebookId, toNotebookId);
        } else {
            var notebookId = NotebookService.getNotebookId($scope.notebook);
            NotebookService.addBookmark(notebookId, $scope.data);
        }
    };

    $scope.load();
}]);
