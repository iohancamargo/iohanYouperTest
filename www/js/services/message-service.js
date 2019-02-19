var appModule = angular.module('starter');

appModule.factory("MsgService", ["$ionicPopup", "URL_REST", "$http", function ($ionicPopup, URL_REST, $http) {

    return {
        getAllMessages: getAllMessages,
        showInteractiveMsg: showInteractiveMsg,
    };

    function getAllMessages() {

        return $http.get(URL_REST + "messages");
    }

    function changeContent(scope) {
        var element = angular.element(document.querySelector('#messageInteractive'));
        element.html(scope.messageAlrt);
    };

    function showInteractiveMsg(scope, arrMessageWS) {

        var animation = '';
        var msgAlert = arrMessageWS.desc;
        var titleAlrt = arrMessageWS.title;
        

        switch (arrMessageWS.typeOfAnimation) {
            case 'heartBeat':
                animation = '<div id="imgClick"><div class="pulse"><img src="img/hand.png" class="pop-up-img-interactive"/></div><span class="text-center">(Click to see more)</span></div>';        
            break;

            case 'slideLeft':
                animation = '<div class="slide-left"><img src="img/hand.png" class="pop-up-img-interactive"/></div><span class="text-center">(Click to see more)</span></div></p></div>';
            break;

        }
        msgAlert = msgAlert + animation;
        scope.messageAlrt = msgAlert.replace('<span class="text-center">(Click to see more)</span>','');

        var msgReduzida = msgAlert.substr(0, 50) + '...' + animation;
        var templateMessage = '<div id="messageInteractive" ng-click="changeContent(arrMessageWS,scope)">' + msgReduzida + '</div>';

        var alertPopup = $ionicPopup.alert({
            scope: scope,
            okText: 'Got It',
            title: titleAlrt,
            template: templateMessage,
            buttons: [
                {
                    text: '<b>Got it</b>',
                    type: 'button-energized',
                    cssClass: 'confirmation-pop',
                }
            ]
        });

        alertPopup.then(function (res) {
            /* Chama alteração da mensagem para lida */
            console.log('Chamou alteracao da mensagem');
            $http.put(URL_REST + "message_up_to_read/"+arrMessageWS._id,{read: true}).then(
                function (ret) {
                    scope.getAllMessages();
                    console.log('ret',ret);
                },
                function (ret) {
                    console.log('ret',ret);
                    console.log('Não foi possivel marcar a mensagem como lida.');
                }
            );
        });

    };

}]);