app.controller("BriefcaseController", ['$scope', '$state', 'NotebookService', function($scope, $state, NotebookService){

    $scope.newNotebook = false;
    $scope.form = {};
    $scope.notebookCount = 0;

    $scope.toggleNewNotebook = function(){
        $scope.newNotebook = !$scope.newNotebook;
    };

    $scope.submitNewNotebook = function(){
        $state.go("bookmark.item", {'notebook': $scope.form.notebook}, {'reload': true, 'inherit': false});
    };

    $scope.load = function(){
        $scope.briefcase = NotebookService.load();
        $scope.notebookCount = NotebookService.notebookCount();
    };

    $scope.$on('BriefcaseUpdated', $scope.load);

    $scope.load();
}]);
