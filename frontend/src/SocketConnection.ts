import  io  from "socket.io-client";

export default class SocketConnection {

    connect(login: string) {
        const socket = io('http://localhost:5001', {transports:['websocket']});

        socket.on('connect', () => {
            console.log('Connection was established');
            window.sessionStorage.setItem('sid',socket.id);
            socket.emit('login',{login});
        })    
        
        socket.on('calling', (msg) => {
            $('#responseBox').show();
            $('#callerName').html(msg.login);
            console.log(msg);
        });

    }

}