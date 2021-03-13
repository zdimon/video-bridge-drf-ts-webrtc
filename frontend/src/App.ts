import SocketConnection from './SocketConnection';


export default class App {


    initapp(username: string) {
        const wsconn: SocketConnection = new SocketConnection();
        wsconn.connect(username);
    }

}