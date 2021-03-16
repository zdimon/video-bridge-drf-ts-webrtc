import { config } from './config';
import { PeerConnection } from './PeerConnection';
import SocketConnection from './SocketConnection';
 

export default class App {

    pcon: PeerConnection;
    scon: SocketConnection;
    tracks: any;
    stream: any;
    videotag: any;
    username: string;

    

    async initappSender(username: string) {
        this.username = username;
        this.scon = new SocketConnection();
        this.scon.connect(username);
        this.pcon = new PeerConnection();
        this.stream = await this.pcon.getmedia();
               


        this.scon.socket.on('reciever_answer', async (msg) => {
            // console.log('Answer from reciever');
            // console.log(msg);
            this.pcon.rtcConnection.setRemoteDescription(JSON.parse(msg.reciever_answer));
            // console.log(this.pcon);
        })

        this.scon.socket.on('calling', (msg) => {

            const tpl = `<div id="responseBox">
                <h1 id="callerName">${msg.login} is calling you!<h1>
                <input type="text" id="recieverLogin" value="${msg.login}">
                <video autoplay="true" width="200" id="myVideo" style="border: 1px solid red"></video>  
                <div style="text-align: center">              
                <a class="btn" id="acceptOffer">Accept</a>
                <a class="btn" id="declineOffer">Decline</a>
                </div>
            </div>`;
            $('#senderCam').html(tpl);
            $('#acceptOffer').on('click', (e) => {
                this.attachVideo();
                this.pcon.offer(this.tracks,this.stream);
            })  
        });

        this.scon.socket.on('ice_candidate', async (msg) => {
           await this.pcon.addIceCandidate(msg.ice);
        })

    }

    initappReciever(username: string){
        this.scon = new SocketConnection();
        this.scon.connect(username);
        this.pcon = new PeerConnection();
        $('#VideoCall').on('click', (e) => {
            this.callUser();
        })
        this.scon.socket.on('sender_offer', async (msg) => {
            // console.log(msg);
            this.pcon.setRemoteDescription(JSON.parse(msg.sender_offer))
            const answer = await this.pcon.createAnwer();
            this.pcon.setLocalDescription(answer);
            // console.log(answer);
            const url = `${config.serverURL}offer`;
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json",
                data: JSON.stringify({
                    'sid': window.sessionStorage.getItem('sid'),
                    'answer': JSON.stringify(answer),
                    'reciever_login': 'man',
                    'type': 'reciever'
                }),
                    success: (data) => {
                        console.log(data);
                    },
                });
            
        });

        this.scon.socket.on('ice_candidate', async (msg) => {
            await this.pcon.addIceCandidate(msg.ice);
        })

        this.pcon.rtcConnection.addEventListener('track', (e) => {
            console.log('We have got the video!!!');
            // console.log(e);
            const tpl = `<video autoplay="true" width="200" id="myVideo" style="border: 1px solid red"></video>`
            $('#recieverCam').html(tpl);
            this.videotag = document.querySelector('#myVideo');
            console.log(this.videotag);
            console.log(e.streams);
            this.videotag.srcObject = e.streams[0];
        })

    }

    attachVideo() {
        this.videotag = document.querySelector('#myVideo');
        this.tracks = this.stream.getVideoTracks();
        this.videotag.srcObject = this.stream;
    }

    callUser() {
        const url = `${config.serverURL}call`;
        const username =  $('#VideoCall').attr( "data-username" );
        // console.log(url);
        $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify({
                login: username,
                sid: window.sessionStorage.getItem('sid')
            }),
            contentType: "application/json",
            success: (response: any) => {
                // console.log(response);
            }
        }); 
    }


}