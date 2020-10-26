import React, {Component} from 'react';
// import { Platform, StyleSheet, View, Image} from 'react-native';
// impor t { Card, ListItem, Button, Icon, SearchBar,  Avatar, Badge } from 'react-native-elements';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Badge } from 'native-base';
import { event } from 'react-native-reanimated';
import {users} from '../Data/users';
import { LogBox } from 'react-native';
import {Client as TwilioChatClient} from "twilio-chat";

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]);

class Chat extends Component {
    //TODO: Initialiaze client here, load the channels list, subscribe for events listening.
    constructor(props){
        super(props);
        this.navigate = this.props.navigation.navigate;
        this.state = {
            search: '',
            read: null,
            newMessages: 0,
            users: users,
            chatClient: {},
            channelsList: null
        };

        //TODO: Be able 1)to get username
        //              2)to fetch twilio accessToken from backend
        //              3)create chat client - X
        //              4)update UI (load all the chats, new messages etc.)
        //                  a.Sort channels by message date (somehow) :
        //                  channels have uniq and friendly names, we want to display name of the person we are chatting with
        //                  this we have to save the info in the descriptor somehow. How can we do that and be able to dispay proper name for each
        //                  person in the dialogue
        //              5)subscribe for all needed events
        this.userEmail = 'louis@nuleep-user.com';
        this.connectMessagingClient(
            this.getToken(this.userEmail));
        //this.loadChannelList();


        //let test = this.state.chatClient.getUserChannelDescriptors();
        //TEST PART!!! HAZARDOUS
        //this.TEST_create_channel('janesmith@nuleep-rec.com');
        //
    }

    getToken = (userName) => {
      //TODO: use gql to fetch the token
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2JiZDMyMTdiMGVhMTAzZDBiMDc1ZmE2NmFjM2IyNGYxLTE2MDM2NzQ3OTgiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJsb3Vpc0BudWxlZXAtdXNlci5jb20iLCJjaGF0Ijp7InNlcnZpY2Vfc2lkIjoiSVM3ZjUxMjJmYzdhYTc0ZTA1YmYwMDU4MzVlNTNmNTk5NyJ9fSwiaWF0IjoxNjAzNjc0Nzk4LCJleHAiOjE2MDM2ODkxOTgsImlzcyI6IlNLYmJkMzIxN2IwZWExMDNkMGIwNzVmYTY2YWMzYjI0ZjEiLCJzdWIiOiJBQ2E3NmIzZmVmZjYwZjhiOTE4NTRhNjFiMzNmNjk2NWE2In0.PVNHGK2tMmPoIw7v8zVpNyesXImiYd0D--wW68u-48E';
    };

    connectMessagingClient =  (accessToken) => {
        TwilioChatClient.create(accessToken).then((client) => {
            this.state.chatClient = client;
            //TODO: 1)subscribe to all needed events
            this.state.chatClient.on('tokenExpired',this.refreshToken);
            this.state.chatClient.on('channelAdded',() => {});
            this.state.chatClient.on('channelRemoved',() => {});
        });
    };

    refreshToken = () => {
        this.state.chatClient.updateToken(
            this.getToken(this.userEmail));
    };

    TEST_create_channel = (otherUserEmail) => {
        let channel_name = this.getUniqueChannelName(this.userEmail,otherUserEmail);
        let channel_exists = false;
        //TODO: check if the channel exists and try connect to it,
        // create new otherwise.
        for(let i = 0;i<this.state.channelsList.length;i++)
        {
            if(this.state.channelsList[i].uniqueName === channel_name)
            {
                channel_exists = true;
                break;
            }
        }
        //TODO: rewrite creation.
        if(!channel_exists)
        {
            let newChannel = this.state.chatClient.createChannel({
                uniqueName: channel_name,
                friendlyName: 'test_ilia_suki',
                isPrivate: true
            });
            newChannel.invite(otherUserEmail);
        }
        //TODO: start listening for the events
        this.state.chatClient.on('messageAdded',() => {});
    };

    getUniqueChannelName = (userEmail_a,userEmail_b) => {
        //Creates unique chat name that contains both user names in a uniform way.
        let user_list = [userEmail_a,userEmail_b].sort();
        return user_list.join('*');
    };

    loadChannelList = () => {
      //Loads the channels user is subscribed to
      //Sorts them with accordance to the last message in the channel
      if (this.state.chatClient == undefined)
      {
          //TODO: except
      }

      this.state.chatClient.getUserChannelDescriptors().then((channelDescriptiors) => {
              //TODO: 1)sortChannels by the date of the last received message
              //      2)We might want use this part of code but with different handlers.
              //      3)Assign the state chat list with the channels (perhaps have the dict of format channel:displayed name)
              //sortByLastMsgDate(channels);
              //fetchDialogueName(channels);
              //stripAndOtherPreprocessing(channels);
              for(let i = 0;i<channelDescriptiors.length;i++)
              {
                  this.state.channelsList.push(channelDescriptiors[i]);
              }
              this.state.channelsList.sort((channel_a,channel_b) =>
                  (channel_a.lastMessage.dateCreated > channel_b.lastMessage.dateCreated) ? 1:
                      (channel_b.lastMessage.dateCreated > channel_a.lastMessage.dateCreated ? -1 : 0));

          });
    };

    insertSortChannelsByMessageDate = (channels) => {
        //Implimentation of insertion sort for to display the
        //channels having the latest messages first.
        //IMPORTANT: Use only to update UI - use built-in sort to initialize.
        let length = channels.length;
        for (let i = 1; i < length; i++) {
            let currentChannel = channels[i];
            let j = i - 1;
            while (j >= 0 && channels[j].lastMessage.dateCreated > currentChannel.lastMessage.dateCreated)
            {
                channels[j + 1] = channels[j];
                j = j - 1;
            }
            channels[j + 1] = currentChannel;
        }
        return channels;
    };

    getInterlocutorName = (channel) => {
        //Extract interlocutor userId from the channel name.
        let locutors = channel.uniqueName.split('*');
        return locutors.some((locutor) => locutor !== this.userEmail);
    }

    getConsumtionState = (channel) => {
        //True if all the messages in the channel have been read,
        // false otherwise.
        try
        {
            let unConsumedMessages = channel.getUnconsumedMessagesCount();
            return true;
        }
        catch (exception)
        {
            return false;
        }
    }

    getUnconsumedMessagesNumber = (channel) => {
        //Returns the number of unread messages in the channel.
        try
        {
            let unConsumedMessages = channel.getUnconsumedMessagesCount().toString();
            return unConsumedMessages;
        }
        catch (exception)
        {
            return '0';
        }
    }

    getLastMessage = (channel) => {
        //Returns the text of the last message,
        // 'Chat is empty' otherwise.
        try
        {
            return channel.getMessages(1);
        }
        catch (exception)
        {
            return 'Chat is empty';
        }
    }

    //TODO: what to return if no messages exist in the chat?
    getLastMessageDate = (channel) =>
    {
        //Returns the date the last nessage in the chat was created,
        //otherwise ???
        try
        {
            return channel.lastMessage.dateCreated;
        }
        catch (exception)
        {
            return '';
        }
    }

    //TODO: what if there is no messages in the channel?
    getMessageBatch = (channel,batchSize=30) =>
    {
        //Loads a batch of batchSize last messages in the channel,
        //otherwise ???
        try
        {
            return channel.getMessages(batchSize);
        }
        catch (exception)
        {
            return '';
        }
    }

    updateSearch = (search) => {
        this.setState({ search });
    };

    openDetailedChatView = (name, messages, channel) => {
        // navigation.setParams({ title: name })
        this.navigate('NewChat', {
            name: name,
            messages: messages,
            channel: channel,
            usersAppendMessage: (messages, i) => this.appendMessage(messages, i),
            index: i
          });
    }

    appendMessage(messages, i){
        this.setState((state) => {
            state.users[i].messages.unshift(messages);
            // console.log(state.users[i].messages);
            return state;
        })
    }

    static navigationOptions = {
        title: 'Chat',
        headerStyle: {
            backgroundColor: '#03A9F4',
            },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            },
        };

    render() {
        const { search } = this.state;
        return (
            <Container>
                <List>
                {
                    //TODO: map this.state.channelsList the similar view
                    //      pass channel to the NewChat component
                    //      initialize the components with channel metadata:
                    //          interlocutor name -> getInterlocutorName(channel)
                    //          unread messages budge -> getUnconsumedMessagesNumber(channel)
                    //          unread state -> getConsumtionState(channel)
                    //          last message text -> getLastMessageText(channel)
                    //          last messgae date -> getLastMessageDate(channel)
                    //          load first batch of messages -> getMessageBatch(channel,batchSize=30)
                    this.state.channelsList.map((channel) => {
                        return (
                            <ListItem key={i} avatar onPress={ () => {
                                this.openDetailedChatView(this.getInterlocutorName(channel),this.getMessageBatch(channel),channel);
                                // To Likhita: what exactly does this method do?
                                this.setState((state) => {
                                    state.users[i].read = this.getConsumtionState(channel);
                                    state.users[i].newMessages = this.getUnconsumedMessagesNumber(channel);
                                    return state;
                                 })
                                }}>
                                <Left>
                                    //TODO: ask nuleep fot a query for avatar uri's
                                    <Thumbnail source={{ uri: l.avatar }} />
                                    {
                                        this.getUnconsumedMessagesNumber(channel)=='0' ? <></> :
                                            <Badge style={{ backgroundColor: '#5386C9', position:"absolute" }}>
                                                <Text>{this.getUnconsumedMessagesNumber(channel)}</Text></Badge>
                                    }
                                    </Left>
                                <Body>
                                    <Text>{this.getLastMessage(channel).items[0].author}</Text>
                                    {
                                        !l.read ?
                                            <Text style={ {fontWeight: 'bold', color: 'black'}}>{l.messages[0].text}</Text> :
                                            <Text>{this.getLastMessage(channel).items[0].body}</Text>
                                    }
                                </Body>
                                <Right>
                                <Text note>{this.getLastMessageDate(this.state.channelsList[i])}</Text>
                                </Right>
                            </ListItem>
                        );
                    })
                }
                </List>
            </Container>
        );
    }
}


export default Chat;
