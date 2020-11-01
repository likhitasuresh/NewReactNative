import React, { Component, useState, useCallback, useEffect } from 'react'
import { GiftedChat, Bubble, Send} from 'react-native-gifted-chat'
import {Text, View, StyleSheet} from 'react-native';
import { Client as TwilioChatClient } from "twilio-chat";

const styles = StyleSheet.create({
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
class NewChat extends Component{
  constructor(props){
    super(props);
    this.params = this.props.route.params;
    this.chatInfo = this.params.chatPreview;
    this.channel = this.chatInfo.channelName;
    this.sendMessageFunction = this.params.sendMessage;
    this.state = {
      messages: this.params.messages,
      user1: this.params.user1,
      user2: this.params.user2,
    }
    console.log('Chat name: '+this.channel);
  }

  componentDidMount(){
    //console.log(this.state.user1);
    console.log(this.chatInfo);
  }

  onSend(messages){
    for(let i = 0;i<messages.length;i++){
      this.sendMessageFunction(this.chatInfo.channelSID,messages[i].text);
      //TODO: listen for the event of message delivered etc.
      this.state.messages.unshift(messages[i]);
      this.setState({
          messages: this.state.messages
        });
      }
    }


  renderSend(props) {
    return (
      <Send {...props}>
        {/* <View style={{alignItems: 'center' }}> */}
          <Text style={{fontSize: 20, color: "#5386C9", paddingBottom: "3%", paddingRight: "1%"}}>Send</Text>
        {/* </View> */}
      </Send>
    );
  }

  renderBubble (props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#fff'
          },
          right: {
            backgroundColor: '#5386C9'
          },
        }}
      />
    )
  }

  parsePatterns = (_linkStyle) => {
    return [
      {
        pattern: /#(\w+)/,
        style: { textDecorationLine: 'underline', color: 'darkorange' },
        onPress: () => Linking.openURL('http://gifted.chat'),
      },
    ]
  }

  render(){
    console.log(this.state.messages)
    return(
      <>
        <GiftedChat
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{_id: this.state.user1}}
            renderBubble={this.renderBubble}
            isTyping ={true}
            alwaysShowSend={true}
            // showUserAvatar={true}
            // bottomOffset={100}
            parsePatterns={this.parsePatterns}
            renderSend={this.renderSend}
          />
      </>

    );
  }
}

export default NewChat;
