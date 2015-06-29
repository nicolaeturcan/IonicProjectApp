var app = angular.module('navApp', ['ionic', 'swipe', 'wu.masonry', 'ab-base64', 'base64', 'ui.router', 'ngCordova', 'ngCordova.plugins.fileTransfer', 'ngRoute'])

/*app.run(function($cordovaStatusbar) {

 // Change Statusbar color //
 $cordovaStatusbar.overlaysWebView(true);

 $cordovaStatusbar.styleHex('#b73e2a');

 })*/

// RUTAS
app.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {

    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.tabs.style("standard");
    $ionicConfigProvider.navBar.alignTitle("center");
    $ionicConfigProvider.backButton.text('').icon('ion-chevron-left').previousTitleText(false);

    $urlRouterProvider.otherwise('/tabs/gallery');

    $stateProvider.state('tabs', {
        url: '/tabs',
        abstract: true,
        templateUrl: 'tabs.html'
    });

    $stateProvider.state('tabs.gallery', {
        url: '/gallery',
        views: {
            'gallery-tab': {
                templateUrl: 'gallery.html',
                controller: 'GalleryCtrl'
            }
        }
    });

    $stateProvider.state('tabs.today', {
        url: '/today',
        views: {
            'today-tab': {
                templateUrl: 'today.html',
                controller: 'TodayCtrl'
            }
        }
    });

    $stateProvider.state('tabs.profile', {
        url: '/profile',
        views: {
            'profile-tab': {
                templateUrl: 'profile.html',
                controller: 'ProfileCtrl'
            }
        }
    });

    $stateProvider.state('tabs.login', {
        url: '/login',
        views: {
            'profile-tab': {
                templateUrl: 'login.html',
                controller: 'LoginCtrl'
            }
        }
    });

    $stateProvider.state('tabs.article', {
        url: '/article/:id',
        views: {
            'gallery-tab': {
                templateUrl: 'article.html',
                controller: 'ArticleCtrl'
            }
        }

    });

    $stateProvider.state('tabs.new-post', {
        url: '/new-post',
        views: {
            'gallery-tab': {
                templateUrl: 'new-post.html',
                controller: 'NewPostCtrl'
            }
        }
    });

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
});

app.factory('Camera', ['$q', function ($q) {

    return {
        getPicture: function (options) {
            var q = $q.defer();

            navigator.camera.getPicture(function (result) {

                // Do any magic you need
                q.resolve(result);
            }, function (err) {
                q.reject(err);
            }, options);

            return q.promise;
        }
    }
}]);

// CONTROLADORES

app.controller('GalleryCtrl', function ($scope, $state, $http, $ionicModal, $ionicActionSheet, Camera, $cordovaFileTransfer) {
    $scope.title = "Today";

    getPosts();

    $scope.goPost = function (id) {
        $state.go('tabs.article', {id: id});
    };

    function getPosts() {
        $http.get('http://today.globals.cat/posts').
            success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available

                $scope.dataGet = data;
                console.log(data[0].id);
            }).error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(data);

            });
    }


    $scope.updateList = function () {
        $http.get('http://today.globals.cat/posts').
            success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available

                $scope.dataGet = data;
                //alert(data.id);
            }).error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                //alert(data);

            }).finally(function () {
                //alert("test");

                // Stops Pull to refrash scroll
                $scope.$broadcast('scroll.refreshComplete');
            });
    };

    $scope.init = function () {
        $scope.updateList();
        //$scope.getGallery();
    };

    $scope.init();

});

app.controller('TodayCtrl', function ($scope, $ionicModal, $ionicSlideBoxDelegate, $ionicActionSheet, $http, $timeout, Camera) {
    $scope.title = "Galeria";


    $scope.getGallery = function () {
        $http.get('http://today.globals.cat/posts/gallery').
            success(function (data, status, headers, config) {
                $scope.images = [];
                i2 = 0;

                //$scope.data_gallery = data;
                for (i = 0; i < data.length; i++) {
                    for (key in data[i]) {
                        if (data[i].hasOwnProperty(key)) {
                            //console.log(data[i][key]);
                            if (data[i][key]) {
                                $scope.images[i2++] = data[i][key];
                                console.log(data[i][key]);
                            }
                        }
                    }
                    //console.log(data[i].length);
                }
                //console.log($scope.images);

            }).error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(data);

            });
    };


    function getImage() {

        navigator.camera.getPicture(onSuccess, onFail, {

            destinationType: navigator.camera.DestinationType.DATA_URL,
            encodingType: navigator.camera.EncodingType.JPEG,
            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY

        });

        function onSuccess(imageData) {
            console.log('OK! ' + imageData);
            $timeout(function () {
                $scope.image = imageData;
                // TODO: CREAR MENSAJE CARGA //
            }, 1000);
        }

        function onFail(message) {
            console.log('Failed because: ' + message);
        }
    }

    function getImageCam() {

        navigator.camera.getPicture(onSuccess, onFail, {

            destinationType: navigator.camera.DestinationType.FILE_URI,
            encodingType: navigator.camera.EncodingType.JPEG,
            sourceType: navigator.camera.PictureSourceType.CAMERA,
            correctOrientation: true

        });

        function onSuccess(imageURI) {
            console.log('OK! ' + imageURI);
            $timeout(function () {
                $scope.image = images.image;
            }, 1000);
        }

        function onFail(message) {
            console.log('Failed because: ' + message);
        }
    }

    // Insert new image from camera or gallery //

    $scope.openOptions = function () {
        $ionicActionSheet.show({
            buttons: [
                {text: 'Camara'},
                {text: 'Imagen desde galeria'}
            ],
            titleText: 'Nueva fotografia',
            cancelText: 'Cancelar',
            buttonClicked: function (index) {
                if (index === 0) { // Manual Button
                    console.log('Camara');
                    getImageCam();
                }
                else if (index === 1) {
                    console.log('Galeria');
                    getImage();
                }
                return true;
            }
        });
    };


    $ionicModal.fromTemplateUrl('gallery-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function (index) {
        $ionicSlideBoxDelegate.slide(index);
        $scope.modal.show();
    };

    $scope.closeModal = function () {
        $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
    $scope.$on('modal.shown', function () {
        console.log('Modal is shown!');
    });

    // Call this functions if you need to manually control the slides
    $scope.next = function () {
        $ionicSlideBoxDelegate.next();
    };

    $scope.previous = function () {
        $ionicSlideBoxDelegate.previous();
    };

    $scope.goToSlide = function (index) {
        $scope.modal.show();
        $ionicSlideBoxDelegate.slide(index);
    };

    // Called each time the slide changes
    $scope.slideChanged = function (index) {
        $scope.slideIndex = index;
    };

});

app.controller('ArticleCtrl', function ($scope, $ionicModal, $ionicSlideBoxDelegate, $http, $stateParams, $timeout) {
    $scope.title = "Today";


    getPost();

    function getPost() {
        $http.get('http://today.globals.cat/posts/' + $stateParams.id).
            success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.data = data;
                console.log(angular.toJson(data));
                console.log(data.title);
                console.log(data.content);
            }).error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(data);

            });
    }

    function genBrick(i) {
        var height = 300;
        var id = ~~(Math.random() * 10000);
        return {
            src: 'http://lorempixel.com/g/280/' + height + '/?' + id,
            index: i
        };
    }

    $scope.bricks = [
        genBrick(0),
        genBrick(1),
        genBrick(2)

    ];

    $ionicModal.fromTemplateUrl('gallery-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function (index) {
        $scope.modal.show();
        $ionicSlideBoxDelegate.slide(index);
    };

    $scope.closeModal = function () {
        $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
    $scope.$on('modal.shown', function () {
        console.log('Modal is shown!');
    });

    // Call this functions if you need to manually control the slides
    $scope.next = function () {
        $ionicSlideBoxDelegate.next();
    };

    $scope.previous = function () {
        $ionicSlideBoxDelegate.previous();
    };

    $scope.goToSlide = function (index) {
        $scope.modal.show();
        $ionicSlideBoxDelegate.slide(index);
    };

    // Called each time the slide changes
    $scope.slideChanged = function (index) {
        $scope.slideIndex = index;
    };

});

/*app.controller('ProfileCtrl', function($scope, $ionicModal) {
 $scope.title = "Informació";

 $ionicModal.fromTemplateUrl('login.html', {
 scope: $scope,
 animation: 'slide-in-up'
 }).then(function(modal) {
 $scope.modal = modal;
 });

 $scope.openModal = function() {
 $scope.modal.show();
 };

 $scope.closeModal = function() {
 $scope.modal.hide();
 };
 // Cleanup the modal when we're done with it!
 $scope.$on('$destroy', function() {
 $scope.modal.remove();
 });
 // Execute action on hide modal
 $scope.$on('modal.hide', function() {
 // Execute action
 });
 // Execute action on remove modal
 $scope.$on('modal.removed', function() {
 // Execute action
 });
 $scope.$on('modal.shown', function() {
 console.log('Modal is shown!');
 });

 });*/


app.controller('LoginCtrl', function ($scope, $ionicModal) {
    $scope.title = "Informació";


    $scope.openModal = function () {
        $scope.modal.show();
    };

    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
    $scope.$on('modal.shown', function () {
        console.log('Modal is shown!');
    });

});


app.controller('NewPostCtrl', function ($scope, $state, $http, $ionicActionSheet, Camera, $cordovaFileTransfer, $ionicPopup, $timeout) {
    $scope.title = "Today";

    $scope.newPost = function () {

        // Create new id

        $http.post('http://today.globals.cat/posts/create').
            success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available

                //var postId = data.id;
                //console.log(data.id);

                console.log($scope.postId = data.id);
                console.log($scope.titlePost);
                console.log($scope.contentPost);
                console.log($scope.nameOfPrincipal);
                console.log($scope.nameOfImage1);
                console.log($scope.nameOfImage2);
                console.log($scope.nameOfImage3);


                // Create new entry

                var url = "http://today.globals.cat/posts/" + $scope.postId + "/add/data";

                var post_data = {
                    title_post: $scope.titlePost,
                    content_post: $scope.contentPost,
                    principal_post: $scope.nameOfPrincipal,
                    img1_post: $scope.nameOfImage1,
                    img2_post: $scope.nameOfImage2,
                    img3_post: $scope.nameOfImage3
                };

                console.log(post_data);

                $http.post(url, post_data).
                    success(function (data, status, headers, config) {
                        console.log("DONE!");
                        console.log(data);
                        console.log(status);
                        // this callback will be called asynchronously
                        // when the response is available


                        $scope.showAlert = function () {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Registre afegit!',
                                template: 'S\'ha afegit un registre nou satisfactòriament.'
                            });
                            alertPopup.then(function (res) {
                                console.log('Alerta realitzada satisfactòriament.');

                            });
                        };

                        $scope.showAlert();

                    }).
                    error(function (data, status, headers, config) {
                        console.log("BADD!");
                        console.log(data);
                        console.log(status);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });

            }).error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(data);

            });
    };


    $scope.openOptions = function ($img) {
        $ionicActionSheet.show({
            buttons: [
                {text: 'Camara'},
                {text: 'Imagen desde galeria'}
            ],
            titleText: 'Nueva fotografia',
            cancelText: 'Cancelar',
            buttonClicked: function (index) {
                if (index === 0) { // Manual Button
                    console.log('Camara ' + $img);
                    Camera.getPicture({
                        correctOrientation: true,
                        quality: 40,
                        destinationType: navigator.camera.DestinationType.FILE_URI,
                        encodingType: navigator.camera.EncodingType.JPEG
                    }).then(function (imageData) {

                        var filename = imageData.replace(/^.*[\\\/]/, '');

                        upload();

                        function upload() {

                            var options = {
                                fileKey: $img,
                                fileName: imageData.substr(imageData.lastIndexOf('/'))
                            };

                            $cordovaFileTransfer.upload("http://today.globals.cat/posts/" + $scope.postId + "/" + filename + "/upload", imageData, options).then(function (result) {
                                console.log("SUCCESS: " + JSON.stringify(result.response));
                            }, function (err) {
                                console.log("ERROR: " + JSON.stringify(err));
                            }, function (progress) {
                                console.log("EN PROCESO!");
                            });
                        }


                        if ($img === 'principal') {
                            $scope.imagePrinc = imageData;
                            $scope.nameOfPrincipal = filename;

                        } else if ($img === 'img1') {
                            $scope.image1 = imageData;
                            $scope.nameOfImage1 = filename;

                        } else if ($img === 'img2') {
                            $scope.image2 = imageData;
                            $scope.nameOfImage2 = filename;

                        } else if ($img === 'img3') {
                            $scope.image3 = imageData;
                            $scope.nameOfImage3 = filename;

                        }

                    }, function (err) {
                        console.err(err);
                    })

                } else if (index === 1) {
                    console.log('Galeria');

                    Camera.getPicture({
                        correctOrientation: true,
                        quality: 40,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                    }).then(function (imageData) {

                        uploadPhoto();

                        function uploadPhoto() {

                            var options = {
                                fileKey: $img,
                                fileName: imageData.substr(imageData.lastIndexOf('/') + 1)
                            };

                            $cordovaFileTransfer.upload("http://today.globals.cat/posts/" + $scope.postId + "/images/upload", imageData, options).then(function (result) {
                                console.log("SUCCESS: " + JSON.stringify(result.response));
                            }, function (err) {
                                console.log("ERROR: " + JSON.stringify(err));
                            }, function (progress) {
                                console.log("EN PROCESO!");
                            });
                        }


                        if ($img === 'principal') {
                            $scope.imagePrinc = imageData;
                        } else if ($img === 'img1') {
                            $scope.image1 = imageData;
                        } else if ($img === 'img2') {
                            $scope.image2 = imageData;
                        } else if ($img === 'img3') {
                            $scope.image3 = imageData;
                        }

                    }, function (err) {
                        console.err(err);
                    });
                }
            }
        });
    }
});
