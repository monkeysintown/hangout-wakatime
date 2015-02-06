/* global angular, gapi, gadgets, moment, $ */

(function() {
    'use strict';

    var API_URL = 'https://wakatime.com/api/v1/actions';
    var PLUGIN = 'hangout-wakatime/0.1.0';
    var LOGO = 'https://raw.githubusercontent.com/monkeysintown/hangout-wakatime/master/gadget/images/logo.png';

    var app = angular.module('wakatime', []);

    app.factory('Hangout', function ($rootScope, $interval, $http, $log) {
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
            data: {
                initialized: false,
                apiKey: '',
                project: 'Unknown Calls',
                language: 'Call',
                is_write: true,
                lines: 1
            },
            init: function() {
                $log.info('Init called...');

                gapi.hangout.onParticipantsChanged.add(
                    function(evt) {
                        $log.info(evt);
                        $rootScope.$broadcast('hangout.participant', evt);
                        $log.info(angular.toJSON(evt));
                    });

                gapi.hangout.onair.onBroadcastingChanged.add(
                    function(evt) {
                        $log.info(evt);
                        Hangout.start();
                        $rootScope.$broadcast('hangout.broadcasting', evt);
                        $log.info(angular.toJSON(evt));
                    });

                gapi.hangout.onTopicChanged.add(
                    function(evt) {
                        $log.info(evt);
                        Hangout.start();
                        $rootScope.$broadcast('hangout.topic', evt);
                        $log.info(angular.toJSON(evt));
                    });

                this.data.initialized = true;
            },
            start: function() {
                if(watch) {
                    return;
                } else {
                    Hangout.setTime(moment(time).format('HH:mm:ss'));
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
                var overlay = gapi.hangout.av.effects.createImageResource(createTextOverlay(time));
                overlay = overlay.createOverlay({
                    'scale': {
                        'magnitude': 0.4,
                        'reference': gapi.hangout.av.effects.ScaleReference.WIDTH
                    }
                });
                overlay.setPosition(-0.4, -0.4);
                overlay.setVisible(true);

                if(overlays['time']) {
                    overlays['time'].dispose();
                }

                overlays['time'] = overlay;
            },
            showLogo: function(show) {
                if(!overlays['logo']) {
                    overlays['logo'] = gapi.hangout.av.effects.createImageResource(LOGO);
                    overlays['logo'] = overlays['logo'].createOverlay({
                        'scale': {
                            'magnitude': 0.4,
                            'reference': gapi.hangout.av.effects.ScaleReference.WIDTH
                        }
                    });
                    overlays['logo'].setPosition(-0.4, -0.1);
                }
                overlays['logo'].setVisible(show);
            },
            sendHeartbeat: function(file, time, project) {
                return $http({
                    method: 'POST',
                    url: API_URL,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa(Hangout.data.apiKey)
                    },
                    data: JSON.stringify({
                        time: time/1000,
                        file: file,
                        project: project,
                        language: Hangout.data.language,
                        is_write: Hangout.data.is_write,
                        lines: Hangout.data.lines,
                        plugin: PLUGIN
                    })
                });
            }
        };

        // Wait for gadget to load.
        gadgets.util.registerOnLoadHandler(function() {
            gapi.hangout.onApiReady.add(
                function(e) {
                    if(!Hangout.data.initialized) {
                        Hangout.init();
                    }
                });
        });

        if(!Hangout.data.initialized) {
            Hangout.init();
        }

        return Hangout;
    });

    app.controller('WakatimeCtrl', function ($scope, $http, Hangout) {
        $scope.edit = true;
        $scope.running = false;
        $scope.logo = LOGO;

        $scope.start = function() {
            Hangout.start();
            $scope.running = true;
        };

        $scope.stop = function() {
            Hangout.stop();
            $scope.running = false;
        };

        $scope.reset = function() {
            Hangout.reset();
        };

        $scope.$watch('showLogo', function(newValue, oldValue) {
            Hangout.showLogo(newValue);
        });

        $scope.$watch('apiKey', function(newValue, oldValue) {
            Hangout.data.apiKey = newValue;
        });

        $scope.$watch('project', function(newValue, oldValue) {
            Hangout.data.project = newValue;
        });
    });

})();