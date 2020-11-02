import {Client as TwilioChatClient} from "twilio-chat";
import EventEmitter from "react-native-web/dist/vendor/react-native/emitter/EventEmitter";
import ChatItem from "./ChatItem";
import ChatPreview from "./ChatPreview";
import ChannelItem from "./ChanneItem";

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
        this.messageBatchSize = 25;

        this.chatItems = [];
        this.channels = [];

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
                        let channelUsersPromises = [];

                        for(let i = 0 ;i<channels.length;i++){
                            channels[i].then((channel) => {
                                this.channels.push(ChannelItem.createFromTwilioChannel(channel));
                                this.chatItems[i].setChannelSID(channel.sid);
                                this.chatItems[i].setChannelName(channel.uniqueName);

                                messageHistories.push(channel.getMessages(this.messageBatchSize));
                                channelUsersPromises.push(channel.getMembers());
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

                        Promise.all(channelUsersPromises).done(()=>{
                            for(let i = 0;i<channelUsersPromises.length;i++){
                                channelUsersPromises[i].then((channelMembers) => {
                                    this.chatItems[i].chatPreview.setMembers(channelMembers,this.userName);
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
        for(let i = 0;i < this.chatItems.length;i++) {
            if (this.chatItems[i].channelSID === channelSID){
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

    getChannelBySID = (channelSID) => {
        for(let i = 0;i<this.channels.length;i++){
            if (this.channels[i].sid === channelSID){
                return this.channels[i].channel;
            }
        }
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
        if (this.userName === 'louis@nuleep-user.com')
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2YwZDRkYTliNTIxMjkxMTVjNzQ3MjY0MGM1ZDJhMjM1LTE2MDQyNzA0MzMiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJsb3Vpc0BudWxlZXAtdXNlci5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjA0MjcwNDMzLCJleHAiOjE2MDQyODQ4MzMsImlzcyI6IlNLZjBkNGRhOWI1MjEyOTExNWM3NDcyNjQwYzVkMmEyMzUiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.EGbYE0Mbi8M2RStSjHuPSNpdT4eXdyMO9S_xWg19h_0';
        else if (this.userName === 'janesmith@nuleep-rec.com')
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzYwMjQzMzY0ZWFlYmRlMjNkZjgyMmQ3NTBhZjFiNWQwLTE2MDQyODE3ODAiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJqYW5lc21pdGhAbnVsZWVwLXJlYy5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjA0MjgxNzgwLCJleHAiOjE2MDQyOTYxODAsImlzcyI6IlNLNjAyNDMzNjRlYWViZGUyM2RmODIyZDc1MGFmMWI1ZDAiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.aOlWs86Cg3uLs3NB9InClHjcAc9kWq0zZcwk9uutNoc';
    };

    sendMessage = (channelSID,message,messageIndex) => {
        this.chatClient.getChannelBySid(channelSID).then((channel) => {
            channel.sendMessage(message).then((result) => {
                console.log('Trying send: '+message);
                if (typeof result === 'number'){
                    //TODO: shoot success event
                    console.log('Setting last message index: '+messageIndex.toString());
                    channel.updateLastConsumedMessageIndex(messageIndex).then((result) => {
                        //Update the channel info: last message
                        //set last consumed index to result
                        for(let i = 0;i < this.chatItems.length;i++){
                            if(this.chatItems[i].channelSID === channelSID){
                                this.chatItems[i].update();
                                console.log('Updated index: ');
                                console.log(messageIndex);
                            }
                        }
                    });
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
