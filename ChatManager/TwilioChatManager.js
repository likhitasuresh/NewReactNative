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

        this.INITIAL_MESSAGE_TEXT = 'Hi! Join me in the chat!';
    }

    static create = (username) => {
        return new Promise((resolve,reject) => {
            resolve(new TwilioChatManager(username));
        });
    }

    /*
    Used to initialize chat items:
        client - twilio client used to listen for global events, and get newly added chat from the server.
        channel - used to lesten for the channel events, download users info, update message history.
                    stored inside ChannelItem along with channel sid.
        descriptors - have some info about channel, but is only used to get related channel here.
        chatItems - contains channel sid, downloaded history,and a preview object.
        chatPreview - the small amount of information related to the channel, used to display in the chat list.
    */
    loadChannels =  () => {
            console.log('Logged as: '+this.chatClient.user.identity);
            this.chatItems = [];
            this.chatClient.getUserChannelDescriptors().then((paginator) => {
                Promise.all(paginator.items).done((descriptors) => {
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
                                this.initChannelEvents(channel);

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
                                   if (typeof number === 'number')
                                       this.chatItems[i].chatPreview.unreadMessagesCount = number.toString();
                                   else
                                   {
                                       //TODO: handle this error
                                       this.chatItems[i].chatPreview.unreadMessagesCount = '0';
                                   }
                               });
                           }
                           console.log(this.chatItems);
                        });
                    });
                    this.setInitializationState(true);
                    //console.log('Even should shoot now:');
                });
            });
    }

    createNewChannel = (otherUser) => {
        const availableUsers = ['janesmith@nuleep-rec.com','joeruiz@nuleep-rec.com','annie@user.com','louis@nuleep-user.com'];

        if(availableUsers.indexOf(otherUser) !== -1)
        {
            if(this.userName !== otherUser)
            {
                if(!this.chatExists(otherUser))
                {
                    let taskPromise = [this.chatClient.createChannel({
                        isPrivate: true,
                        uniqueName: this.concatUserNames(otherUser)
                    })];

                    Promise.all(taskPromise).then(()=>{
                        taskPromise[0].then((channel) => {
                            this.channels.push(ChannelItem.createFromTwilioChannel(channel));

                            channel.join(this.userName).then(()=>{
                                let messagePromise = [];
                                let usersPromise = [];
                                let newChatItem = new ChatItem();
                                let newMessage = {
                                    sid: 'initial_message',
                                    index: 0,
                                    body: this.INITIAL_MESSAGE_TEXT,
                                    timestamp: new Date(),
                                    author: this.userName
                                };

                                channel.add(otherUser).then(()=>{
                                    messagePromise.push(channel.sendMessage(this.INITIAL_MESSAGE_TEXT));

                                    Promise.all(messagePromise).done(()=>{
                                        messagePromise[0].then((messageIndex) => {
                                            usersPromise.push(channel.getMembers());

                                            newChatItem.setChannelName(channel.uniqueName);
                                            newChatItem.setChannelSID(channel.sid);
                                            newChatItem.setMessageHistory([newMessage]);
                                            newChatItem.update();

                                            Promise.all(usersPromise).done(()=>{
                                                usersPromise[0].then((users) => {
                                                    Promise.all(users).done(()=>{
                                                        newChatItem.chatPreview.setMembers(users,this.userName);
                                                        this.initChannelEvents(channel);
                                                        this.chatItems.unshift(newChatItem);
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    })
                }
            }
        }
        else
        {
            console.log('User '+otherUser+' was not found!');
        }
    }

    initializeClient = (options={}) => {
        TwilioChatClient.create(this.accessToken,options).then((client) => {
            this.chatClient = client;
            this.subscribeForClientEvents();
        });
    };

    initChannelEvents = (channel) => {
        channel.on('messageAdded',this.updateChannelHistory);
    }

    updateChannelHistory = (message) => {
        console.log(message.author);
        let messageItem = MessageItem.createFromTwilioMessage(message);
        let channelSID = message.channel.sid;
        let chatItem = this.getChatItem(channelSID);

        console.log(messageItem);

        this.setAllMessagesConsumed(channelSID,messageItem.index);
        chatItem.messageHistory.unshift(messageItem);
        chatItem.update();
    }

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

    getChatItem = (channelSID) => {
        for(let i = 0;i < this.chatItems.length;i++) {
            if (this.chatItems[i].channelSID === channelSID){
                return this.chatItems[i];
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
                this.channels[i].channel.advanceLastConsumedMessageIndex(lastMessageIndex).then((number) => {
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

    //Generates the uniq name for a dialogue channel for now
    concatUserNames = (otherUser) => {
        let users = [this.userName,otherUser].sort();
        return users[0]+'*'+users[1];
    }

    //TODO: perhaps need to resubscribe after connection state changed
    subscribeForChannelEvent(channelSID,event,callback,subscriptionFlag){
        console.log('Got to subscribe');
        let that = this; //It refers to component
        if (!subscriptionFlag){
            let channel = that.getChannelBySID(channelSID);
            channel.on(event,callback);
            subscriptionFlag = true;
            console.log('Subscribed on channel: '+channelSID);
        }
    }

    //TODO: delete when events handeled properly
    ingestNewMessage = (channelSID,message,history,component) => {
        let messageItem = MessageItem.createFromTwilioMessage(message);

        console.log('Ingestion method in manager. (MANAGER)')
        console.log('New message index '+messageItem.index);
        console.log('New message is from '+messageItem.user);

        this.setAllMessagesConsumed(channelSID,messageItem.index);
        console.log('Message added to history form manager.');

        let chatItem = this.getChatItem(channelSID);

        history.unshift(messageItem);
        chatItem.update();

        component.setState({
            messages: history
        });
    }

    indexIsInHistory = (index,history) => {
        for (let i = 0;i<history.length;i++){
            if (history[i].index === index)
                return true;
        }
        return false;
    }

    chatExists = (otherUser) => {
        for(let i = 0;i<this.chatItems.length;i++){
            if(this.chatItems[i].chatPreview.interlocutor === otherUser){
                return true;
            }
        }
        return false;
    }

    refreshToken = (options={}) => {
        //TODO: checks on each of the steps needed.
        this.setNewToken();
        this.chatClient.updateToken(this.accessToken);
    };

    fetchNewToken = () => {
        //TODO: use gql to fetch the token
        if (this.userName === 'louis@nuleep-user.com')
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzliZmJjMWIxZjE5ZWExYzlmNDk2ZGY3OTYxODc4NmVhLTE2MDQ2MTgwNzYiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJsb3Vpc0BudWxlZXAtdXNlci5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjA0NjE4MDc2LCJleHAiOjE2MDQ2MzI0NzYsImlzcyI6IlNLOWJmYmMxYjFmMTllYTFjOWY0OTZkZjc5NjE4Nzg2ZWEiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.k_qhgCPNTLwfk00M5156pmyATNryYZMgc19TWw43Im4';
        else if (this.userName === 'janesmith@nuleep-rec.com')
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2IxNzNlYzI4OGZhZDk1YjgxMGFkMzQ0NTNjNDc3ZWVjLTE2MDQ2MjI3NjUiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJqYW5lc21pdGhAbnVsZWVwLXJlYy5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjA0NjIyNzY1LCJleHAiOjE2MDQ2MzcxNjUsImlzcyI6IlNLYjE3M2VjMjg4ZmFkOTViODEwYWQzNDQ1M2M0NzdlZWMiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.qi2tdKznwSnmJ3BNbo0Zdz99IopTPBENm6bNcXGD2KQ';
        else if (this.userName === 'joeruiz@nuleep-rec.com')
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzY5MTU3YjY0OTIxZmE4NWU1ZDY5ZmI4MWEyZTlhNzE4LTE2MDQ2MjI1OTgiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJqb2VydWl6QG51bGVlcC1yZWMuY29tIiwiY2hhdCI6eyJzZXJ2aWNlX3NpZCI6IklTN2Y1MTIyZmM3YWE3NGUwNWJmMDA1ODM1ZTUzZjU5OTcifX0sImlhdCI6MTYwNDYyMjU5OCwiZXhwIjoxNjA0NjM2OTk4LCJpc3MiOiJTSzY5MTU3YjY0OTIxZmE4NWU1ZDY5ZmI4MWEyZTlhNzE4Iiwic3ViIjoiQUNhNzZiM2ZlZmY2MGY4YjkxODU0YTYxYjMzZjY5NjVhNiJ9.EhJ5eAsutLgxI13vi41DL44xjweU7LChQm3rNmRCnPU';
        else if (this.userName === 'annie@nuleep-user.com')
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzFkNzY5YzBkOGM3ZDBiMGI1ZTg4MmU0N2VmY2Y3OWNkLTE2MDQ1MzMzMDkiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJhbm5pZUBudWxlZXAtdXNlci5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjA0NTMzMzA5LCJleHAiOjE2MDQ1NDc3MDksImlzcyI6IlNLMWQ3NjljMGQ4YzdkMGIwYjVlODgyZTQ3ZWZjZjc5Y2QiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.B1duwdvsX-YnhdgFwgVqudttwUK7TEDP8Ys-zdVK_Vk';
    };

    initialChatItemsSort = (chatItemA,chatItemB) => {
        return chatItemB.lastMessageDate - chatItemA.lastMessageDate;
    }

    sendMessage = (channelSID,message) => {
        this.chatClient.getChannelBySid(channelSID).then((channel) => {
            let sendingPromise = [channel.sendMessage(message)];
            Promise.all(sendingPromise).then(()=>{
                sendingPromise[0].then((result) => {
                    if (typeof result === 'number'){
                        //TODO: shoot success event
                        channel.advanceLastConsumedMessageIndex(result).then((result) => {
                            //Update the channel info: last message
                            //set last consumed index to result
                            console.log('Updated index on server: '+result.toString());
                        });
                    }
                    //TODO: check
                    // if result is number -> number is index of the new message
                    // oterwise error event
                    // Error
                    // or SessionError
                });
            })
        });
    }

    connectionChangedEvent = (connectionState) => {
        console.log('Connection changed: '+connectionState.toString());
        this.connectionState = connectionState;

        if(connectionState === 'connected'){
            this.eventEmitter.emit('client-connected');
            //this.deleteChannel();
            this.loadChannels();
        }
        else if (connectionState === 'connecting'){

        }
        console.log(this.chatClient);
    }

    subscribeForClientEvents = () => {
        /*-------TWILIO-------*/
        this.chatClient.on('connectionStateChanged', this.connectionChangedEvent);

        /*-------CUSTOM-------*/
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

    joinBothUsers = () => {
        this.chatClient.getChannelBySid('CH891cbd3784684e6bb46baca067e311e3').then((channel) =>{
            channel.sendMessage(this.INITIAL_MESSAGE_TEXT);
        });
    }

    deleteChannel = () =>{
        this.chatClient.getChannelByUniqueName('janesmith@nuleep-rec.com*joeruiz@nuleep-rec.com').then((channel)=>{
            channel.delete();
        });
        this.chatClient.getChannelByUniqueName('annie@user.com*janesmith@nuleep-rec.com').then((channel)=>{
                channel.delete();
        });
        this.chatClient.getChannelByUniqueName('annie@user.com*joeruiz@nuleep-rec.com').then((channel)=>{
            channel.delete();
        });

    }

}

export default TwilioChatManager;
