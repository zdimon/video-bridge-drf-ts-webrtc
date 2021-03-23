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
                <video autoplay="true" width="200" id="myVideo"></video>  
                <div style="text-align: center">              
                <a class="btn" id="acceptOffer">Accept</a>
                <a class="btn" id="declineOffer">Decline</a>
                <a class="btn" style="display:none" id="stopVideo">Stop video</a>
                </div>
            </div>`;
            $('#senderCam').html(tpl);

            $('#stopVideo').on('click', (e) => {
                $('#senderCam').html('');
                const tracks = this.stream.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });
            })

            $('#acceptOffer').on('click', async (e) => {
                $('#acceptOffer').hide();
                $('#declineOffer').hide();
                $('#stopVideo').show();
                this.stream = await this.pcon.getmedia();
                this.attachVideo();
                this.pcon.offer(this.tracks,this.stream);
                const url = `${config.serverURL}status`;
                $.ajax({
                    type: "POST",
                    url: url,
                    contentType: "application/json",
                    data: JSON.stringify({
                        'sid': window.sessionStorage.getItem('sid'),
                        'status':'beasy'
                    }),
                        success: (data) => {

                        },
                });
            })  
            $('#declineOffer').on('click', async (e) => {
                
                const url = `${config.serverURL}decline`;
                $.ajax({
                    type: "POST",
                    url: url,
                    contentType: "application/json",
                    data: JSON.stringify({
                        'sid': window.sessionStorage.getItem('sid'),
                        'reciever_login': $('#recieverLogin').val()
                    }),
                        success: (data) => {
                            console.log(data);
                            $('#senderCam').html('');
                        },
                });
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

        this.scon.socket.on('decline', async (msg) => {
            $('#VideoCall').html('Rejected!');
        });
        this.scon.socket.on('sender_offer', async (msg) => {
            // console.log(msg);
            
            $('#recieverCam').show();
            $('#VideoCall').html('Abonent accepted the call...');
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
            $('#VideoCall').hide();
            // console.log(e);
            const tpl = `
            <div id="videoDrag">Click here to move</div>
            <video autoplay="true" id="myVideo" ></video>
            <div> <a class="btn" id="closeVideo">Close video</a> </div>`
            $('#recieverCam').html(tpl);
            this.dragElement();
            this.videotag = document.querySelector('#myVideo');
            console.log(this.videotag);
            console.log(e.streams);
            this.videotag.srcObject = e.streams[0];
            $('#closeVideo').on('click', () => {
                $('#recieverCam').html('');
                $('#recieverCam').hide();
            })
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
        
        $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify({
                login: username,
                sid: window.sessionStorage.getItem('sid')
            }),
            contentType: "application/json",
            success: (response: any) => {
                if(response.status === 0) {
                    $('#VideoCall').html(response.message);
                } else {
                    alert(response.message);
                }
                
            }
        }); 
    }

    dragElement() {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        var elmnt = document.getElementById("videoDrag");
        var drgel = document.getElementById("recieverCam");
        elmnt.onmousedown = dragMouseDown;
        
      
        function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          // get the mouse cursor position at startup:
          pos3 = e.clientX;
          pos4 = e.clientY;
          console.log(e.clientX);
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag;
        }
      
        function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          // calculate the new cursor position:
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          // set the element's new position:
          drgel.style.top = (drgel.offsetTop - pos2) + "px";
          drgel.style.left = (drgel.offsetLeft - pos1) + "px";
        }
      
        function closeDragElement() {
          // stop moving when mouse button is released:
          document.onmouseup = null;
          document.onmousemove = null;
        }
      }


}