import { config } from './config';
import { PeerConnection } from './PeerConnection';
import SocketConnection from './SocketConnection';
 

export default class App {

    pcon: PeerConnection;
    scon: SocketConnection;
    tracks: any;
    stream: any;
    videotag: any;

    async initappSender(username: string) {
        this.scon = new SocketConnection();
        this.scon.connect(username);
        this.pcon = new PeerConnection();
        this.stream = await this.pcon.getmedia();
        $('#responseBox').on('click', (e) => {
            this.attachVideo();
        })        

    }

    initappReciever(username: string){
        this.scon = new SocketConnection();
        this.scon.connect(username);
        this.pcon = new PeerConnection();
        $('#callButton').on('click', (e) => {
            this.callUser();
        })


    }

    attachVideo() {
        this.videotag = document.querySelector('#myVideo');
        this.tracks = this.stream.getVideoTracks();
        this.videotag.srcObject = this.stream;
    }

    callUser() {
        const url = `${config.serverURL}call`;
        console.log(url);
        $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify({
                login: $('#CallUsername').val(),
                sid: window.sessionStorage.getItem('sid')
            }),
            contentType: "application/json",
            success: (response: any) => {
                console.log(response);
            }
        }); 
    }


}