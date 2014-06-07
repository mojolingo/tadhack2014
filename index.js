var tropo = require('tropo');
var util = require('util');
var active_calls = [];
var limit = 1;
var timeout = 5000;

tropo.on('subscribe', function (event) {

    var subscriber = event.subscriber;
    subscriber.on('call:incoming', function (event) {
    	
      console.log('Received incoming call');

      var call = event.call;
      var number = call.to.substr(0,call.to.indexOf('@'));
      var connectAddress = 'sip:' + number + '@192.168.50.100:5080';

      active_calls.push(event.call);

      call.connections[0].on('disconnected', function() {
        console.log('Call is hung up, removing from list of active calls');
        var index = active_calls.indexOf(call);
        active_calls.splice(index, 1);
      });

      if (active_calls.length > limit) {
        console.log('Length = ' + active_calls.length);
        console.log('Disconnecting longest-running call ' + util.inspect(active_calls));
        longest_call = active_calls[0];
        // TODO Find the caller's peer and copy this notification
        longest_call.say("This call will now be disconnected.").on('end', function() {
          longest_call.disconnect();
          call.connect(connectAddress);
        });
        call.autoConnect = false;
      }
      else {
          call.connect(connectAddress);
      }

    });
    
    subscriber.on('call:connected', function(event) {
        var call = event.call;
        setTimeout(function() {
    	    console.log('Notifying caller that call has exceeded guaranteed length');
          call.say("Due to network usage, this call may be disconnected automatically.")
        }, timeout);
    });

});
