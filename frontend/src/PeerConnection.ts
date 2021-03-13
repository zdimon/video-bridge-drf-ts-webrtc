
export class PeerConnection {

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

}