
var appModule = angular.module('starter');

appModule.factory('FileService', function ($window) {
    
    var USER_IMAGE = 'user_img';
    var USER_IMAGE_BASE64 = 'user_img_base64';

    function getUserImg() {
        
        var img = null;
        var img =  window.localStorage.getItem(USER_IMAGE);

        /* Verifica se o localStorage já está preenchido, caso não esteja é realizado um GET para buscar no WS a foto gravada. */
        if (!img) {            
            // busca
        } 

        if(img == null){
            return '';
        }

        return cordova.file.dataDirectory + img;

    };

    function getFileContentAsBase64(path, callback) {
        window.resolveLocalFileSystemURL(path, gotFile, fail);

        function fail(e) {
            console.log('Cannot found requested file', e);
        }

        function gotFile(fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    var content = this.result;
                    callback(content);
                };
                // The most important point, use the readAsDatURL Method from the file plugin
                reader.readAsDataURL(file);
            });
        }
    }

    function addImage(img, realPath) {
        getFileContentAsBase64(realPath, function (base64Image) {
            localStorage.setItem(USER_IMAGE_BASE64,base64Image);
        });
        console.log('img',img);

        window.localStorage.setItem(USER_IMAGE, img);
    }

    return {
        storageImage: addImage,
        getUserImg: getUserImg,
        getFileContentAsBase64: getFileContentAsBase64
    }


});

appModule.factory('ImageService', function ($cordovaCamera, FileService, $q, $cordovaFile, $cordovaDevice) {

    function optionsForType(type) {
        var source;
        console.log('type opt service', type);
        switch (type) {
            case 0:
                source = Camera.PictureSourceType.PHOTOLIBRARY;
                break;

            case 1:
                source = Camera.PictureSourceType.CAMERA;
                break;
        }
        return {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: source,
            saveToPhotoAlbum: false
        }
    };

    function saveMedia(sourceType) {

        return $q(function (resolve, reject) {
            var options = optionsForType(sourceType);

            $cordovaCamera.getPicture(options).then(function (imagePath) {

                var currentName = imagePath.replace(/^.*[\\\/]/, '');

                var d = new Date(),
                    n = d.getTime(),
                    newFileName = n + ".jpg";

                if ($cordovaDevice.getPlatform() == 'Android' && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
                    window.FilePath.resolveNativePath(imagePath, function (entry) {
                        window.resolveLocalFileSystemURL(entry, success, fail);
                        function fail(e) {
                            console.error('Error: ', e);
                        }

                        function success(fileEntry) {
                            var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
                            // Only copy because of access rights
                            console.log('namePath',namePath);
                            console.log('fileEntry.name',fileEntry.name);
                            console.log('cordova.file.dataDirectory',cordova.file.dataDirectory);
                            console.log('newFileName',newFileName);
                            $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName).then(function (success) {
                                FileService.storageImage(newFileName, (cordova.file.dataDirectory + newFileName));


                                // FileService.getFileContentAsBase64((cordova.file.dataDirectory + newFileName),function(base64Image){
                                //     //window.open(base64Image);
                                //     console.log('entrou no file content as base 64 ');
                                //     localStorage.setItem("imgData", base64Image);
                                //     console.log(base64Image); 
                                //   });

                                resolve({
                                    urlFile: newFileName
                                });
                            }, function (error) {
                                // $scope.showAlert('Error', error.exception);
                                reject();
                                console.log('error', error);
                            });
                        };
                    }
                    );
                } else {

                    var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);

                    $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(function (success) {
                        FileService.storageImage(newFileName);
                        resolve({
                            urlFile: newFileName
                        });
                    }, function (error) {
                        console.log('error else', error);
                        reject();
                    });
                }
            },
                function (err) {
                    // Not always an error, maybe cancel was pressed...
                })

        });
    }

    return {
        handleMediaDialog: saveMedia
    }

});