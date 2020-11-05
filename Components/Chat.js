import React, {Component} from 'react';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Badge, Button, Icon, Fab } from 'native-base';
import { event } from 'react-native-reanimated';
import {users} from '../Data/users';
import { LogBox } from 'react-native';
import TwilioChatManager from '../ChatManager/TwilioChatManager';
import { forEach } from 'lodash';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state!',
]);

class Chat extends Component {
    //TODO: Initialiaze client here, load the channels list, subscribe for events listening.
    constructor(props){
        super(props);
        this.navigate = this.props.navigation.navigate;
        this.state = {
            search: '',
            isLoading: true,
            chatsList: [],
            previews: []
        };
        this.chatManagerFunctions = this.props.route.params.managerFunctions;
    }

    componentDidMount() {
        console.log('Mounted');
        this.setState({
            previews: this.chatManagerFunctions.getChatPreviews()
        });
        console.log(this.state.previews);

        for(let i = 0;i<this.state.previews.length;i++){
            if(!this.state.previews[i].isSubscribedForNewMessageInChatList){
                this.chatManagerFunctions.subscribeForChannelEvent(
                    this.state.previews[i].channelSID,
                    'messageAdded',
                    this.updateHistory,
                    this.state.previews[i].isSubscribedForNewMessageInChatList
                );
            }
        }
    }

    updateHistory = ()=>{
        this.setState({
            previews: this.chatManagerFunctions.getChatPreviews()
        });
    }

    channelsLoadedHandler = () =>{
        this.setState({isLoading: false});
    }

    getInterlocutorName = (channel) => {
        //Extract interlocutor userId from the channel name.
        let locutors = channel.uniqueName.split('*');
        return locutors.some((locutor) => locutor !== this.userEmail);
    }

    isToday = (someDate) => {
        const today = new Date()
        return someDate.getDate() === today.getDate() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getFullYear() === today.getFullYear();
    }

    getLastMessageDate = (date) =>
    {
        let messageDate = date.getTime();
        let currentTime = Date.now();

        if (this.isToday(date)) {
            let timeString = ('0'+date.getHours()).slice(-2)+':'+
                ('0'+date.getMinutes()).slice(-2);
            return timeString;
        }
        else if (messageDate < currentTime - 604800000) {
            let weekday = new Array(7);
            weekday[0] = "Sunday";
            weekday[1] = "Monday";
            weekday[2] = "Tuesday";
            weekday[3] = "Wednesday";
            weekday[4] = "Thursday";
            weekday[5] = "Friday";
            weekday[6] = "Saturday";
            let onlyDate = weekday[date.getDay()];
            try
            {
                return onlyDate;
            }
            catch (exception) {
                return 'Error loading';
            }
        }
        else
        {
            return date.toDateString();
        }
    }

    updateSearch = (search) => {
        this.setState({ search });
    };

    openDetailedChatView = (chatPreview,
                            messages,
                            user1,
                            user2,
                            sendFunction,
                            unconsumedIndexUpdateFunction,
                            subscribeForEventFunc,
                            getChannelBySID,
                            ingestNewMessage,
                            getMessagesFromChat
                            ) => {

        this.navigate('NewChat', {
            chatPreview: chatPreview,
            messages: messages,
            user1: user1,
            user2: user2,
            sendMessage: sendFunction,
            setAllMessagesConsumed: unconsumedIndexUpdateFunction,
            subscribeForChannelEvent: subscribeForEventFunc,
            getChannelBySID: getChannelBySID,
            ingestNewMessage: ingestNewMessage,
            getMessagesFromChat: getMessagesFromChat
        });
    }

    appendMessage(messages, i){
        this.setState((state) => {
            state.users[i].messages.unshift(messages);
            return state;
        })
    }

    createNewChannel(){
        console.log("Add new user");

        this.navigate('CreateNewChannel', {
            chatsList: this.chatManagerFunctions.getChatNames,
            managerFunctions: this.chatManagerFunctions
        });
    }

    displayMessage = (message,messageLength=50) => {
        if(message.length > messageLength){
            let truncatedMessage = message.slice(0,messageLength-3);
            truncatedMessage+='...';
            return truncatedMessage;
        }
        else
        {
            return message;
        }

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
        console.log(this.state.previews.length);
        if (this.state.previews.length > 0)
        {
            return (
                <Container>
                    <List>
                        {
                            this.state.previews.map((chat,i) => {
                                return (
                                    <ListItem key={i} avatar onPress={() => {
                                        // TODO pass user1 ID and user2 ID
                                        this.openDetailedChatView(chat,
                                            this.chatManagerFunctions.getMessagesFromChat(chat.channelSID),
                                            chat.currentUser,
                                            chat.interlocutor,
                                            this.chatManagerFunctions.sendMessage,
                                            this.chatManagerFunctions.setAllMessagesConsumed,
                                            this.chatManagerFunctions.subscribeForChannelEvent,
                                            this.chatManagerFunctions.getChannelBySID,
                                            this.chatManagerFunctions.ingestNewMessage,
                                            this.chatManagerFunctions.getMessagesFromChat
                                        );
                                    }} style={{
                                        minHeight: 35
                                    }}>
                                        <Left>
                                            <Thumbnail source={{uri: 'https://placeimg.com/140/140/any'}}/>
                                            {
                                                chat.unreadMessagesCount.toString() === '0' ? <></> :
                                                    <Badge style={{backgroundColor: '#5386C9', position: "absolute"}}>
                                                        <Text>{chat.unreadMessagesCount.toString()}</Text></Badge>
                                            }
                                        </Left>
                                        <Body>
                                            <Text style={{minHeight: 30}}>{chat.interlocutor}</Text>
                                            {
                                                chat.unreadMessagesCount.toString() !== '0' ?
                                                    <Text style={{
                                                        fontWeight: 'bold',
                                                        color: 'black',
                                                        minHeight: 35,
                                                        maxHeight: 45
                                                    }}>{this.displayMessage(chat.lastMessageText)}</Text> :
                                                    <Text>{this.displayMessage(chat.lastMessageText)}</Text>
                                            }
                                        </Body>
                                        <Right>
                                            <Text style={{}} note>{this.getLastMessageDate(chat.lastMessageDate)}</Text>
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
