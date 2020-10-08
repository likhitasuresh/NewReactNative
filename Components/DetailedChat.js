import React, {Component} from 'react';
import { Container, Header, Content, Card, CardItem, Body, Text } from 'native-base';

class DetailedChatActivity extends React.Component {
    static navigationOptions = {
        title: 'DetailedChat',
        headerStyle: {
            backgroundColor: '#03A9F4',
            },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            },
        };
    render() {
        return (
            <Container>            
                <Content>
                    <Card>
                        <CardItem>
                            <Body>
                                <Text>
                                Hi, how are you doing?
                                </Text>                                
                            </Body>
                        </CardItem>
                    </Card>
                    <Card>
                        <CardItem>
                            <Body>                               
                                <Text>
                                I'm doing well, how about you?
                                </Text>
                            </Body>
                        </CardItem>
                    </Card>
                </Content>
          </Container>
        );
    }
}


export default DetailedChatActivity;