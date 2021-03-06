var app = angular.module('navApp', ['ionic', 'ui.router', 'ngCordova', 'ngCordova.plugins.fileTransfer', 'ngRoute', 'ngCookies']);

app.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {

    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.tabs.style("standard");
    $ionicConfigProvider.navBar.alignTitle("center");
    $ionicConfigProvider.backButton.text('').icon('ion-chevron-left').previousTitleText(false);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|content|file|chrome-extensio):/);
    //$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

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

app.controller('GalleryCtrl', function ($scope, $state, $http, $ionicModal, $ionicActionSheet, Camera, $cordovaFileTransfer, $cookies, auth, $rootScope) {
    $scope.title = "Today";

    //getPosts();

    $scope.goPost = function (id) {
        $state.go('tabs.article', {id: id});
    };

    /* function getPosts() {
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
     }*/


    $scope.updateList = function () {
        $http.get('http://today.globals.cat/posts').
            success(function (data) {
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
                console.log($rootScope.loged);

            });
    };
    $rootScope.loged = false;
    //$scope.loged = false;

    $scope.login = function ($username, $password) {
        auth.login($username, $password);

        var url = "http://today.globals.cat/authentication/" + $cookies.username + "/" + $cookies.password;

        //console.log(post_data);
        console.log($cookies.username);
        console.log($cookies.password);

        if (typeof($cookies.username) != 'undefined') {
            $http
            ({
                method: 'POST',
                url: url,
                //data: post_data,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function (data, status) {
                    $rootScope.loged = true;

                    console.log($scope.loged);
                    console.log("Post status: ", status);
                }).
                error(function (data, status) {
                    console.log("Error!");
                    console.log(status, data);
                });
        }
    };

    $scope.logout = function () {
        auth.logout();
        $rootScope.loged = false;

    };

/*    $scope.init = function () {
        $scope.updateList();
    };*/

    // Actualitza l'estat de la vista cada vegada que s'accedeix a ella.
    /*    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
     if (toState.name == 'tabs.gallery') {
     $scope.updateList();
     }
     });*/

    //$scope.init();

});

app.controller('TodayCtrl', function ($scope, $ionicModal, $ionicActionSheet, $stateParams, $http, $ionicLoading) {
    $scope.title = "Galeria";

    $scope.getGallery = function () {
        $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>',

        });
        $http.get('http://today.globals.cat/posts/gallery').
            success(function (data) {
                $scope.images = [];
                var i2 = 0;

                //$scope.data_gallery = data;
                for (var i = 0; i < data.length; i++) {
                    for (var key in data[i]) {
                        if (data[i].hasOwnProperty(key)) {
                            //console.log(data[i][key]);
                            if (data[i][key]) {
                                $scope.images[i2++] = "http://today.globals.cat/uploads/" + data[i][key];
                                console.log(data[i][key]);
                                $ionicLoading.hide();
                            }
                        }
                    }
                    //console.log(data[i].length);
                }
                //console.log($scope.images);


            }).error(function (data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(data);

            }).finally(function () {
                //alert("test");

                // Stops Pull to refrash scroll
                $scope.$broadcast('scroll.refreshComplete');

            });
    };

/*
    $scope.init = function () {
        $scope.getGallery();
        //$scope.getGallery();
    };

    $scope.init();
*/

    $ionicModal.fromTemplateUrl('gallery_modal.html', function (modal) {
        $scope.gridModal = modal;
    }, {
        scope: $scope,
        animation: 'slide-in-up'
    });

    // open video modal
    $scope.openModal = function (gallery_image) {
        $scope.images.gallery_image = gallery_image;
        console.log($scope.images.gallery_image);
        console.log(gallery_image);

        $scope.gridModal.show();
    };
    // close video modal
    $scope.closeModal = function () {
        $scope.gridModal.hide();
    };
    //Cleanup the video modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.gridModal.remove();
    });
});

app.controller('ArticleCtrl', function ($scope, $ionicModal, $http, $stateParams) {
    $scope.title = "Today";

    getPost();

    function getPost() {
        $http.get('http://today.globals.cat/posts/' + $stateParams.id).
            success(function (data) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.data = data;
                console.log(angular.toJson(data));
                console.log(data.title);
                console.log(data.content);
            }).error(function (data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(data);

            });
    }

    $ionicModal.fromTemplateUrl('modal.html', function (modal) {
        $scope.gridModal = modal;
    }, {
        scope: $scope,
        animation: 'slide-in-up'
    });
    // open video modal
    $scope.openModal = function (selected) {
        $scope.data.selected = "http://today.globals.cat/uploads/" + selected;
        console.log($scope.data.selected);

        $scope.gridModal.show();
    };
    // close video modal
    $scope.closeModal = function () {
        $scope.gridModal.hide();
    };
    //Cleanup the video modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.gridModal.remove();
    });
});

/*app.directive('gridImage', function ($img) {
    return function ($scope, element, attrs) {
        var url = attrs.gridImage;
        element.css({
            'background-image': 'url(' + url + $img + ')'
        });
    };
});*/

app.factory('myCache', function($cacheFactory) {
    return $cacheFactory('myData');
});

//factoria que controla la autentificación, devuelve un objeto
//$cookies para crear cookies
//$cookieStore para actualizar o eliminar
//$location para cargar otras rutas
app.factory("auth", function ($cookies, $cookieStore, $location) {
    return {
        login: function (username, password) {
            //creamos la cookie con el nombre que nos han pasado
            $cookies.username = username;
            $cookies.password = password;
            $cookieStore.put("loged", 'yes');
            //mandamos a la $cookies.username
            // console.log($cookies.username);
            $location.path("/tabs/login");
        },
        logout: function () {
            //al hacer logout eliminamos la cookie con $cookieStore.remove
            $cookieStore.remove("username");
            $cookieStore.remove("password");
            //mandamos al login
            //console.log($cookies.username);
            $location.path("/tabs/login");
        },
        checkStatus: function () {
            //creamos un array con las rutas que queremos controlar
            var rutasPrivadas = ["/login", "/tabs/login", "/login"];
            console.log($cookies.username);
            if (this.in_array($location.path(), rutasPrivadas) && typeof($cookies.username) == "undefined") {
                $location.path("/gallery");
            }
            //en el caso de que intente acceder al login y ya haya iniciado sesión lo mandamos a la home
            if (this.in_array("/login", rutasPrivadas) && typeof($cookies.username) != "undefined") {
                $location.path("/new-post");
            }
        },
        in_array: function (needle, haystack) {
            var key;
            for (key in haystack) {
                if (haystack[key] == needle) {
                    return true;
                }
            }
            return false;
        }
    }
});

app.controller('LoginCtrl', function ($scope) {
    $scope.title = "Informació";

    $scope.data = {};

});

app.service('LoginService', function ($q) {
    return {
        loginUser: function (name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            if (name == 'user' && pw == 'secret') {
                deferred.resolve('Benvolgut ' + name + '!');

            } else {
                deferred.reject('Credencials incorrectes!');

            }
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            };
            return promise;
        }
    }
});

app.run(function ($rootScope, auth, $window) {
    //al cambiar de rutas
    $rootScope.$on('$routeChangeStart', function () {
        //llamamos a checkStatus, el cual lo hemos definido en la factoria auth
        //la cuál hemos inyectado en la acción run de la aplicación
        auth.checkStatus();
        $window.location.reload(true);

    });


});

app.controller('NewPostCtrl', function ($scope, $state, $http, $ionicActionSheet, Camera, $cordovaFileTransfer, $ionicPopup) {
    $scope.title = "Today";

    $scope.newPost = function () {

        // Create new id

        $http.post('http://today.globals.cat/posts/create').
            success(function (data) {
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
                    success(function (data, status) {
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

                                //$location.path("/tabs/gallery");
                                $state.go('tabs.gallery');

                            });
                        };

                        $scope.showAlert();


                    }).
                    error(function (data, status) {
                        console.log("BADD!");
                        console.log(data);
                        console.log(status);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });

            }).error(function (data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(data);

            });
    };


    $scope.openOptions = function ($img) {
        $ionicActionSheet.show({
            titleText: 'Afegir Imatge Nova',
            buttons: [
                {text: '<i class="icon ion-camera"></i> Càmera'},
                {text: '<i class="icon ion-images"></i> Galeria'}
            ],
            cancelText: 'Cancelar',
            cancel: function () {
                console.log('CANCELLED');
            },
            buttonClicked: function (index) {
                if (index === 0) { // Manual Button
                    console.log('Camara ' + $img);
                    Camera.getPicture({
                        correctOrientation: true,
                        quality: 40,
                        destinationType: navigator.camera.DestinationType.NATIVE_URI,
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


                    /*               $scope.showAlert = function () {
                     var alertPopup = $ionicPopup.alert({
                     title: 'Opció no disponible!',
                     template: 'Aquesta opció serà disponible en la pròxima actualització'
                     });
                     alertPopup.then(function (res) {
                     console.log('Alerta realitzada satisfactòriament.');

                     });
                     };

                     $scope.showAlert();*/


                    Camera.getPicture({
                        correctOrientation: true,
                        quality: 40,
                        destinationType: navigator.camera.DestinationType.NATIVE_URI,
                        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                        allowEdit: false,
                        encodingType: navigator.camera.EncodingType.JPEG,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: false


                    }).then(function (imageData) {

                        console.log("before replace", imageData);


                        if (imageData.substring(0, 21) == "content://com.android") {
                            var photo_split = imageData.split("%3A");
                            filename = photo_split[1] + ".jpg";
                        } else {
                            var filename = imageData.replace(/^.*[\\\/]/, '');
                        }


                        console.log("after replace", filename);

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
                }
            }
        });
    }
});
