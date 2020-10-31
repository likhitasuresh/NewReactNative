import {Client as TwilioChatClient} from "twilio-chat";
import EventEmitter from "react-native-web/dist/vendor/react-native/emitter/EventEmitter";
import ChatItem from "./ChatItem";
import ChatPreview from "./ChatPreview";

class TwilioChatManager
{
    //TODO: rewrite it into a singleton pattern
    constructor(userName)
    {
        this.accessToken = null;
        this.chatClient = null;
        this.userName = userName;
        this.eventEmitter = new EventEmitter();
        this.isInitialized = false;

        this.chatItems = [];

        this.setNewToken();
        this.initializeClient();
    }

    static create = (username) => {
        return new Promise((resolve,reject) => {
            resolve(new TwilioChatManager(username));
        });
    }

    getMessagesFromChat = (channelSID) => {
        console.log('Looking for channel: '+channelSID);
        for(let i = 0;i < this.chatItems.length;i++) {
            if (this.chatItems[i].channelSID === channelSID)
                console.log('Cahnnel found');
                return this.chatItems[i].messageHistory;
        }
        console.log('Channel was not found!');
    }

    //TODO: add unConsumedLogic
    loadChannels =  () => {
            this.chatItems = [];
            this.chatClient.getUserChannelDescriptors().then((paginator) => {
                Promise.all(paginator.items).then((descriptors) => {
                    let channels = [];
                    for(let i = 0;i<descriptors.length;i++)
                    {
                        this.chatItems.push(new ChatItem());
                        channels.push(descriptors[i].getChannel());
                    }
                    Promise.all(channels).then(() => {
                        let messageHistories = [];
                        for(let i = 0 ;i<channels.length;i++){
                            channels[i].then((channel) => {
                                this.chatItems[i].setChannelSID(channel.sid);
                                this.chatItems[i].setChannelName(channel.uniqueName);
                                messageHistories.push(channel.getMessages());
                            });
                        }

                        Promise.all(messageHistories).then(()=>{
                            for(let i = 0;i<messageHistories.length;i++){
                                messageHistories[i].then((messageHistory) => {
                                    Promise.all(messageHistory.items).then((messages) => {
                                        this.chatItems[i].setMessageHistory(messages);
                                        this.chatItems[i].update();
                                    });
                                });

                            }
                        });
                        console.log(this.chatItems);
                        this.setInitializationState(true);
                        this.eventEmitter.emit('channels-loaded', {});
                    });
                });
            });
    }

    getChatPreviews = () => {
        result = [];
        for(let i = 0;i<this.chatItems.length;i++)
            result.push(this.chatItems[i].chatPreview);
        return result;
    }

    setInitializationState = (state) =>{
        this.isInitialized = state;
    }

    fetchNewToken = () => {
        //TODO: use gql to fetch the token
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzQ2OWU2YWVhOTRiYTJjZjgxZDJkZGMwNDY0ZWYyNzY4LTE2MDQxODMxMDIiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJsb3Vpc0BudWxlZXAtdXNlci5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjA0MTgzMTAyLCJleHAiOjE2MDQxOTc1MDIsImlzcyI6IlNLNDY5ZTZhZWE5NGJhMmNmODFkMmRkYzA0NjRlZjI3NjgiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0._FR4TOkWkzjzCG2--JXUGz6Qn4Hdz7EHct1lbxYDLI8';
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
