app.filter('shortName', ['FIELDS', function(FIELDS){
    return function(searchField){
        for (var field in FIELDS){
            for (var subfield in FIELDS[field]){
                if (FIELDS[field][subfield].searchField === searchField){
                    return FIELDS[field][subfield].shortName;
                }
            }
        }
    };
}]);

app.factory('PatentDoc', ['$resource', 'RestURL', function($resource, RestURL){
    return $resource(RestURL, {}, {
        query: {method: 'GET', params: {patentDocId: 'patentDoc'}, isArray: true}
    });
}]);

/**
* SearchService maintains/builds the search object and preforms search.
*/
app.service('SearchService', ['$rootScope', '$state', 'PatentDoc', 'FIELDS', '$http', 'RestURL', 'SEARCH_RESULT_FIELDS', function($rootScope, $state, PatentDoc, FIELDS, $http, RestURL, SEARCH_RESULT_FIELDS){

    this.newQuery = {
       // "inventor": { 'inventorLastName': ['feldman', 'smith', 'liu'] }
    };

    this.lastQuery = {};
    this.searchResults = {};

    this.lastDocument = {};
    this.lastDocumentId = 0;
    this.sortBy = {};
    this.viewedDocuments = [];

    this.generateId = function(){
        var dateEpoch = new Date().getTime();
        var randomnumber = Math.floor(Math.random() * 1000001);
        return dateEpoch + "-" + randomnumber;
    };

    this.appendSearchObj = function(parentField, searchObj){
        if (typeof this.newQuery[parentField] === 'undefined'){
             this.newQuery[parentField] = {};
        }

        for (var prop in searchObj) {
            if (typeof searchObj[prop] === 'undefined' || searchObj[prop] === null){
                continue;
            }

            if (prop === 'datePublished'){
                searchObj[prop] = (searchObj[prop].getMonth() + 1) + '/' + searchObj[prop].getDate() + '/' + searchObj[prop].getFullYear();
            }

            if (typeof this.newQuery[parentField][prop] === 'undefined'){
                this.newQuery[parentField][prop] = [];
            }

            this.newQuery[parentField][prop].push( searchObj[prop] );
        }
    };

    this.removeSearchTerm = function(searchTerm){
        var ar = searchTerm.split(":");
        var parentField = ar[0];
        var fieldName = ar[1];
        var fieldValue = ar[2];
        var fieldIndex = this.newQuery[parentField][fieldName].indexOf(fieldValue);

        this.newQuery[parentField][fieldName].splice(fieldIndex, 1);

        if ( this.newQuery[parentField][fieldName].length === 0){
            delete this.newQuery[parentField][fieldName];
        }

        if ( Object.keys(this.newQuery[parentField]).length === 0){
            delete this.newQuery[parentField];
        }
    };

    this.searchTermCount = function(){
        var count = 0;
        for (var parentField in this.newQuery){
            count = count + Object.keys(this.newQuery[parentField]).length;
        }
        return count;
    };

    this.buildQuery = function(){
        var query = {};
        var termCount = 0;
        for (var parentName in this.newQuery){
            for (var key in this.newQuery[parentName]){
                query[key] = this.newQuery[parentName][key];
                termCount++;
            }
        }

        if (typeof this.sortBy.sortTerm !== 'undefined' && termCount > 0){
            query.sort = this.sortBy.sortTerm;
        }

        return query;
    };

    this.rebuildNewQuery = function(queryObj){
        var searchObj;

        for (var searchField in queryObj){
             if (typeof queryObj[searchField] !== 'undefined'){
                 var field = this.searchFields[searchField];
                 if (typeof field !== 'undefined'){
                     if (typeof queryObj[searchField] === 'string'){
                        searchObj = {};
                        searchObj[searchField] = queryObj[searchField];
                        this.appendSearchObj(field.parent, searchObj);
                     } else {
                        for (var value in queryObj[searchField]){
                            searchObj = {};
                            searchObj[searchField] = queryObj[searchField][value];
                            this.appendSearchObj(field.parent, searchObj);
                        }
                    }
                }
            }
        }
    };

    this.fetchSearchFields = function(){
        var searchFields = {};
        for (var field in FIELDS){
            for (var subfield in FIELDS[field]){
                if (FIELDS[field][subfield].searchField !== 'undefined'){
                    searchFields[ FIELDS[field][subfield].searchField ] = {'parent': field, 'displayName': FIELDS[field][subfield].displayName };
                }
            }
        }
        return searchFields;
    };
    this.searchFields = this.fetchSearchFields();

    this.previousQueryFieldsOnly = function(){

        var prevousQueryFields = {};
        for (var key in this.lastQuery){
            if ( this.lastQuery[key] !== 'undefined' && this.searchFields[key]){
                prevousQueryFields[key] = {'value': this.lastQuery[key], 'field': this.searchFields[key] };
            }
        }
        console.log(prevousQueryFields);
        return prevousQueryFields;
    };

    this.queryClean = function(queryObj){
        //delete all the undefined key values.
        for (var value in queryObj){
            if (typeof queryObj[value] === 'undefined'){
                delete queryObj[value];
            }
        }

        return queryObj;
    };

    this.adaptResponse = function(patentsViewData){
        "use strict";
        var newResponse = {
            totalCount : patentsViewData.total_patent_count,
            pageNo : '',
            pageSize : patentsViewData.count
        };

        var edhPatentCollection = [];
        for(let patent of patentsViewData.patents){
            var newPatent  = {};
            newPatent.patentDocId = patent.patent_number;
            newPatent.inventionTitle = patent.patent_title;
            newPatent.dateProduced = patent.app_date;
            newPatent.datePublished = patent.patent_date;
            newPatent.mainClassificationCode = patent.uspcs && patent.uspcs.length > 0 ? patent.uspcs[0].uspc_mainclass_title: '';
            newPatent.patentInventors = [];
            newPatent.patentApplicants = [];
            newPatent.patentAssignees = [];
            for(let inventor of patent.inventors){
                newPatent.patentInventors.push({
                    firstName: inventor.inventor_first_name,     
                    lastName: inventor.inventor_last_name,
                    address: {
                        city: inventor.inventor_city,
                        state: inventor.inventor_state,
                        country: inventor.inventor_country
                    }
                })
            }
            for(let assignee of patent.assignees){
                newPatent.patentAssignees.push({
                    firstName: assignee.assignee_first_name,     
                    lastName: assignee.assignee_last_name,
                    address: {
                        city: assignee.assignee_city,
                        state: assignee.assignee_state,
                        country: assignee.assignee_country
                    }
                })
            }            
            edhPatentCollection.push(newPatent);
        }
        newResponse.edhPatentCollection = edhPatentCollection;
        return newResponse;
    }

    this.search = function(queryObj){
        $rootScope.$broadcast("SearchStarted");

        this.queryClean(queryObj);

        if (Object.keys(queryObj).length < 2){ // handle empty search direct from user.
            console.log("Ignoring Empty Search");
            this.searchResults = {pageSize: 0, pageNumber: 0, totalCount: 0, edhPatentCollection: []};
            this.newQuery = {};
            $rootScope.$broadcast("SearchComplete");
            return;
        }
        if (Object.keys(this.newQuery).length < 1){ // rebuild search from url.
            this.rebuildNewQuery(queryObj);
            // Still empty, return no results.
            if (Object.keys(this.newQuery).length < 1){
                this.searchResults = {pageSize: 0, pageNumber: 0, totalCount: 0, edhPatentCollection: []};
                $rootScope.$broadcast("SearchComplete");
                return;
            }
        }

        queryObj.pageSize = typeof queryObj.pageSize !== 'undefined' ? queryObj.pageSize : 10;
        queryObj.pageNo = typeof queryObj.pageNo !== 'undefined' ? queryObj.pageNo : 1;
        queryObj.detailedView = typeof queryObj.detailedView !== 'undefined' ? queryObj.detailedView : false;

        this.lastQuery = queryObj;

        var searchOptions = {
            page: queryObj.pageNo,
            per_page: queryObj.pageSize,
        }
        //pageSize, pageNo, clear, detailedView
        delete queryObj['pageSize'];
        delete queryObj['pageNo'];
        delete queryObj['clear'];
        delete queryObj['detailedView'];

        var searchQuery = {"_and": []};
        for(var key in queryObj){
            var field = {};
            field[key] = queryObj[key];
            searchQuery["_and"].push(field);
        }

        var searchUrl = RestURL+"?q="+JSON.stringify(searchQuery)+"&o="+JSON.stringify(searchOptions)+"&f="+JSON.stringify(SEARCH_RESULT_FIELDS);

        var _this = this;
        $http.get(searchUrl).then(function(response){
            response.data.pageNumber = searchOptions.page;
            _this.searchResults = response.data; 
            $rootScope.$broadcast("SearchComplete");
        }, function(response){
            if (error.status === 0){
                error.statusText = 'Unspecified Network Error';
            }
            $rootScope.$broadcast("SearchFailed", {'code': error.status, 'text': error.statusText}); // connection error.
        });

        /*
        this.searchResults = PatentDoc.get(queryObj, function(data, SearchService){
            SearchService.searchResults = data;
            $rootScope.$broadcast("SearchComplete");
        },
        function(error){
            if (error.status === 0){
                error.statusText = 'Unspecified Network Error';
            }
            $rootScope.$broadcast("SearchFailed", {'code': error.status, 'text': error.statusText}); // connection error.
        });*/
    };

}]);

