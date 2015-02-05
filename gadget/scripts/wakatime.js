/* global gapi, gadgets, $ */

var logoUrl = 'https://wakatime.com/static/img/wakatime-white-120.png';
var overlayEffect = null;

function sendHeartbeat(file, time, project, language, isWrite, lines) {
    // TODO
}

function createTextOverlay(string) {
    // Create a canvas to draw on
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', 166);
    canvas.setAttribute('height', 100);

    var context = canvas.getContext('2d');

    // Draw background
    context.fillStyle = '#BBB';
    context.fillRect(0,0,166,50);

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

function showOverlay() {
    var options = {
        'scale': {
            'magnitude': 0.5,
            'reference': gapi.hangout.av.effects.ScaleReference.WIDTH
        }
    };
    //var overlayImage = gapi.hangout.av.effects.createImageResource(logoUrl);
    var overlayImage = gapi.hangout.av.effects.createImageResource(createTextOverlay('Time: 00:00:23'));
    overlayEffect = overlayImage.createOverlay(options);
    overlayEffect.setPosition(0, 0.45);
    overlayEffect.setVisible(true);
}

function startApp() {
    gapi.hangout.onair.onYouTubeLiveIdReady.add(
        function(eventObject) {
        });

    gapi.hangout.onParticipantsChanged.add(
        function(eventObject) {
        });

    gapi.hangout.onair.onBroadcastingChanged.add(
        function(eventObject) {
        });

    gapi.hangout.onair.onNewParticipantInBroadcastChanged.add(
        function(eventObject) {
        });

    gapi.hangout.onTopicChanged.add(
        function(eventObject) {
        });

    gapi.hangout.onTopicChanged.add(
        function(eventObject) {
        });

}

function init() {
    // When API is ready...
    gapi.hangout.onApiReady.add(
        function(eventObj) {
            // TODO
            showOverlay();
        });
}

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);
