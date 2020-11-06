import React, { Component, useState, useCallback, useEffect } from 'react'
import { GiftedChat, Bubble, Send} from 'react-native-gifted-chat'
import {Text, View, StyleSheet} from 'react-native';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

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

    this.props.navigation.setOptions({
      headerStyle: {
        backgroundColor: '#15adaa'
      },
      headerTintColor: '#ffffff',
      title: this.chatInfo.interlocutor
    });


    this.sendMessageFunction = this.params.sendMessage;
    this.unconsumedIndexUpdateFunction = this.params.setAllMessagesConsumed;
    this.subscribeForChannelEvents = this.params.subscribeForChannelEvent;
    this.getChannelBySID = this.params.getChannelBySID;
    this.ingestMessage = this.params.ingestNewMessage;
    this.getMessages = this.params.getMessagesFromChat;

    this.state = {
      messages: this.params.messages,
      user1: this.params.user1,
      user2: this.params.user2,
      user: {
        _id: this.params.user1,
        name: this.params.user1
      }
    }
  }

  componentDidMount(){
    if(!this.chatInfo.isSubscribedForNewMessageInChatRoom)
    {
      this.subscribeForChannelEvents(this.chatInfo.channelSID,'messageAdded', this.onReceive,this.chatInfo.isSubscribedForNewMessageInChatRoom);
    }

    if (this.chatInfo.unreadMessagesCount !== '0')
    {
      this.unconsumedIndexUpdateFunction(this.chatInfo.channelSID,this.state.messages[0].index);
      //TODO: if the function above returned successful code (the event not implemented yet) set the counter to zero
      this.chatInfo.setUnconsumedMessageCountZero();
    }
  }

  onSend(messages){
    for(let i = 0;i<messages.length;i++){
        this.sendMessageFunction(this.chatInfo.channelSID,messages[i].text);
      }
    }

    onReceive = () => {
      this.setState({
        messages: this.getMessages(this.chatInfo.channelSID)
      });
  }

  isLocutor = (userName) => {
    if (userName === this.chatInfo.currentUser)
      return false;
    return true;
 }

/*  TEST_renderBubble(props) {
/!*    if (props.isSameUser(props.currentMessage, props.previousMessage) && props.isSameDay(props.currentMessage, props.previousMessage)) {
      return (
          <Bubble
              {...props}
          />
      );
    }*!/
    console.log(props);
    return (
        <View>
          {
            (props.currentMessage.user.name !== props.previousMessage.user.name &&
            props.currentMessage.user.name !== props.user.name) === true ? <></>:
                <Text style={{fontSize: 10,}}>{props.currentMessage.user.name}</Text>
          }

          <Bubble
              {...props}
              wrapperStyle={{
                left: {
                  backgroundColor: '#fff'
                },
                right: {
                  backgroundColor: '#15adaa'
                },
              }}
          />
        </View>
    );
  }*/

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
            backgroundColor: '#15adaa'
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
            user={this.state.user}
            renderBubble={this.renderBubble}
            isTyping ={true}
            alwaysShowSend={true}
            renderUsernameOnMessage={true}
            //showUserAvatar={true}
            showAvatarForEveryMessage={false}
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
