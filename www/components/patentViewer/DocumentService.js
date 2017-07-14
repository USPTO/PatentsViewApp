/**
* DocumentService facilitates fetching and reading of documents.
*/
app.service('DocumentService', ['PatentDoc', '$q', '$timeout', '$http', '$cordovaFile', '$cordovaFileTransfer', '$cordovaZip', 'LibraryService', 'RestURL', function(PatentDoc, $q, $timeout, $http, $cordovaFile, $cordovaFileTransfer, $cordovaZip, LibraryService, RestURL){

    this.getDocument = function(patentDocId){
        this.lastDocumentId = patentDocId;
        return PatentDoc.get({'patentDocId': patentDocId, 'detailedView': true}, function(data, SearchService) {
            SearchService.lastDocument = data;
            return data;
        });
    };

    this.getPatentDocDownloadURL = function(format, patentDocIdList){
        //var url = "http://edhapi.uspto.gov/edh-rest/rest/grants/RedbookWithImages/data?patentDocIds=" + id;
        var url = RestURL + '/' + format + '/data?' + 'patentDocIds=' + patentDocIdList.join('%2C');
        return url;
    };

    $cordovaFile.recursiveMove = function(dir, todir, errorCallback){
        window.resolveLocalFileSystemURL(dir, function(dirEntry){
            var dirReader = dirEntry.createReader();

            var readEntries = function() {

                dirReader.readEntries( function(entries){

                    for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];
                        if (entry.isFile){
                                var entryDir = cordova.file.cacheDirectory + entry.fullPath.substring(1, entry.fullPath.lastIndexOf('/') + 1);

                                $cordovaFile.moveFile(entryDir, entry.name, todir).then( function(){
                                    var id = entry.name.substring(2, entry.name.lastIndexOf('-'));
                                    LibraryService.addDocument(id, todir, entry.name);
                                    LibraryService.persist();
                                }, function(error){
                                    console.log("Failed move " + entryDir + " , " + entry.name + " to " + todir);
                                    errorCallback(error);
                                });

                        } else if (entry.isDirectory){
                            $cordovaFile.recursiveMove(dir + "/" + entry.name, todir);
                        }
                    }

                    if (entries.length) {
                         readEntries();   // Call the reader.readEntries() until no more results are returned.
                    }
                });
            };

            readEntries();
        });
    };

    this.downloadAndStage = function(patentDocIdList){
           var q = $q.defer();

           var url = this.getPatentDocDownloadURL('RedbookWithImages', patentDocIdList);
           var downloadDest = cordova.file.cacheDirectory + 'download.zip';
           var zipDest = cordova.file.cacheDirectory + "unzip/";
           var grantDocs = cordova.file.dataDirectory + "grants/";

           $cordovaFile.removeRecursively( cordova.file.cacheDirectory, 'unzip');
           $cordovaFile.createDir(cordova.file.dataDirectory, "grants", false); // mkdir destination directory.

           var ft = $cordovaFileTransfer.download(url, downloadDest, {}, true).then(
                function(){
                    $cordovaZip.unzip(downloadDest, zipDest).then(
                        function(){
                            console.log( 'Unzip success, moveing docs' );
                            $cordovaFile.recursiveMove(zipDest, grantDocs, q.reject);
                            $timeout( function(){
                                q.resolve(); // FIXME not exactly when finished, due to recursiveMove being async.
                            }, 5000);
                        }, function(error){
                            console.log( 'Unzip Failed!!' );
                            q.reject(error);
                        },
                        q.notify // zip progress callback.
                    );
                },
                function(error) {
                        console.log("Download Failed!!");
                        q.reject(error);
                },
                q.notify // download progress callback.
           );

           q.promise.abort = function(){
                ft.abort();
           };

           return q.promise;
   };

   this.readLocalPatentDoc = function(patentId){
        var q = $q.defer();
        var cache = cordova.file.cacheDirectory + 'unzip_read/';

        $cordovaFile.createDir(cordova.file.cacheDirectory, 'unzip_read', true); // mkdir destination directory.

        var zipfileObj;
        if ( LibraryService.hasDocumentId(patentId) ){
            zipfileObj = LibraryService.getFile(patentId);
        } else {
            q.reject("Could not find patent file locally: " + patentId);
        }

        $cordovaZip.unzip(zipfileObj.fullPath, cache).then(
            function(){
                console.log( 'Unzip success, reading doc' );
                var prefix = zipfileObj.name.substring(0, zipfileObj.name.length - 4);
                console.log("prefix: " + prefix);
                $cordovaFile.readAsText(cache + prefix, prefix + '.XML').then(
                  function(data){
                    q.resolve(data);
                  }, function(error){
                    console.log("failed to read file.");
                    q.reject(error);
                  });
            }, function(error){
                console.log( 'Unzip Failed!!' );
                q.reject(error);
            },
            q.notify // zip progress callback.
        );

        return q.promise;
   };

   this.removeDocument = function(id){
        var file = LibraryService.getFile(id);

        $cordovaFile.removeFile(file.parent, file.name).then( function(){
            LibraryService.removeDocument(id);
            LibraryService.persist();
        }, function(){
             console.log("Failed to remove file by id: " + id, file);
        });
   };

   this.readTestPatentDocXML = function(xmlFile){
        var q = $q.defer();
        $http.get('testdocs/' + xmlFile).success(function(data) {
            q.resolve(data);
        }).error(function(data, status){
            q.reject(status);
        });
        return q.promise;
   };

}]);
