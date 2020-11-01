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
        this.messageBatchSize = 5;

        this.chatItems = [];

        this.setNewToken();
        this.initializeClient();
    }

    static create = (username) => {
        return new Promise((resolve,reject) => {
            resolve(new TwilioChatManager(username));
        });
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
                                messageHistories.push(channel.getMessages(this.messageBatchSize));
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

    initializeClient = (options={}) => {
        TwilioChatClient.create(this.accessToken,options).then((client) => {
            this.chatClient = client;
            this.subscribeForClientEvents();
        });
    };

    /*---------------------- GETTERS --------------------------*/

    getMessagesFromChat = (channelSID) => {
        console.log('!!!Looking for channel: '+channelSID);
        for(let i = 0;i < this.chatItems.length;i++) {
            console.log('Current channel SID: '+this.chatItems[i].channelSID);
            if (this.chatItems[i].channelSID === channelSID){
                console.log('Cahnnel found');
                return this.chatItems[i].messageHistory;
            }
        }
        console.log('Channel was not found!');
    }

    getChatPreviews = () => {
        result = [];
        for(let i = 0;i<this.chatItems.length;i++)
            result.push(this.chatItems[i].chatPreview);
        return result;
    }

    getChatNames = () => {
        result = [];
        for(let i = 0;i<this.chatItems.length;i++)
            result.push(this.chatItems[i].channelName);
        return result;
    }


    /*---------------------- SETTERS --------------------*/

    setInitializationState = (state) =>{
        this.isInitialized = state;
    }

    setNewToken = () => {
        this.accessToken = this.fetchNewToken();
    };

    /*---------------------- AUXILLARY --------------------*/

    refreshToken = (options={}) => {
        //TODO: checks on each of the steps needed.
        this.setNewToken();
        this.chatClient.updateToken(this.accessToken);
    };

    fetchNewToken = () => {
        //TODO: use gql to fetch the token
        if (this.userName == 'louis@nuleep-user.com')
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2RhM2NkNzRhMTYwNGJhNzM3NDY2ZTRjMzA5MjM4NGU2LTE2MDQxOTc1OTEiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJsb3Vpc0BudWxlZXAtdXNlci5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjA0MTk3NTkxLCJleHAiOjE2MDQyMTE5OTEsImlzcyI6IlNLZGEzY2Q3NGExNjA0YmE3Mzc0NjZlNGMzMDkyMzg0ZTYiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.W8KLF-ib4l7Yx_yc1xkogCA28hXcaxv3ThlQoOsEhSI';
        else if (this.userName === 'janesmith@nuleep-rec.com')
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2RjYmI3YjEwZTdhNTViN2ZlZDI0ZDFlMDgwNzUyNmZhLTE2MDQyMDU0OTgiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJqYW5lc21pdGhAbnVsZWVwLXJlYy5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjA0MjA1NDk4LCJleHAiOjE2MDQyMTk4OTgsImlzcyI6IlNLZGNiYjdiMTBlN2E1NWI3ZmVkMjRkMWUwODA3NTI2ZmEiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.eOqplU7NnAWgJRJxE8UxkElIoGO0v-queKHiPnsdHT0';
    };

    sendMessage = (channelSID,message) => {
        console.log('Message sending is turned off');
        this.chatClient.getChannelBySid(channelSID).then((channel) => {
            channel.sendMessage(message).then((result) => {
                console.log('Trying send: '+message);
                if (typeof result === 'number'){
                    //TODO: shoot success event
                }
                //TODO: check
                // if result is number -> number is index of the new message
                // oterwise error event
                // Error
                // or SessionError
            });
        });
    }

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


    /* -------------------- TEST -------------------------- */

    inviteJane = () => {
        this.chatClient.getChannelBySid('CHb2184701ed364089912fd5212f88c2cb').then((channel) => {
           channel.invite("janesmith@nuleep-rec.com").then((result) => {
              console.log('Jane invited');
           });
        });
    }

    janeJoin = () => {
        this.chatClient.getChannelBySid('CHb2184701ed364089912fd5212f88c2cb').then((channel) => {
            channel.join().then((result) => {
                console.log('Jane joined');
            });
        });
    }

}

export default TwilioChatManager;
