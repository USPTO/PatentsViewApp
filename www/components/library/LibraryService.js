/**
* LibraryService maintains a registry of document state and metadata; which documents have been downloaded and are available.
*/
app.service('LibraryService', [ function(){

    this.library = {};

    this.addDocument = function(id, dirname, filename){
        var doc = {
          'id': id,
          'date': new Date().getTime(),
          'name': filename,
          'parent': dirname,
          'fullPath': dirname + '/' + filename
        };

        this.library[id] = doc;
    };

    this.deleteDocument = function(id){
        delete this.library[id];
    };

    this.getFile = function(id){
        if ( id in this.library ){
            return this.library[ id ];
        } else {
            return -1;
        }
    };

    this.getDocumentId = function(filename){
        for (var docId in this.library){
            if ( this.library[ docId ].name === filename){
                return docId;
            }
        }
        return -1;
    };

    this.hasDocumentId = function(id){
        return (this.getFile(id) !== -1);
    };

    this.hasDocumentFile = function(file){
        return (this.getDocumentId(file) !== -1);
    };

    this.persist = function(){
        window.localStorage.library = angular.toJson( this.library );
    };

    this.load = function(){
      var persisted = window.localStorage.library;
      if (persisted){
        this.library = angular.fromJson(persisted);
      } else {
        this.library = {};
      }
      console.log(this.library);
      return this.library;
    };

    this.load();

}]);
