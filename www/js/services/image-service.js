var appModule = angular.module('starter');

appModule.factory('ImageService',
    function ($cordovaCamera, FileService, $q, $cordovaFile, $cordovaDevice, $ionicActionSheet, $cordovaFileTransfer, URL_REST, $window) {

        function optionsForType(type) {
            var source;

            switch (type) {
                case 0:
                    source = Camera.PictureSourceType.PHOTOLIBRARY;
                    break;

                case 1:
                    source = Camera.PictureSourceType.CAMERA;
                    break;
            }
            return {
                // allowEdit : true, // this property resizes the image, but when inserted, the selection of photos does not match the prototype established
                quality: 100,
                sourceType: source,
                saveToPhotoAlbum: true,
                correctOrientation: true,
                destinationType: Camera.DestinationType.FILE_URI,
            }
        };

        function saveMedia(sourceType) {
            return $q(function (resolve, reject) {
                var options = optionsForType(sourceType);
                var platform = $cordovaDevice.getPlatform();

                $cordovaCamera.getPicture(options)
                .then(function (imagePath) {

                    var d = new Date(), n = d.getTime(), newFileName = n + ".jpg";

                    switch (platform) {
                        case 'Android':

                            window.FilePath.resolveNativePath(imagePath, function (entry) {
                                window.resolveLocalFileSystemURL(entry, success, fail);
                                function fail(e) {
                                    console.error('Error: ', e);
                                }
                                function success(fileEntry) {
                                    var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
                                    if (sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
                                        $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName)
                                            .then(function (success) {
                                                $window.localStorage.setItem('user_img', newFileName);
                                                resolve({
                                                    urlFile: newFileName
                                                });
                                            })
                                            .catch(function (errorCopyFile) {
                                                console.log('errorCopyFile', errorCopyFile);
                                                reject();
                                            });
                                    } else {
                                        $cordovaFile.moveFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName)
                                            .then(function (success) {
                                                $window.localStorage.setItem('user_img', newFileName);
                                                resolve({
                                                    urlFile: newFileName
                                                });
                                            })
                                            .catch(function (errorMoveFile) {
                                                console.log('errorMoveFile', errorMoveFile);
                                                reject();
                                            });
                                    }
                                };
                            });


                            break;

                        case 'iOS':

                            var currentName = imagePath;//.replace(/^.*[\\\/]/, '');

                            var namePath = currentName.substr(0, currentName.lastIndexOf('/') + 1);
                            
                            if (sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
                                $cordovaFile.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName)
                                .then(function (success) {
                                    console.log('entrou no then copyFile');
                                    $window.localStorage.setItem('user_img', newFileName);
                                    resolve({
                                            urlFile: newFileName
                                    });
                                })
                                .catch(function(errorCopyFile){
                                    console.log('errorCopyFile',errorCopyFile);
                                    reject();
                                });

                            }else{
                                $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName)
                                .then(function (success) {
                                    $window.localStorage.setItem('user_img', newFileName);
                                    resolve({
                                        urlFile: newFileName
                                    });
                                })
                                .catch(function (errorMoveFile) {
                                    console.log('errorMoveFile', errorMoveFile);
                                    reject();
                                });
                            }
                            break;
                    }
                })
                .catch(function(errorGetPic){
                    console.log('Error getPicture cordova',errorGetPic);
                });

            });
        }

        function uploadImage(targetPath) {
            var realPath = cordova.file.dataDirectory + targetPath;

            return $q(function (resolve, reject) {

                var url = URL_REST + "images";

                var filename = 'MyAvatar';

                var options = {
                    fileKey: "image",
                    desc: filename,
                    filename: filename,
                    image: realPath,
                    chunkedMode: false,
                    mimeType: "multipart/form-data",
                    params: { 'fileName': filename }

                };

                $cordovaFileTransfer.upload(url, realPath, options).then(function (result) {
                    resolve({
                        success: true
                    });
                },
                    function (error) {
                        reject('error');
                        console.log('error', error);
                    });
            });
        }

        function loadImage(scope) {

            scope.hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: 'Take a Photo' },
                    { text: 'Photo from library' }
                ],
                titleText: 'Add images',
                cancelText: 'Cancel',
                destructiveButtonClicked: function () {
                    return true;
                },

                buttonClicked: function (btnIndex) {
                    var type = null;
                    if (btnIndex === 0) {
                        type = Camera.PictureSourceType.CAMERA;
                    } else if (btnIndex === 1) {
                        type = Camera.PictureSourceType.PHOTOLIBRARY;
                    }
                    if (type !== null) {
                        saveMedia(type).then(function (responseData) {
                            scope.image = responseData['urlFile'];
                            scope.cordovaImgPath = (cordova.file.dataDirectory + responseData['urlFile']);
                            scope.cordovaImgPath = FileService.getUserImg();
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                        });
                    }
                    return true;
                }
            });
        };

        return {
            saveMedia: saveMedia,
            loadImage: loadImage,
            uploadImage: uploadImage
        }

    });
