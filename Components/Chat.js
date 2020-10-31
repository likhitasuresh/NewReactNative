import React, {Component} from 'react';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Badge, Button, Icon, Fab } from 'native-base';
import { event } from 'react-native-reanimated';
import {users} from '../Data/users';
import { LogBox } from 'react-native';
import TwilioChatManager from '../ChatManager/TwilioChatManager';
import { forEach } from 'lodash';

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
            isLoading: true,
            chatsList: []
        };
        this.chatManager = this.props.route.params.chatManager;
        //TODO: pass function  
        //console.log(this.props.route.params.test);
    }

    componentDidMount() {
        this.chatManager.chatItems.forEach(item => {
            console.log(item.chatPreview.channelName)

            this.setState({
            chatsList: this.state.chatsList.push(item.chatPreview.channelName)
        })});
        console.log(this.state.chatsList)
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
    getLastMessageDate = (date) =>
    {
        var messageDate = date.getTime();
        var currentTime = Date.now();
        if (messageDate >= currentTime - 604800000) {
            try
            {
                return date.toDateString();
            }
            catch (exception) {
                return 'Error loading';
            }
        }
        else if (messageDate < currentTime - 604800000) {
            var weekday = new Array(7);
            weekday[0] = "Sunday";
            weekday[1] = "Monday";
            weekday[2] = "Tuesday";
            weekday[3] = "Wednesday";
            weekday[4] = "Thursday";
            weekday[5] = "Friday";
            weekday[6] = "Saturday";
            var onlyDate = weekday[date.getDay()]
            try
            {
                return onlyDate;
            }
            catch (exception) {
                return 'Error loading';
            }
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

    openDetailedChatView = (name, messages, user1, user2) => {
        this.navigate('NewChat', {
            channelName: name,
            messages: messages,
            user1: user1,
            user2: user2
        });
    }

    appendMessage(messages, i){
        this.setState((state) => {
            state.users[i].messages.unshift(messages);
            return state;
        })
    }

    createNewChannel(){
        console.log("hi hello");
        console.log(this.state.chatsList);
        this.navigate('CreateNewChannel', {
            chatsList: this.state.chatsList
        });
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
        if (this.chatManager.chatItems.length > 0)
        {
            return (
                <Container>
                    <List>
                        {
                            this.chatManager.chatItems.map((chatItem,i) => {
                                let chat = chatItem.chatPreview;
                                return (
                                    <ListItem key={i} avatar onPress={() => {
                                        // TODO pass user1 ID and user2 ID
                                        let user1 = "IM79d68aeea50a4103908c9ca0ec82f146";
                                        let user2 = "IMe2f98d343dbd45aeac9ca34f7b85d2a3";
                                        this.openDetailedChatView(chat.channelName, this.chatManager.getMessagesFromChat(chat.channelSID), user1, user2 );
                                    }}>
                                        <Left>
                                            <Thumbnail source={{uri: 'https://placeimg.com/140/140/any'}}/>
                                            {
                                                chat.unreadMessagesCount.toString() !== '0' ? <></> :
                                                    <Badge style={{backgroundColor: '#5386C9', position: "absolute"}}>
                                                        <Text>{chat.unreadMessagesCount.toString()}</Text></Badge>
                                            }
                                        </Left>
                                        <Body>
                                            <Text>{chat.channelName}</Text>
                                            {
                                                chat.unreadMessagesCount.toString() === '0' ?
                                                    <Text style={{
                                                        fontWeight: 'bold',
                                                        color: 'black'
                                                    }}>{chat.lastMessageText}</Text> :
                                                    <Text>{chat.lastMessageText}</Text>
                                            }
                                        </Body>
                                        <Right>
                                            <Text note>{this.getLastMessageDate(chat.lastMessageDate)}</Text>
                                        </Right>
                                    </ListItem>
                                );
                            })
                        }
                    </List>
                    <Fab
                        active={this.state.active}
                        direction="right"
                        containerStyle={{ marginLeft: 10}}
                        style={{ backgroundColor: '#5067FF' }}
                        onPress={() => this.createNewChannel() }>
                            <Icon name="md-person-add" />
                    </Fab>
                </Container>
            )}
        else
        {
            return (<Text>Loading...</Text>);
        }
    }
}


export default Chat;
