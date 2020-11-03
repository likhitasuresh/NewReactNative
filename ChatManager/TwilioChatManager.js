import {Client as TwilioChatClient} from "twilio-chat";
import EventEmitter from "react-native-web/dist/vendor/react-native/emitter/EventEmitter";
import ChatItem from "./ChatItem";
import ChatPreview from "./ChatPreview";
import ChannelItem from "./ChanneItem";
import MessageItem from "./MessageItem";

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
                        let unreadMessageCountPromises = [];

                        for(let i = 0 ;i<channels.length;i++){
                            channels[i].then((channel) => {
                                this.channels.push(ChannelItem.createFromTwilioChannel(channel));
                                this.chatItems[i].setChannelSID(channel.sid);
                                this.chatItems[i].setChannelName(channel.uniqueName);

                                messageHistories.push(channel.getMessages(this.messageBatchSize));
                                channelUsersPromises.push(channel.getMembers());
                                unreadMessageCountPromises.push(channel.getUnconsumedMessagesCount());
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

                        Promise.all(unreadMessageCountPromises).then(()=>{
                           for(let i = 0;i<unreadMessageCountPromises.length;i++){
                               unreadMessageCountPromises[i].then((number) =>{
                                   //console.log('Unconsumed: ');
                                   //console.log(number);

                                   if (typeof number === 'number')
                                       this.chatItems[i].chatPreview.unreadMessagesCount = number.toString();
                                   else
                                   {
                                       //TODO: handle this error
                                       this.chatItems[i].chatPreview.unreadMessagesCount = '0';
                                   }
                               });
                           }
                        });
                    });
                    this.setInitializationState(true);
                    //console.log('Even should shoot now:');
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
        let result = [];
        for(let i = 0;i<this.chatItems.length;i++)
            result.push(this.chatItems[i].chatPreview);
        if(result.length >= 2)
            return result.sort(this.initialChatItemsSort);
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
            if (this.channels[i].channel.sid === channelSID){
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

    setAllMessagesConsumed = (channelSID,lastMessageIndex) =>{
        for(let i = 0;i<this.channels.length;i++){
            if(this.channels[i].channelSID === channelSID){
                this.channels[i].channel.updateLastConsumedMessageIndex(lastMessageIndex).then((number) => {
                    if (typeof number === 'number'){
                        // Successfull update
                    }
                    else
                    {
                        console.log('Error in Managed::setALlMessagesConsumed');
                    }
                })
            }
        }
    }



    /*---------------------- AUXILLARY --------------------*/

    subscribeForChannelEvent(channelSID,event,callback){
        console.log('Got to subscribe');
        console.log(callback);
        let channel = this.getChannelBySID(channelSID);
        channel.on(event,callback);
    }

    ingestNewMessage = (channelSID,message,history) => {
        if(message.author !== this.userName){
            console.log('New message is not by author.');

            let messageItem = MessageItem.createFromTwilioMessage(message);
            this.setAllMessagesConsumed(channelSID,messageItem.index);
            history.unshift(messageItem);
            return true;
        }
        return false;
    }

    refreshToken = (options={}) => {
        //TODO: checks on each of the steps needed.
        this.setNewToken();
        this.chatClient.updateToken(this.accessToken);
    };

    fetchNewToken = () => {
        if (this.userName === 'louis@nuleep-user.com')
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzBmODI0NTYxMGVjMzU0Zjk3MTE3ODc0NTMyMTFlNTQzLTE2MDQzNjQ3MDciLCJncmFudHMiOnsiaWRlbnRpdHkiOiJsb3Vpc0BudWxlZXAtdXNlci5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjA0MzY0NzA3LCJleHAiOjE2MDQzNzkxMDcsImlzcyI6IlNLMGY4MjQ1NjEwZWMzNTRmOTcxMTc4NzQ1MzIxMWU1NDMiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.BEALK-42tUVBvweYNAVAyR1atkByA2drgZOTYNbAviw';
        else if (this.userName === 'janesmith@nuleep-rec.com')
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzhiMWRjMTc3NTBiZDcwMGNlNDI1MTY4ZTliNGUxOWQxLTE2MDQzNjAzOTYiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJqYW5lc21pdGhAbnVsZWVwLXJlYy5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjA0MzYwMzk2LCJleHAiOjE2MDQzNzQ3OTYsImlzcyI6IlNLOGIxZGMxNzc1MGJkNzAwY2U0MjUxNjhlOWI0ZTE5ZDEiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.YWDWZhFOcNCUTn9HwtldADXvsCcPQASiVkXuP8LTdfg';
    };

    initialChatItemsSort = (chatItemA,chatItemB) => {
        return chatItemB.lastMessageDate - chatItemA.lastMessageDate;
    }

    sendMessage = (channelSID,message,messageIndex) => {
        this.chatClient.getChannelBySid(channelSID).then((channel) => {
            channel.sendMessage(message).then((result) => {
                //console.log('Trying send: '+message);
                if (typeof result === 'number'){
                    //TODO: shoot success event
                    //console.log('Setting last message index: '+messageIndex.toString());
                    channel.updateLastConsumedMessageIndex(messageIndex).then((result) => {
                        //Update the channel info: last message
                        //set last consumed index to result
                        for(let i = 0;i < this.chatItems.length;i++){
                            if(this.chatItems[i].channelSID === channelSID){
                                this.chatItems[i].update();
                                //console.log('Updated index: ');
                                //console.log(messageIndex);
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

        this.eventEmitter.addListener('channels-loaded',()=>{console.log('Channels loaded event.');});
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
