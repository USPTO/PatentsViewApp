app.service('SettingsService', [ function(){

    this.settings = {font: "2", openResult: "Overview", dayMode: true, externalPdfViewer: false};

    this.persist = function(){
        console.log("persist");
        console.log(this.settings);
        window.localStorage.settings = angular.toJson( this.settings );
    };

    this.load = function(){
      var persisted = window.localStorage.settings;
      if (persisted){
        this.settings = angular.fromJson(persisted);
      }
      return this.settings;
    };
}]);
