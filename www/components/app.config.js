
var app = angular.module('app', ['ionic', 'ngResource', 'ngCordova']);

// app.constant('RestURL', 'http://edhapi.uspto.gov/edh-rest/rest/grants');
app.constant('RestURL', 'http://www.patentsview.org/api/latest/patents/query');

app.constant('SORT_FIELDS', [
    {'label': 'Title (asc)', 'sortTerm': 'patent_title,asc'},
    {'label': 'Title (desc)', 'sortTerm': 'patent_title,desc'},
    {'label': 'Date (asc)', 'sortTerm': 'patent_date,asc'},
    {'label': 'Date (desc)', 'sortTerm': 'patent_date,desc'},
    {'label': 'relevance', 'sortTerm': ''}
]);

app.constant('SEARCH_RESULT_FIELDS',[
    "patent_number", "patent_date", "app_date", "patent_title", "patent_kind", "app_country", "uspc_mainclass_title", "uspc_mainclass_id", "inventor_first_name", "inventor_last_name", "inventor_city", "inventor_state"
    , "inventor_country", "assignee_first_name", "assignee_last_name", "assignee_city", "assignee_state", "assignee_country"
]);

app.constant('DETAIL_RESULT_FIELDS',[
    "patent_number", "patent_date", "app_date", "patent_title", "patent_kind", "app_country", "uspc_mainclass_title", "uspc_mainclass_id", "inventor_first_name", "inventor_last_name", "inventor_city", "inventor_state"
    , "inventor_country", "assignee_id", "assignee_first_name", "assignee_last_name", "assignee_organization", "assignee_city", "assignee_state", "assignee_country"
]);

app.constant('FIELDS', {
    'id': [
        {
            'displayName': 'id',
            'shortName': 'ID',
            'searchField': 'patent_number',
            'type': 'text',
            'required': true,
            'placeholder': 'example: 012345678',
            'minlength': 7,
            'maxlength': 9
        }
    ],
    'title': [
        {
            'displayName': 'title',
            'shortName': 'T',
            'searchField': 'patent_title',
            'type': 'text',
            'required': true,
            'minlength': 3,
            'maxlength': 60
        }
    ],
    'date': [
        {
            'displayName': 'Publication Date',
            'shortName': 'D',
            'searchField': 'patent_date',
            'type': 'date',
            'required': false,
            'placeholder': 'yyyy-MM-dd',
            'min': '1920-01-01',
            'max': '2016-01-01'
        },
        {
            'displayName': 'Application Date',
            'shortName': 'AD',
            'searchField': 'app_date',
            'type': 'date',
            'required': false,
            'placeholder': 'yyyy-MM-dd',
            'min': '1920-01-01',
            'max': '2016-01-01'
        },
        {
            'displayName': 'Year',
            'shortName': 'YR',
            'searchField': 'patent_year',
            'type': 'number',
            'required': false,
            'placeholder': 'format: YYYY',
            'min': '1920',
            'max': '2016'
        }
    ],
    'inventor': [
        {
            'displayName': 'First Name',
            'shortName': 'FN',
            'searchField': 'inventor_first_name',
            'type': 'text',
            'required': false,
            'minlength': 3,
            'maxlength': 60
        },
        {
            'displayName': 'Last Name',
            'shortName': 'LN',
            'searchField': 'inventor_last_name',
            'type': 'text',
            'required': false,
            'minlength': 3,
            'maxlength': 60
        }
    ],
    'assignee': [
        {
            'displayName': 'First Name',
            'shortName': 'FN',
            'searchField': 'assignee_first_name',
            'type': 'text',
            'required': false,
            'minlength': 3,
            'maxlength': 60
        },
        {
            'displayName': 'Last Name',
            'shortName': 'LN',
            'searchField': 'assignee_last_name',
            'type': 'text',
            'required': false,
            'minlength': 3,
            'maxlength': 60
        }
        /*{
            'displayName': 'Org Name',
            'shortName': 'O',
            'searchField': 'assigneeOrgName',
            'type': 'text',
            'required': false,
            'minlength': 3,
            'maxlength': 60
        }
        */
    ]
});

app.config(['$stateProvider', '$urlRouterProvider', 'FIELDS', function($stateProvider, $urlRouterProvider, FIELDS) {

   var searchUrl = "/results/:clear?";
   for (var key in FIELDS){
        for (var subfield in FIELDS[key]){
            searchUrl = searchUrl + FIELDS[key][subfield].searchField + "&";
        }
   }
   searchUrl = searchUrl + 'detailedView&pageSize&pageNo&sort';
   //searchUrl = searchUrl.slice(0,-1);

  $stateProvider
    .state('home', {
      url: '/home',
      views: {
        "base": {
            templateUrl: "components/about/about.html"
        },
        "searchSide": {
            templateUrl: "components/search/searchmenu.html",
            controller: 'SearchMenuController'
        }
      }
    })
    .state('settings', {
      cache: false,
      url: '/settings',
      views: {
        "base": {
            templateUrl: "components/settings/settings.html",
            controller: 'SettingsController'
        },
        "searchSide": {
            templateUrl: "components/search/searchmenu.html",
            controller: 'SearchMenuController'
        }
      }
    })
    .state('search-view', {
        cache: false,
        url: "/search",
        views: {
            "searchSide": {
                templateUrl: "components/search/searchmenu.html",
                controller: 'SearchMenuController'
            }
        }
    })
    .state('search-field', {
        cache: false,
        url: "/search/:field",
        views: {
            "searchSide": {
                templateUrl: "components/search/search.html",
                controller: 'SearchController'
            }
        }
    })
    .state('patent-menu', {
        cache: false,
        url: "/menu",
        views: {
            "searchSide": {
                templateUrl: "components/patentViewer/patent-viewer-menu.html",
                controller: ['$scope', '$location', '$ionicScrollDelegate', '$ionicSideMenuDelegate', '$timeout', function($scope, $location, $ionicScrollDelegate, $ionicSideMenuDelegate, $timeout){
                      $scope.scrollTo = function(id) {
                           $ionicSideMenuDelegate.toggleRight();
                           $location.hash(id);
                           var delegate = $ionicScrollDelegate.$getByHandle('patentDoc');
                           delegate.anchorScroll(false);
                      };

                }]
            }
        }
    })
    .state('results', {
        cache: false,
        url: searchUrl, // url dynamicly generated from configuration.
        views: {
            "base": {
                templateUrl: "components/results/search-results.html",
                controller: 'SearchResultsController'
            },
            "searchSide": {
                templateUrl: "components/search/searchmenu.html",
                controller: 'SearchMenuController'
            }
        }
    })
    .state('document', {
      'abstract': true,
      url: '/document',
      views: {
        "base": {
            template: '<ion-nav-view></ion-nav-view>'
        },
        "searchSide": {
            templateUrl: "components/search/searchmenu.html",
            controller: 'SearchMenuController'
        }
      }
    })
    .state('document.id', {
        cache: false,
        url: "/:id?notebook",
        templateUrl: "components/document/document.html",
        controller: 'DocumentController'
    })
    .state('patent', {
        url: "/patent/:id",
        views: {
            "base": {
                templateUrl: "components/patentViewer/patent-viewer.html",
                controller: 'PatentViewer'
            },
            "searchSide": {
                templateUrl: "components/search/searchmenu.html",
                controller: 'SearchMenuController'
            }
        }
    })
    .state('bookmark', {
      'abstract': true,
      url: '/bookmark',
      views: {
        'modal': {
            template: '<ion-nav-view></ion-nav-view>'
        }
      }
    })
    .state('bookmark.item', {
      url: '/bookmark?notebook&edit',
      cache: false,
      onEnter: ['$rootScope', '$ionicModal', function($rootScope, $ionicModal) {
             $ionicModal.fromTemplateUrl('components/notebook/bookmark.html', {
                animation: 'slide-in-up',
                focusFirstInput: false,
                scope: $rootScope
             }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
             });
        }]
    })
    .state('library', {
        url: '/library',
        cache: false,
        views: {
            "base": {
                templateUrl: "components/library/library.html",
                controller: 'LibraryController'
            },
            "searchSide": {
                templateUrl: "components/search/searchmenu.html",
                controller: 'SearchMenuController'
            }
        }
    })
    .state('notebook', {
      'abstract': true,
      url: '/notebook',
      views: {
        'base': {
            template: '<ion-nav-view></ion-nav-view>'
        },
        "searchSide": {
            templateUrl: "components/search/searchmenu.html",
            controller: 'SearchMenuController'
        }
      }
    })
    .state('notebook.list', {
      url: '',
      cache: false,
      views: {
        'base@': {
            templateUrl: "components/notebook/briefcase.html",
            controller: 'BriefcaseController'
        }
      }
    })
    .state('notebook.id', {
      url: "/:id",
      cache: false,
      templateUrl: "components/notebook/notebook.html",
      controller: 'NotebookController'
    });

   $urlRouterProvider.otherwise("/home");
}]);

app.run(['$ionicPlatform', '$ionicPopup', function($ionicPlatform, $ionicPopup) {
    $ionicPlatform.ready(function() {

    /*
        if(window.cordova) {

        }
      */
        if (window.StatusBar) {
            window.StatusBar.styleDefault();
        }

        if (window.Connection) {
            if (navigator.connection.type === window.Connection.NONE) {
                $ionicPopup.confirm({
                    title: "Internet Disconnected",
                    content: "The internet is disconnected on your device."
                })
                .then(function(result) {
                    if (!result) {
                        ionic.Platform.exitApp();
                    }
                });
            }
        }

    });
}]);

/**
*  Shrinking Header, header in Patent View disappears when scrolling down.
*  https://github.com/driftyco/ionic-ion-header-shrink
*/
app.directive('headerShrink', function() {

 /*
  var fadeAmt;

  var shrink = function(header, content, amt, max) {
    amt = Math.min(max, amt);
    fadeAmt = 1 - amt / max;
    ionic.requestAnimationFrame(function() {
      header.style[ionic.CSS.TRANSFORM] = 'translate3d(0, -' + amt + 'px, 0)';
      for(var i = 0, j = header.children.length; i < j; i++) {
        header.children[i].style.opacity = fadeAmt;
      }
    });
  };
  */

  return {
    restrict: 'A',
    link: function($scope, $element) {
      //var starty = $scope.$eval($attr.headerShrink) || 0;
      //var shrinkAmt;
      //var amt;

      var y = 0;
      var prevY = 0;
      var scrollDelay = 0.4;

      var fadeAmt;

      var parent = ionic.DomUtil.getParentWithClass($element[0], 'menu-content');
      var headers = parent.getElementsByClassName('bar-header');
      var headerHeight = headers[0].offsetHeight;

      function onScroll(e) {
        if (typeof e.detail === 'undefined'){
            return;
        }
        
        var scrollTop = e.detail.scrollTop;

        if (scrollTop >= 0) {
          y = Math.min(headerHeight / scrollDelay, Math.max(0, y + scrollTop - prevY));
        } else {
          y = 0;
        }

        ionic.requestAnimationFrame(function() {
          fadeAmt = 1 - (y / headerHeight);

          for (var h = 0; h < headers.length; h++) {
            headers[h].style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + -y + 'px, 0)';
            for (var i = 0, j = headers[h].children.length; i < j; i++) {
              headers[h].children[i].style.opacity = fadeAmt;
            }
          }
          $element[0].style.top = Math.max(headerHeight - y, 0) + 'px';
        });

        prevY = scrollTop;
      }

      $element.bind('scroll', onScroll);
    }
  };
});

