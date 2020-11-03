import React, { Component, useState, useCallback, useEffect } from 'react'
import { GiftedChat, Bubble, Send} from 'react-native-gifted-chat'
import {Text, View, StyleSheet} from 'react-native';
import { Client as TwilioChatClient } from "twilio-chat";
import MessageItem from "../ChatManager/MessageItem";

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
    this.unconsumedIndexUpdateFunction = this.params.setAllMessagesConsumed;
    this.subscribeForChannelEvent = this.params.subscribeForChannelEvent;
    this.getChannelBySID = this.params.getChannelBySID;
    this.ingestNewMessage = this.params.ingestNewMessage;

    this.state = {
      messages: this.params.messages,
      user1: this.params.user1,
      user2: this.params.user2
    }

  }

  componentDidMount(){
    this.subscribeForChannelEvent(this.chatInfo.channelSID,'messageAdded', this.onReceive);

    if (this.chatInfo.unreadMessagesCount !== '0')
    {
      this.unconsumedIndexUpdateFunction(this.chatInfo.channelSID,this.state.messages[0].index);
      //TODO: if the function above returned successful code (the event not implemented yet) set the counter to zero
      this.chatInfo.setUnconsumedMessageCountZero();
    }
  }

  onSend(messages){
    for(let i = 0;i<messages.length;i++){
      //TODO: reset index once udate event pushed successfully
      messages[i].index = this.state.messages[0].index+1;
      if(this.state.messages.indexOf(messages[i].index) === -1 ){
        this.sendMessageFunction(this.chatInfo.channelSID,messages[i].text,messages[i].index);
        //TODO: listen for the event of message delivered etc.
        this.state.messages.unshift(messages[i]);
        this.setState({
          messages: this.state.messages
        });
      }
      }
    }

    onReceive = (message) => {
      let ingestion = this.ingestNewMessage(this.chatInfo.channelSID,message,this.state.messages);
      if (ingestion)
      {
        this.setState({
          messages: this.state.messages
        });
      }
    }

  maxIndex = () => {
    let indexes = [];
    for(let i = 0;i<this.state.messages.length;i++){
      indexes.push(this.state.messages[i].index);
    }
    return Math.max.apply(null,indexes);
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
