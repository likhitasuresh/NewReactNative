import {Client as TwilioChatClient} from "twilio-chat";
//import EventEmitter from "react-native";
import EventEmitter from "react-native-web/dist/vendor/react-native/emitter/EventEmitter";

class TwilioChatManager
{
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
            if(peginator.items.length > 0)
            {
                for(let i = 0;i<peginator.items.length;i++){
                    peginator.items[i].getChannel().then((channel) => {
                        this.channels.push(channel);
                    });
                }
                console.log('Manager:');
                console.log(this.channels);
                this.eventEmitter.emit('channels-loaded',{});
            }
        });
    }

    fetchNewToken = () => {
        //TODO: use gql to fetch the token
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzJjODcyZTQyNWNhMDBlZjFhNzdkZDY1MGY4NjgzMDY5LTE2MDM5NDI5MDUiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJsb3Vpc0BudWxlZXAtdXNlci5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjAzOTQyOTA1LCJleHAiOjE2MDM5NTczMDUsImlzcyI6IlNLMmM4NzJlNDI1Y2EwMGVmMWE3N2RkNjUwZjg2ODMwNjkiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.-ucepW-ERv6AYL5OdpmrVueUzkUZjbhPtryUalqSq5I';
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
            this.loadChannels();

            this.eventEmitter.emit('client-connect');
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
