var ovapp = {
    OPENVIDU_SERVER_URL: 'https://localhost:4443',
    OPENVIDU_SERVER_SECRET: 'MY_SECRET',
    SOCKET_URL: 'http://localhost:5001',
    SERVER_URL: 'http://localhost:8000',
    USERNAME: '',

    initappReciever: function(username){
        console.log('Init reciever app');
        this.USERNAME = username;
        this.socketConnect(username);

        // check online
        const url = `${this.SERVER_URL}/online`;
        $.ajax({
            type: "GET",    
            url: url,
            contentType: "application/json",
                success: (data) => {
                    data.payload.forEach(element => {
                        var btn = $('#VideoCall');
                        if(btn.attr('data-username') === element) {
                            btn.html('<span>Webcam</span>'); 
                            btn.css("background-color","green");
                            btn.on('click', (e) => {
                                var user = btn.attr('data-username');
                                OV = new OpenVidu();
                                session = OV.initSession();
                                this.getToken(user).then(function(token) {
                                    session.connect(token, { })   
                                    session.on('streamCreated', event => {
                                        console.log('!!!!!!!!!!!!!!!!!!!!!!');
                                        $('#recieverCam').show();
                                        var subscriber = session.subscribe(event.stream, 'recieverCam');
                            
                                    });
                                });
                    
                                console.log('calling');
                                this.callUser();
                            })
                        } 
                        
                    });
                    
                },
        });
        

    },

    socketConnect: function(login) {
        socket = io(`${this.SOCKET_URL}`, {transports:['websocket']});
        socket.on('connect', () => {
            console.log('Connection was established');
            window.sessionStorage.setItem('sid',socket.id);
            socket.emit('login',{login});
        })            
    },

    callUser: function() {
        const url = `${this.SERVER_URL}/call`;
        const username =  $('#VideoCall').attr( "data-username" );
        $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify({
                login: username,
                sid: window.sessionStorage.getItem('sid')
            }),
            contentType: "application/json",
            success: (response) => {
                if(response.status === 0) {
                    $('#VideoCall').html(response.message);
                } else {
                    alert(response.message);
                }
                
            }
        }); 
    },

    initSenderVideo: function(videoElement) {
        document.querySelector('#myVideo').srcObject = videoElement.srcObject;
        document.querySelector('#myVideo')['muted'] = true;
    },

    initappSender: function(username) {
        this.socketConnect(username);
        this.USERNAME = username;
        socket.on('calling', (msg) => {

            const tpl = `<div id="responseBox">
                <h1 id="callerName">${msg.login} is calling you!<h1>
                <input type="text" id="recieverLogin" value="${msg.login}">
                <div id="video-container"></div>
               
                <div style="text-align: center">              
                <a class="btn" id="acceptOffer">Accept</a>
                <a class="btn" id="declineOffer">Decline</a>
                <a class="btn" style="display:none" id="stopVideo">Stop video</a>
                </div>
            </div>`;
            $('#senderCam').html(tpl);
            $('#senderCam').show();
            $('#declineOffer').on('click', async (e) => {
                const url = `${this.SERVER_URL}/decline`;
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
            });
            
            $('#acceptOffer').on('click', async (e) => {
                $('#acceptOffer').hide();
                $('#declineOffer').hide();
                $('#stopVideo').show();
                $('#callerName').html('Click here to move');

                OV = new OpenVidu();
                session = OV.initSession();
                this.getToken(this.USERNAME).then(function(token) {
                    session.connect(token, { })
                    .then(() => {
                        console.log('ov created!!!!!!!');
                        var publisher = OV.initPublisher('video-container', {
                            audioSource: undefined, 
                            videoSource: undefined, 
                            publishAudio: true, 
                            publishVideo: true, 
                            resolution: '640x480', 
                            frameRate: 30,
                            insertMode: 'APPEND',
                            mirror: false
                        });
                        publisher.on('videoElementCreated', function (event) {
                            //this.initSenderVideo(event.element);
                            event.element['muted'] = true;
                        });
                        session.publish(publisher);
                        
                    })
                });
                this.dragElement('videoDrag','recieverCam');
                // this.dragElement('callerName','senderCam');
                // this.stream = await this.pcon.getmedia();
                // this.attachVideo();
                // this.pcon.offer(this.tracks,this.stream);
                const url = `${this.SERVER_URL}/status`;
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
            });


        });


    },

    initSenderVideo: function (videoElement) { 
        console.log('add video');
        console.log(document.querySelector('#myVideo'));
        document.querySelector('#myVideo').srcObject = videoElement.srcObject;
        document.querySelector('#myVideo')['muted'] = true;
    },

    createSession: function (sessionId) { 
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: this.OPENVIDU_SERVER_URL + "/openvidu/api/sessions",
                data: JSON.stringify({ customSessionId: sessionId }),
                headers: {
                    "Authorization": "Basic " + btoa("OPENVIDUAPP:" + this.OPENVIDU_SERVER_SECRET),
                    "Content-Type": "application/json"
                },
                success: response => resolve(response.id),
                error: (error) => {
                    if (error.status === 409) {
                        resolve(sessionId);
                    } else {
                        console.warn('No connection to OpenVidu Server. This may be a certificate error at ' + this.OPENVIDU_SERVER_URL);
                        if (window.confirm('No connection to OpenVidu Server. This may be a certificate error at \"' + this.OPENVIDU_SERVER_URL + '\"\n\nClick OK to navigate and accept it. ' +
                            'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' + this.OPENVIDU_SERVER_URL + '"')) {
                            location.assign(this.OPENVIDU_SERVER_URL + '/accept-certificate');
                        }
                    }
                }
            });
        });
    },
    


    createToken: function (sessionId) { 
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                url: this.OPENVIDU_SERVER_URL + '/openvidu/api/sessions/' + sessionId + '/connection',
                data: JSON.stringify({}),
                headers: {
                    'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + this.OPENVIDU_SERVER_SECRET),
                    'Content-Type': 'application/json',
                },
                success: (response) => resolve(response.token),
                error: (error) => reject(error)
            });
        });
    },

    getToken: function(mySessionId) {
        return this.createSession(mySessionId).then(sessionId =>     this.createToken(sessionId));
    },

    dragElement: function(elid, drid) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        var elmnt = document.getElementById(elid);
        var drgel = document.getElementById(drid);
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