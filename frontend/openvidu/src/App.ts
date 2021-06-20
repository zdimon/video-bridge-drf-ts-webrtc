import { config } from './config';
import { OpenVidu } from 'openvidu-browser';


export default class App {

    OV: any;
    initappSender(uname: string): any {
        this.OV = new OpenVidu();
    }

    
}
