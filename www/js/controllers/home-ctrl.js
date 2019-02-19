var appModule = angular.module('starter.controllers');

appModule.controller('HomeCtrl',
    function ($scope, $ionicPopup, $ionicPlatform, ImageService, MsgService,FileService, $interval,$ionicActionSheet,$ionicLoading) {

        $scope.imageBase64 = '';
        $scope.messagesRead = [];
        $scope.cordovaImgPath = '';
        $scope.messagesNotRead = [];

        $ionicPlatform.ready(function () {

            var isCordovaApp = !!window.cordova;

            if(isCordovaApp){
                $scope.cordovaImgPath = FileService.getUserImg();

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }

        });

        /**
          * Make call to web service function that returns messages
        */
        $scope.getAllMessages = function () {
            $scope.messagesRead = [];
            $scope.messagesNotRead = [];

            MsgService.getAllMessages().then(
                function (ret) {
                    console.log('ret all messages', ret);
                    // After checking messages from the ws is made the preparation to display the same
                    angular.forEach(ret.data, function (message, key) {
                        if (message.read) {
                            $scope.messagesRead.push(message);
                        } else {
                            // Adds only last unread message
                            if ($scope.messagesNotRead.length == 0) {
                                $scope.messagesNotRead.push(message);
                            }
                        }
                    });

                },
                function (ret) {
                    console.log('could not check messages');
                }
            );
        }

        $scope.getAllMessages();

        /**
          * Every 1 minute is checked for new messages
        */  
        $interval(function () {

            console.log('Rodou timeout getAllMessages');
            $scope.getAllMessages();
        }, 5000);


        $scope.showInteractiveMsg = function () {
            if ($scope.messagesNotRead.length > 0) {
                MsgService.showInteractiveMsg($scope, $scope.messagesNotRead[0]);
                /* Update messages */
            }
        };

        /**
          * Based on localstorage is returned the image path of cordova storage
        */
        $scope.pathForImage = function () {
            var image = null;

            image = window.localStorage.getItem('user_img');

            if (image === null) {
                return '';
            } else {
                return (cordova.file.dataDirectory + image);
            }
        };

        $scope.changeContent = function () {

            var element = angular.element(document.querySelector('#messageInteractive'))
            element.html($scope.messageAlrt);

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
                                .catch(function(errorUpImg){
                                    console.log('errorUpImg',errorUpImg);
                                    $ionicLoading.hide();

                                });

                        })
                        .catch(function(error){
                            console.log('Exception in saveMedia',error);
                            $ionicLoading.hide();
                        });
                    }else{
                        $ionicLoading.hide();
                    }
                    return true;
                }
            });
        }

    });
