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
        this.chatManagerFunctions = this.props.route.params.managerFunctions;
    }

    componentDidMount() {
    }

    channelsLoadedHandler = () =>{
        this.setState({isLoading: false});
    }

    getInterlocutorName = (channel) => {
        //Extract interlocutor userId from the channel name.
        let locutors = channel.uniqueName.split('*');
        return locutors.some((locutor) => locutor !== this.userEmail);
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
            var onlyDate = weekday[date.getDay()];
            try
            {
                return onlyDate;
            }
            catch (exception) {
                return 'Error loading';
            }
        }
    }

    updateSearch = (search) => {
        this.setState({ search });
    };

    openDetailedChatView = (chatPreview, messages, user1, user2,sendFunction) => {

        this.navigate('NewChat', {
            chatPreview: chatPreview,
            messages: messages,
            user1: user1,
            user2: user2,
            sendMessage: sendFunction
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
            chatsList: this.chatManagerFunctions.getChatNames
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
        let previews = this.chatManagerFunctions.getChatPreviews();
        if (previews.length > 0)
        {
            return (
                <Container>
                    <List>
                        {
                            previews.map((chat,i) => {
                                return (
                                    <ListItem key={i} avatar onPress={() => {
                                        // TODO pass user1 ID and user2 ID
                                        this.openDetailedChatView(chat,
                                            this.chatManagerFunctions.getMessagesFromChat(chat.channelSID),
                                            chat.currentUser,
                                            chat.interlocutor,
                                            this.chatManagerFunctions.sendMessage
                                        );
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
