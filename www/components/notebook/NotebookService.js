/**
* NotebookService, maintains the storage and retrieval of bookmarks.
*/
app.service('NotebookService', ['$filter', '$rootScope', function($filter, $rootScope){

    /*
    * Briefcase holds notebooks, and notebooks contain bookmarks, tags and text.
    */

    this.briefcase = {};

    this.preliminaryBookmark = {}; // temporary holding for bookmarking process, access between views.

    this.generateId = function(notebookName){
        var dateEpoch = new Date().getTime();
        return notebookName + "-" + dateEpoch;
    };

    this.notebookCount = function(){
        return Object.keys(this.briefcase).length;
    };

    this.recentViewed = function(){
       return $filter('orderObjectBy')(this.briefcase, 'viewed', true)[0].id;
    };

    this.recentModifiedId = function(){
         return $filter('orderObjectBy')(this.briefcase, 'modified', true)[0].id;
    };

    this.recentModifiedName = function(){
         var first = $filter('orderObjectBy')(this.briefcase, 'modified', true)[0];
         if (first && typeof first.name !== 'undefined'){
           return first.name;
         }
         return "default";
    };

    this.newNotebook = function(notebookName){
        var dateEpoch = new Date().getTime();
        var notebookId = notebookName + "-" + dateEpoch;

        var notebook = {
            'name': notebookName,
            'id': notebookId,
            'created': dateEpoch,
            'modified': dateEpoch,
            'viewed': 0,
            'bookmarks': [],
            'note': ""
        };

        this.briefcase[notebookId] = notebook;
        this.persist();

        $rootScope.$broadcast("BriefcaseUpdated");
        return notebookId;
    };

    this.saveNotebook = function(notebookId, notebook){
        this.briefcase[notebookId] = notebook;
        this.persist();
    };

    this.lookupNotebook = function(notebookName){
        this.load();
        for (var notebookid in this.briefcase){
            if (this.briefcase[notebookid].name === notebookName){
                return notebookid;
            }
        }
        return -1;
    };

    this.getNotebook = function(notebookId){
        return this.briefcase[notebookId];
    };

    this.getNotebookId = function(notebookName){
        var notebookid = this.lookupNotebook(notebookName);
        if (notebookid === -1){
            notebookid = this.newNotebook(notebookName);
        }
        return notebookid;
    };

    this.notebookNames = function(){
        var names = [];
        for (var notebookid in this.briefcase){
            var name = {
                'name': this.briefcase[notebookid].name,
                'id': notebookid,
                'modified': this.briefcase[notebookid].modified,
                'viewed': this.briefcase[notebookid].viewed
            };
            names.push( name );
        }
        // TODO default sort by viewed and/or modified.
        return names;
    };

    this.deleteNotebook = function(notebookId){
        delete this.briefcase[notebookId];
        if (this.notebookCount() === 0){
            this.newNotebook('default');
        }
        this.persist();
        $rootScope.$broadcast("BriefcaseUpdated");
    };

    this.renameNotebook = function(notebookId, newName){
        this.briefcase[notebookId].name = newName;
        this.briefcase[notebookId].modified = new Date().getTime();
        this.briefcase.recentModified = notebookId;
        this.persist();
        $rootScope.$broadcast("BriefcaseUpdated");
    };

    this.mergeNotebook = function(notebookId, notebookId2){
        this.briefcase[notebookId].bookmarks = this.briefcase[notebookId].bookmarks.concat(notebookId2);
        this.briefcase[notebookId].modified = new Date().getTime();
        this.persist();
        $rootScope.$broadcast("BriefcaseUpdated");
    };

    this.deleteBookmarks = function(notebookId, bookmarkIdList){
        console.log(bookmarkIdList);
        for (var j = 0; j < bookmarkIdList.length; j++){
             console.log(bookmarkIdList[j]);
             this.deleteBookmark(notebookId, bookmarkIdList[j]);
        }
    };

    this.deleteBookmark = function(notebookId, bookmarkId){
        var bookmarkIdx = this.indexOfBookmark(notebookId, bookmarkId);
        console.log("bookmark location to delete: ");
        console.log(bookmarkIdx);
        if (bookmarkIdx !== -1){
            this.briefcase[notebookId].bookmarks.splice(bookmarkIdx, 1);
        }

        /*
        var loc = this.briefcase[notebookId].bookmarks.indexOf(item);
        if (loc != -1){
            this.briefcase[notebookId].bookmarks.splice(loc, 1);
        }
        */

        this.briefcase[notebookId].modified = new Date().getTime();
        this.persist();
    };

    this.moveBookmark = function(notebookId, item, fromIndex, toIndex) {
        this.briefcase[notebookId].bookmarks.splice(fromIndex, 1);
        this.briefcase[notebookId].bookmarks.splice(toIndex, 0, item);
        this.briefcase[notebookId].modified = new Date().getTime();
        this.persist();
    };

    this.transferBookmark = function(bookmarkId, fromNotebookId, toNotebookId){
        var bookmark = this.getBookmark(fromNotebookId, bookmarkId);
        if (bookmark){
            this.addBookmark(toNotebookId, bookmark);
            this.deleteBookmark(fromNotebookId, bookmark);
            this.persist();
        }
    };

    this.transferUpdateBookmark = function(bookmark, fromNotebookId, toNotebookId){
        this.addBookmark(toNotebookId, bookmark);
        this.deleteBookmark(fromNotebookId, bookmark);
        this.persist();
    };

    this.addBookmark = function(notebookId, bookmark){
        /*
        var bookmark = {
            'id': itemId,
            'type': itemType,
            'subtype': itemSubtype,
            'name': itemName,
            'open': open
        }
        */

        var bookmarkIdx = this.indexOfBookmark(notebookId, bookmark.id);
        if ( bookmarkIdx === -1){
            this.briefcase[notebookId].bookmarks.push(bookmark);
        } else {
            this.briefcase[notebookId].bookmarks[bookmarkIdx] = bookmark;
        }

        this.briefcase[notebookId].modified = new Date().getTime();
        this.persist();
    };

    this.indexOfBookmark = function(notebookId, bookmarkId){
        for (var i = 0; i < this.briefcase[notebookId].bookmarks.length; i++){
            if (this.briefcase[notebookId].bookmarks[i].id === bookmarkId){
                return i;
            }
        }
        return -1;
    };

    this.getAllBookmarksOfType = function(type){
        var items = [];

        for (var notebookId in this.briefcase){
            for (var i = 0; i < this.briefcase[notebookId].bookmarks.length; i++){
                if ( this.briefcase[notebookId].bookmarks[i].type === type){
                    items.push( this.briefcase[notebookId].bookmarks[i] );
                }
            }
        }

        // dedupe items by id.
        for (var m = 0; m < items.length; m++){
             for (var k = m + 1; k < items.length; k++){
                if (items[m].id === items[k].id){
                    //console.log("dedupe: " + items[k]);
                    items[k] = '';
                }
            }
        }

        return items;
    };

    this.getBookmark = function(notebookId, bookmarkId){
        for (var i = 0; i < this.briefcase[notebookId].bookmarks.length; i++){
            if ( this.briefcase[notebookId].bookmarks[i].id === bookmarkId){
                return this.briefcase[notebookId].bookmarks[i];
            }
        }
        console.log("Failed to find bookmark" + notebookId + ":" + bookmarkId);
    };

    this.addNote = function(notebookId, noteText){
        if (noteText !== 'null'){
           this.briefcase[notebookId].note = noteText;
           this.currentNotebookId = notebookId;
           this.persist();
       }
    };

    this.persist = function(){
        window.localStorage.persistedBooks = angular.toJson( this.briefcase );
    };

    this.load = function(){
      var persistedBooks = window.localStorage.persistedBooks;
      if (persistedBooks){
        this.briefcase = angular.fromJson(persistedBooks);
      } else {
        this.briefcase = {};
        this.newNotebook('default');
      }
      return this.briefcase;
    };
}]);
