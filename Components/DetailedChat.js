import React, {Component} from 'react';
import { Container, Header, Content, Card, CardItem, Body,  Text, Item, Input, Textarea, StyleSheet, StyleProvider} from 'native-base';
import { Button} from 'react-native-elements';
import {View, KeyboardAvoidingView, TextInput} from 'react-native';

class DetailedChatActivity extends React.Component {
    static navigationOptions = {
        title: 'Detailed Chat',
        headerStyle: {
            backgroundColor: '#03A9F4',
            },
        headerTintColor: '#000',
        headerTitleStyle: {
            fontWeight: 'bold',
            },
        };
    render() {
        return (            
            <>
            {/* <Header /> */}
            <View style={{height: 675}}>
            <Container >   
                <Card style={{width:"60%", marginLeft: "3%"}}>                    
                    <CardItem>
                        <Body>
                            <Text>
                                Hi, how are you doing?
                            </Text>                                
                        </Body>
                    </CardItem>                    
                </Card>
                <Card style={{width:"60%", marginLeft: "37%", borderRadius: 10}}>
                    <CardItem style={{backgroundColor: '#4D96FF', }}>
                        <Body>                               
                            <Text>
                                I'm doing well, how about you?
                            </Text>
                        </Body>
                    </CardItem>
                </Card>
                <Card style={{width:"60%", marginLeft: "3%"}}>                    
                    <CardItem>
                        <Body>
                            <Text>
                                Hi, how are you doing?
                            </Text>                                
                        </Body>
                    </CardItem>                    
                </Card>
                <Card style={{width:"60%", marginLeft: "3%"}}>                    
                    <CardItem>
                        <Body>
                            <Text>
                                Hi, how are you doing?
                            </Text>                                
                        </Body>
                    </CardItem>                    
                </Card>

                
          </Container>
          </View>          
          <Container>
          <Item rounded style={{width: "70%", position: "absolute", marginLeft: "3%"}}>
                <Input placeholder='Enter Message'/>
            </Item>
          <Button title="Send" containerStyle={{width: "20%", marginLeft: "75%"}}/>
          </Container>
          </>
        
        );
    }
}


export default DetailedChatActivity;