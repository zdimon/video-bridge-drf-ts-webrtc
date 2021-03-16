import { config } from './config';
import  io  from "socket.io-client";

export default class SocketConnection {
    socket: any;
    connect(login: string) {
        this.socket = io(`${config.socketURL}`, {transports:['websocket']});

        this.socket.on('connect', () => {
            console.log('Connection was established');
            window.sessionStorage.setItem('sid',this.socket.id);
            this.socket.emit('login',{login});
        })    
        




    }

}