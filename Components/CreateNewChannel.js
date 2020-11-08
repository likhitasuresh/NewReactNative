import React, {Component} from 'react';
import {Container, Content, Text, InputGroup, Input, Button, Icon} from 'native-base';
class CreateNewChannel extends Component{

    constructor(props){
        super(props);
        this.props.navigation.setOptions({
            headerStyle: {
                backgroundColor: '#15adaa'
            },
            headerTintColor: '#ffffff',
            title: 'Create chat'
        });

        this.state = {
            user: ""
        }
        this.chatsList = this.props.route.params.chatsList;
        this.managerFunctions = this.props.route.params.managerFunctions;
    }

    validateUsername(){
        this.managerFunctions.createNewChannel(this.state.user);
        alert('Channel Created!');
    }

    render(){
        return(
            <Container>
                <Content>
                    <InputGroup borderType='rounded' >
                        <Input
                            placeholder='Enter Username'
                            name="user"
                            onChangeText = {(user) => this.setState({ user: user})}/>
                        <Button large style={{ margin: "auto",backgroundColor: '#15adaa'}} onPress = {() => this.validateUsername()} >
                            <Icon name='ios-search' />
                        </Button>
                    </InputGroup>

                </Content>
            </Container>
        )
    }
}

export default CreateNewChannel;
