import React, {Component} from 'react';
// import { Platform, StyleSheet, View, Image} from 'react-native';
// impor t { Card, ListItem, Button, Icon, SearchBar,  Avatar, Badge } from 'react-native-elements';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Badge } from 'native-base';
import { event } from 'react-native-reanimated';
import {users} from '../Data/users';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]);     
   
class Chat extends Component {

    constructor(props){
        super(props);
        this.navigate = this.props.navigation.navigate;
        this.state = {
            search: '',
            read: null,
            newMessages: 0,
            users: users
          };
    }

    
    updateSearch = (search) => {
        this.setState({ search });
    
    };

    openDetailedChatView = (name, messages, i) => {
        // navigation.setParams({ title: name })        
        this.navigate('NewChat', { 
            name: name,
            messages: messages,
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
                    this.state.users.map((l, i) => {                        
                        return (                           
                            <ListItem key={i} avatar onPress={ () => {
                                this.openDetailedChatView(l.name, l.messages, i);                                   
                                 this.setState((state) => {
                                    state.users[i].read = true;
                                    state.users[i].newMessages = '0'
                                    return state;
                                 })                               
                                }}>
                                <Left>
                                    <Thumbnail source={{ uri: l.avatar }} />
                                    {
                                        l.newMessages=='0' ? <></> : <Badge style={{ backgroundColor: '#5386C9', position:"absolute" }}><Text>{l.newMessages}</Text></Badge>
                                    }
                                    </Left>
                                <Body>
                                    <Text>{l.name}</Text>
                                    {
                                        !l.read ? <Text style={ {fontWeight: 'bold', color: 'black'}}>{l.messages[0].text}</Text> :  <Text>{l.messages[0].text}</Text>                                             
                                    }
                                </Body>
                                <Right>
                                <Text note>{new Date(l.messages[0].createdAt.getTime()).toString().substring(16, 21)}</Text>
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