import React, {Component} from 'react';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Badge } from 'native-base';
import { event } from 'react-native-reanimated';
import {users} from '../Data/users';
import { LogBox } from 'react-native';
import TwilioChatManager from '../ChatManager/TwilioChatManager';

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
            channelList: [],
            chatManager: props.chatManager,
            isLoading: true
        };
        console.log(this.state.test);
        //this.userEmail = 'louis@nuleep-user.com';
        //this.state.chatManager = new TwilioChatManager(this.userEmail);
        this.state.chatManager.eventEmitter.addListener('channels-loaded',this.channelsLoadedHandler);
    }

    componentDidMount() {

    }

    channelsLoadedHandler = () =>{
        this.setState({isLoading: false});
    }

    getUniqueChannelName = (userEmail_a,userEmail_b) => {
        //Creates unique chat name that contains both user names in a uniform way.
        //uniqueName - concatenation with * of the sorted array of the user ids.
        let user_list = [userEmail_a,userEmail_b].sort();
        return user_list.join('*');
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
            console.log('Trying fetch unconsumed messages...');
            channel.getUnconsumedMessagesCount()
                .then((result) => {
                    console.log('Uncosumed messages: '+result.toString());
                    return result.toString();
                });
        }
        catch (exception)
        {
            console.log('Could not load unconsumed messages.');
            return '0';
        }
    }

    getLastMessage = (channel) => {
        //Returns the text of the last message,
        // 'Chat is empty' otherwise.
        try
        {
            let message = channel.getMessages(1).then((message) => {
                if (message === 'undefined')
                    return 'Empty message downloaded';
                else
                    return message.body;
            });
        }
        catch (exception)
        {
            return exception.message.toString();
        }
    }

    getChannelName = (channel) => {
        try
        {
            let cname = channel.uniqueName;
            if (cname === 'undefined')
                return 'Error occured';
            return cname;
        }
        catch (exception)
        {
            return 'Error occured';
        }
    }

    //TODO: what to return if no messages exist in the chat?
    getLastMessageDate = (channel) =>
    {
        //Returns the date the last nessage in the chat was created,
        //otherwise ???
        try
        {
            //TODO: Create the date parser to make it fit neatly into the markup
            return channel.lastMessage.dateCreated.toDateString();
        }
        catch (exception)
        {
            return 'Error loading';
        }
    }

    //TODO: what if there is no messages in the channel?
    getMessageBatch = (channel,batchSize=30) =>
    {
        //Loads a batch of batchSize last messages in the channel,
        //otherwise ???
        try
        {
            return channel.getMessages(batchSize).items;
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
        console.log("Manager channels length: "+this.state.chatManager.channels.length.toString());

        if (!this.state.isLoading)
        {
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
                            //          last message text -> getLastMessage(channel)
                            //          last messgae date -> getLastMessageDate(channel)
                            //          load first batch of messages -> getMessageBatch(channel,batchSize=30)
                            this.state.chatManager.channels.map((channel,i) => {
                                return (
                                    <ListItem key={i} avatar onPress={() => {
                                        this.openDetailedChatView(this.getChannelName(channel), this.getMessageBatch(channel), channel);
                                        this.setState((state) => {
                                            state.users[i].read = this.getConsumtionState(channel);
                                            state.users[i].newMessages = this.getUnconsumedMessagesNumber(channel);
                                            return state;
                                        })
                                    }}>
                                        <Left>
                                            <Thumbnail source={{uri: 'https://placeimg.com/140/140/any'}}/>
                                            {

                                                this.getUnconsumedMessagesNumber(i) !== '0' ? <></> :
                                                    <Badge style={{backgroundColor: '#5386C9', position: "absolute"}}>
                                                        <Text>{this.getUnconsumedMessagesNumber(channel)}</Text></Badge>
                                            }
                                        </Left>
                                        <Body>
                                            <Text>{this.getChannelName(channel)}</Text>
                                            {
                                                this.getUnconsumedMessagesNumber(channel) === '0' ?
                                                    <Text style={{
                                                        fontWeight: 'bold',
                                                        color: 'black'
                                                    }}>{this.getLastMessage(channel)}</Text> :
                                                    <Text>{this.getLastMessage(channel)}</Text>
                                            }
                                        </Body>
                                        <Right>
                                            <Text note>{this.getLastMessageDate(channel)}</Text>
                                        </Right>
                                    </ListItem>
                                );
                            })
                        }
                    </List>
                </Container>
            )}
        else
        {
            return (<Text>Loading...</Text>);
        }
    }
}


export default Chat;
