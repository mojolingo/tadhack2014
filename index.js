var tropo = require('tropo');
var active_calls = [];
var limit = 3;

tropo.on('subscribe', function (event) {

    var subscriber = event.subscriber;
    subscriber.on('call:incoming', function (event) {
    	
    	console.log('Received incoming call');

      active_calls.push(event.call);

      if (active_calls.length >= limit) {
        console.log('Disconnecting longest-running call');
        longest_call = active_calls.shift();
        // TODO Find the caller's peer and copy this notification
        longest_call.say("This call will now be disconnected.");
        longest_call.hangup();
      }
    });
    
    subscriber.on('call:connected', function(event) {
        var call = event.call;
        setTimeout(function() {
    	    console.log('Notifying caller that call has exceeded guaranteed length');
          // Minimum guaranteed time is 30 seconds
          call.say("Due to network usage, this call may be disconnected automatically.")
        }, 30000);
    });

    subscriber.on('call:disconnected', function(event) {
      console.log('Call is hung up, removing from list of active calls');
      var call = event.call;
      var index = active_calls.indexOf(call);
      active_calls.splice(index, 1);
    });
});
