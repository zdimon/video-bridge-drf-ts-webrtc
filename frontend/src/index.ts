// import $ from "jquery";

import  io  from "socket.io-client";

$('#my').html('Hello from jQuery');
$('#connectButton').on('click', () => {
    const socket = io('http://localhost:5001', {transports:['websocket']});
});
console.log($)