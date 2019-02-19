var appModule = angular.module('starter.controllers');

appModule.controller('ProfileCtrl',
    function ($scope, $ionicPopup, $ionicPlatform, $ionicActionSheet, ImageService, FileService, $ionicLoading) {

        $scope.imageBase64 = '';
        $scope.cordovaImgPath = '';

        $scope.getImgUserStorage = function () {
            return $scope.imageBase64;
        }

        $ionicPlatform.ready(function () {
            var isCordovaApp = !!window.cordova;

            if (isCordovaApp) {

                $scope.cordovaImgPath = FileService.getUserImg();

                if (!$scope.$$phase) {
                    $scope.$apply();

                }
            }
        });

        $scope.pathForImage = function () {
            var image = null;

            image = window.localStorage.getItem('user_img');

            if (image === null) {
                return '';
            } else {
                return (cordova.file.dataDirectory + image);
            }
        };

        $scope.showAlert = function (title, msg) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: msg
            });
        };

        $scope.callLoadImage = function () {
            $scope.hideSheet = $ionicActionSheet.show({
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

                        $ionicLoading.show({
                            template: 'Storing image...'
                        });

                        ImageService.saveMedia(type)
                            .then(function (responseData) {
                                $scope.image = responseData['urlFile'];
                                $scope.cordovaImgPath = responseData['urlFile'];

                                /* Up img avatar */
                                if (!$scope.$$phase) {
                                    $scope.$apply();
                                }
                                /* Sending to the aws s3 */
                                ImageService.uploadImage(responseData['urlFile'])
                                    .then(function (resUp) {
                                        console.log('image send to the server');
                                        $ionicLoading.hide();
                                    })
                                    .catch(function (errorUpImg) {
                                        console.log('errorUpImg', errorUpImg);
                                        $ionicLoading.hide();

                                    });

                            })
                            .catch(function (error) {
                                console.log('Exception in saveMedia', error);
                                $ionicLoading.hide();
                            });
                    } else {
                        $ionicLoading.hide();
                    }
                    return true;
                }
            });
        }




    });
