import { config } from './config';



export class PeerConnection {

    rtcConnection: any;

    constructor() {
        this.rtcConnection = new RTCPeerConnection(
            {
                iceServers: config.stun_servers
            }
        );
        this.rtcConnection.addEventListener('icecandidate', (e) => { this.onIceCandidate(e) })
    }

    async addIceCandidate(ice: string){
        const allice = JSON.parse(ice);
        if(allice !== null) {
            await this.rtcConnection.addIceCandidate(allice);
        }
        
    }

    onIceCandidate(e) {
        console.log(e);
        const url = `${config.serverURL}ice`;
        $.ajax({
            type: "POST",
            url: url,
            contentType: "application/json",
            data: JSON.stringify({
                'sid': window.sessionStorage.getItem('sid'),
                'ice': JSON.stringify(e.candidate)
            }),
                success: (data) => {
                    console.log(data);
                },
            });
    }

    setRemoteDescription(offer){
        this.rtcConnection.setRemoteDescription(offer);
    }

    setLocalDescription(offer){
        this.rtcConnection.setLocalDescription(offer);
    }

    async createAnwer(){
        return await this.rtcConnection.createAnswer();
    }

    async getmedia(): Promise<any>  {
        const constraints = {
            audio: false,
            video: true
        };
        try {

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            return stream;

        } catch(e) {
            console.log(e);
        }
    }

    async offer(tracks: any, localStream: any) {

        const offerOptions = {
            offerToReceiveAudio: 0,
            offerToReceiveVideo: 1,
            iceRestart: 1,
            voiceActivityDetection: 0
        };

        
        tracks.forEach((track) => this.rtcConnection.addTrack(track,localStream) );
        console.log('Creating offer!');
        const offer = await this.rtcConnection.createOffer(offerOptions);
        await this.rtcConnection.setLocalDescription(offer);

        const url = `${config.serverURL}offer`;
        $.ajax({
            type: "POST",
            url: url,
            contentType: "application/json",
            data: JSON.stringify({
                'sid': window.sessionStorage.getItem('sid'),
                'offer': JSON.stringify(offer),
                'reciever_login': $('#recieverLogin').val(),
                'type': 'sender'
            }),
                success: (data) => {
                    console.log(data);
                },
            });

            
    }

}