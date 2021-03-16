import  io  from "socket.io-client";

export default class SocketConnection {
    socket: any;
    connect(login: string) {
        this.socket = io('http://localhost:5001', {transports:['websocket']});

        this.socket.on('connect', () => {
            console.log('Connection was established');
            window.sessionStorage.setItem('sid',this.socket.id);
            this.socket.emit('login',{login});
        })    
        
        this.socket.on('calling', (msg) => {
            $('#responseBox').show();
            $('#callerName').html(msg.login);
            console.log(msg);
        });



    }

}