// Link to origin: https://i-invdn-com.investing.com/invwidgets/js/fxindex.js
var stream = "https://streaming.forexpros.com:443"
var pid_arr = ["pid-2186:", "isOpenPair-2186:"];
var TimeZoneID = 8
var sock = null;
//var server_heartbeat_interval = 5;
new_conn = function () {
  var options = {
    protocols_whitelist: [
      'websocket',
      'xdr-streaming',
      'xhr-streaming',
      'xdr-polling',
      'xhr-polling'],
    debug: true,
    jsessionid: false,
    server_heartbeat_interval: 4000,
    heartbeatTimeout: 2000
  };
  sock = new SockJS(stream + '/echo', null, options);
  var heartbeat, death;
  var events = {};
  function on(event, func) { events[event] = func; }

  var setHeartbeat = function () {
    clearTimeout(heartbeat);
    heartbeat = setTimeout(function () {
      sock.send(JSON.stringify({ _event: "heartbeat", data: 'h' }));
    }, 3000);
    death = setTimeout(function () {
      sock.close();
    }, 60000);
  };

  on("heartbeat", function (e, data) {
    clearTimeout(death);
    setHeartbeat();
  });

  sock.onopen = function () {
    setHeartbeat();
    jQuery.each(pid_arr, function (i, val) {
      sock.send(JSON.stringify({ _event: "subscribe", "tzID": TimeZoneID, "message": val }));
    }
    )
  };

  on("tick", function (e, data) {
    var content = JSON.parse(e.data);
    var result = content.message.split('::');
    var pid_obj = JSON.parse(result[1]);

    console.log("USD/RUB")
    // console.log(pid_obj)
    console.log(pid_obj.last_numeric)
  });

  sock.onmessage = function (e) {
    try {
      var data = JSON.parse(e.data);
      if (data._event == undefined)
        data._event = 'tick';
      (events[data._event] || noop)(e, data);
    } catch (err) {
      console.log('CATCH ERR ');
      console.log('CATCH ERR ' + err.message + e.data);
      sock.close();
      clearTimeout(death);
      new_conn();
    }
  };

  sock.onclose = function () {
    setTimeout(function () {
      console.log('retry');
      clearTimeout(death);
      new_conn();
    }, 3000);
  }
}

new_conn();




