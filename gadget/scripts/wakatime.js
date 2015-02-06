/* global angular, gapi, gadgets, moment, $ */

(function() {
    'use strict';

    angular.module('wakatime', ['ngCookies']).config(function ($rootScope) {
        // Wait for gadget to load.
        gadgets.util.registerOnLoadHandler(function() {
            gapi.hangout.onApiReady.add(
                function(e) {
                    $rootScope.$broadcast('hangout.ready', e);
                });
        });
    }).controller('WakatimeCtrl', function ($scope, $http, Hangout) {
        $scope.edit = true;
        $scope.running = false;
        $scope.logo = 'https://avatars2.githubusercontent.com/u/4814844?v=3&s=200';

        $scope.start = function() {
            Hangout.start();
        };

        $scope.stop = function() {
            Hangout.stop();
        };

        $scope.reset = function() {
            Hangout.reset();
        };

        $scope.$watch('showLogo', function(newValue, oldValue) {
            Hangout.showLogo(newValue);
        });

        $scope.sendHeartbeat = function(file, time, project, language, isWrite, lines) {
            // TODO
        };
    }).run(function($rootScope) {
        // you can inject any instance here
    }).factory('Hangout', function ($rootScope, $interval) {
        var overlays = {};
        var watch;
        var time = 0;

        function createTextOverlay(string) {
            // Create a canvas to draw on
            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', 166);
            canvas.setAttribute('height', 100);

            var context = canvas.getContext('2d');

            // Draw text
            context.font = '16pt Impact';
            context.lineWidth = 6;
            context.lineStyle = '#000';
            context.fillStyle = '#FFF';
            context.textAlign = 'center';
            context.textBaseline = 'bottom';
            context.strokeText(string, canvas.width / 2, canvas.height / 2);
            context.fillText(string, canvas.width / 2, canvas.height / 2);

            return canvas.toDataURL();
        }

        var Hangout = {
            init: function() {
                gapi.hangout.onParticipantsChanged.add(
                    function(e) {
                        $rootScope.$broadcast('hangout.participant', e);
                    });

                gapi.hangout.onair.onBroadcastingChanged.add(
                    function(e) {
                        $rootScope.$broadcast('hangout.broadcasting', e);
                    });

                gapi.hangout.onair.onNewParticipantInBroadcastChanged.add(
                    function(e) {
                    });

                gapi.hangout.onTopicChanged.add(
                    function(e) {
                        $rootScope.$broadcast('hangout.topic', e);
                    });
            },
            start: function() {
                if(watch) {
                    return;
                } else {
                    watch = $interval(function() {
                        time += 5000;
                        Hangout.setTime(moment(time).format('HH:mm:ss'));
                    }, 5000)
                }
            },
            stop: function() {
                if(watch) {
                    $interval.cancel(watch);
                    watch = undefined;
                }
            },
            reset: function() {
                time = 0;
            },
            setTime: function(time) {
                if(overlays['time']) {
                    overlays['time'].dispose();
                }
                overlays['time'] = gapi.hangout.av.effects.createImageResource(createTextOverlay(time));
                overlays['time'] = overlays['time'].createOverlay({
                    'scale': {
                        'magnitude': 0.5,
                        'reference': gapi.hangout.av.effects.ScaleReference.WIDTH
                    }
                });
                overlays['time'].setPosition(-0.5, 0.45);
                overlays['time'].setVisible(true);
            },
            showLogo: function(show) {
                if(!overlays['logo']) {
                    overlays['logo'] = gapi.hangout.av.effects.createImageResource('https://avatars2.githubusercontent.com/u/4814844?v=3&s=200');
                    overlays['logo'] = overlays['logo'].createOverlay({
                        'scale': {
                            'magnitude': 0.5,
                            'reference': gapi.hangout.av.effects.ScaleReference.WIDTH
                        }
                    });
                    overlays['logo'].setPosition(0.5, 0.45);
                }
                overlays['logo'].setVisible(show);
            }
        };

        $rootScope.$on('hangout.ready', function(e) {
            Hangout.init();
        });

        return Hangout;
    });
})();