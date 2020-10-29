import {Client as TwilioChatClient} from "twilio-chat";
import EventEmitter from "react-native-web/dist/vendor/react-native/emitter/EventEmitter";

class TwilioChatManager
{
    //TODO: rewrite it into a singleton pattern
    constructor(userName)
    {
        this.accessToken = null;
        this.chatClient = null;
        this.connectionState = 'disconnected';
        this.userName = userName;
        this.eventEmitter = new EventEmitter();

        this.channels = [];

        this.setNewToken();
        this.initializeClient();
    }

    loadChannels = () => {
        this.channels = [];
        this.chatClient.getUserChannelDescriptors().then((peginator) => {
            let promisedLength = peginator.items.length;
            if(promisedLength > 0)
            {
                for(let i = 0;i<promisedLength;i++){
                    console.log('Downloading '+i.toString()+' channel.');
                    peginator.items[i].getChannel().then((channel) => {
                        this.channels.push(channel);
                    }).
                    then(() => {
                        if (i === promisedLength-1) {
                            console.log('Last channel downloaded.');
                            this.eventEmitter.emit('channels-loaded', {});
                            console.log('Load body manager:');
                            console.log(this.channels);
                        }
                    });
                }
            }
        });
    }



    fetchNewToken = () => {
        //TODO: use gql to fetch the token
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzY0ODUyYzFkOTUwMzZjMjVkMDYzNmI0YTU3ZTJhYzhiLTE2MDM5ODkxNTgiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJsb3Vpc0BudWxlZXAtdXNlci5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjAzOTg5MTU4LCJleHAiOjE2MDQwMDM1NTgsImlzcyI6IlNLNjQ4NTJjMWQ5NTAzNmMyNWQwNjM2YjRhNTdlMmFjOGIiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.JiqKhx9VB9OZ73zM4sh9BLlAkAxUbwRZcjx6wewksnM';
    };

    setNewToken = () => {
        this.accessToken = this.fetchNewToken();
    };

    refreshToken = (options={}) => {
        //TODO: checks on each of the steps needed.
        this.setNewToken();
        this.chatClient.updateToken(this.accessToken);
    };

    initializeClient = (options={}) => {
        TwilioChatClient.create(this.accessToken,options).then((client) => {
            this.chatClient = client;
            this.subscribeForClientEvents();
        });
    };

    connectionChangedEvent = (connectionState) => {
        console.log('Connection changed: '+connectionState.toString());
        this.connectionState = connectionState;

        if(connectionState === 'connected'){
            this.eventEmitter.emit('client-connected');
            this.loadChannels();
        }
        else if (connectionState === 'connecting'){

        }
        console.log(this.chatClient);
    }

    subscribeForClientEvents = () => {
        this.chatClient.on('connectionStateChanged', this.connectionChangedEvent);

    }

}

export default TwilioChatManager;
