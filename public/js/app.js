var app = angular.module('myApp', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'templates/home.html'
        }).
        when('/login', {
            templateUrl: 'templates/login.html',
            controller: 'loginController'
        }).
        when('/signUp', {
            templateUrl: 'templates/signUp.html',
            controller: 'signUpController'
        }).
        when('/profile', {
            templateUrl: 'templates/profile.html',
            controller: 'profileController'
        }).
        when('/logout', {
            templateUrl: 'templates/logout.html',
            controller: 'logoutController'
        }).
        otherwise({
            redirectTo: '/'
        });
});

app.controller('appController', function ($scope, $http) {
    $scope.developers = [{name:'Tim Wong'}, {name:'Angel Lim'}, {name:'Riley Woo'}];
});

app.controller('signUpController', function ($scope, $http, $location) {
    $scope.newUser = {};
    $scope.signUp = function () {
        $http.post('/signUp', $scope.newUser).success(function (response) {
            if (response.status == 'bj') {
                if (response.result.code == 11000)
                    alert('That email was already taken.');
                else
                    alert('BJ');
            }
            else if (response.status == 'gj') {
                $location.path('/login');
            } else if (response.status == 'yw') {
                alert('You are already signed in. Pls logout to sign up.');
            }
        });
    }
});

app.controller('loginController', function ($scope, $http, $location) {
    $scope.user = {};
    $scope.login = function () {
        $http.post('/login', $scope.user).success(function (response) {
            if (response.status == 'bj') {
                alert('The email or password you provided was incorrect.');
            }
            else if (response.status == 'gj') {
                $location.path('/profile');
            } else if (response.status == 'yw') {
                alert('You are already signed in. Pls logout to login to another account.');
            }
        });
    }
});

app.controller('profileController', function ($scope, $http, $location) {
    $scope.user = {};
    $http.get('/profile').success(function (response) {
        if (response.status == 'gj') {
            $scope.user.firstName = response.result.firstName;
            $scope.user.lastName = response.result.lastName;
            $scope.user.email = response.result.email;
        } else if (response.status == 'bj') {
            $location.path('/login');
        }
    });
});

app.controller('logoutController', function ($scope, $http, $location) {
    $http.post('/logout').success(function (response) {
        console.log('Logged out');
    });
});
