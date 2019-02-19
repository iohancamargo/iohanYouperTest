
var appModule = angular.module('starter');

appModule.factory('FileService', function ($window) {

    var USER_IMAGE = 'user_img';
    var USER_IMAGE_BASE64 = 'user_img_base64';

    function getUserImg() {

        var img = null;
        var img = window.localStorage.getItem(USER_IMAGE);

        /* Verifica se o localStorage já está preenchido, caso não esteja é realizado um GET para buscar no WS a foto gravada. */
        if (!img) {
            // busca
        }

        if (img == null) {
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

    function storageImage(img, realPath) {
        getFileContentAsBase64(realPath, function (base64Image) {
            localStorage.setItem(USER_IMAGE_BASE64, base64Image);
        });

        window.localStorage.setItem(USER_IMAGE, img);
    }

    return {
        storageImage: storageImage,
        getUserImg: getUserImg,
        getFileContentAsBase64: getFileContentAsBase64
    }


});