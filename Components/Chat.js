import React, {Component} from 'react';
// import { Platform, StyleSheet, View, Image} from 'react-native';
// impor t { Card, ListItem, Button, Icon, SearchBar,  Avatar, Badge } from 'react-native-elements';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';

import { event } from 'react-native-reanimated';


const users = [
    {
       name: 'Brynn Tarth',
       avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg',
       subtitle: 'I heard about that last night. Wonder how it will affect students from here on.',
       read: false,
       role: 'RECRUITER',
       time: '3:45pm'
    },
    {
        name: 'Rachael Simone',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
        subtitle: 'How is the job search going for you?',
        read: true,
        role: null,
        time: '3:45pm'
     },
     {
        name: 'Chris Jackson',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        subtitle: 'Do you happen to know anyone from Altech Inc? I am really interested in their...',
        read: true,
        role: 'JOB SEEKER',
        time: '3:45pm'
     },
     {
        name: 'Jane Doe',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg',
        subtitle: 'I have referred you to my colleague at ABC. They will be reaching out to you shortly.',
        read: false,
        role: 'PROFESSOR',
        time: '3:45pm'
     },
     {
        name: 'Robert Brown McCarthy',
        avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
        subtitle: 'I had no idea!',
        read: false,
        role: null,
        time: '3:45pm'
     },
     {
        name: 'Justine Horner',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
        subtitle: 'Happy to share my resume!',
        read: true,
        role: null,
        time: '3:45pm'
     },

    
   ];
   
     
   
class ChatActivity extends Component {

    state = {
        search: '',
      };

    updateSearch = (search) => {
        this.setState({ search });
    
    };

    openDetailedChatView = () => {
        this.props.navigation.navigate('DetailedChat')
        // alert("yeah working");
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
                    users.map((l, i) => {
                        return (                           
                                <ListItem key={i} avatar onPress={ () => this.openDetailedChatView()}>
                                    <Left>
                                        <Thumbnail source={{ uri: l.avatar }} />
                                    </Left>
                                    <Body>
                                        <Text>{l.name}</Text>
                                        {
                                            !l.read ? <Text style={ {fontWeight: 'bold', color: 'black'}}>{l.subtitle}</Text> :  <Text>{l.subtitle}</Text>                                             
                                        }
                                    </Body>
                                    <Right>
                                        <Text note>{l.time}</Text>
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
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#F5FCFF',
//         },
//     headerText: {
//         fontSize: 20,
//         textAlign: 'center',
//         margin: 10,
//         fontWeight: 'bold'
//         },
//     listItemTitle: {
//         fontWeight: 'bold',
//         fontSize: 18,
//     }
    
// });

export default ChatActivity;