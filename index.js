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

      if (active_calls.length > limit) {
        console.log('Length = ' + active_calls.length);
        console.log('Disconnecting longest-running call ' + util.inspect(active_calls));
        longest_call = active_calls[0];

        if(longest_call.connected) {
          longest_call.say("Sorry dude. Your call is being disconnected.").on('end', function() {
            longest_call.disconnect();
            call.connect(connectAddress);
          });
          call.autoConnect = false;
        }
        else {
          longest_call.disconnect();
          call.connect(connectAddress);
        }

      }
      else {
          call.connect(connectAddress);
      }

    });
    
    subscriber.on('call:connected', function(event) {
        var call = event.call;
        call.connected = true;
        setTimeout(function() {
    	    console.log('Notifying caller that call has exceeded guaranteed length');
          call.say("Due to high network usage, this call may be disconnected automatically.")
        }, timeout);
    });

    subscriber.on('call:end', function(event) {
      console.log('Call is hung up, removing from list of active calls');
      var call = event.call;
      var index = active_calls.indexOf(call);
      active_calls.splice(index, 1);
    });
});
