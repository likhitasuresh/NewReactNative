import React, {Component} from 'react';
import {Container, Content, Text, InputGroup, Input, Button, Icon} from 'native-base';
class CreateNewChannel extends Component{

    constructor(props){
        super(props);
        this.state = {
            user: ""
        }
        this.chatsList = this.props.route.params.chatsList;

    }
    validateUsername(){
        console.log(this.state.user);
        console.log(this.chatsList);
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
                        <Button large style={{ margin: "auto"}} onPress = {() => this.validateUsername()} >
                            <Icon name='ios-search' />
                        </Button>
                    </InputGroup>
                    
                </Content>
            </Container>
        )
    }
}

export default CreateNewChannel;