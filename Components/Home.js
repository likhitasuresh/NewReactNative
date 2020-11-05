import React, {Component} from 'react';
import { Platform, StyleSheet, Text, View, Button} from 'react-native';
import TwilioChatManager from '../ChatManager/TwilioChatManager';

class Home extends React.Component {
    static navigationOptions = {
        title: 'Home',
        headerStyle: {
            backgroundColor: '#03A9F4',
            },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            },
        };

    constructor() {
        super();
        let luis = 'louis@nuleep-user.com';
        let jane = "janesmith@nuleep-rec.com";
        let joe = 'joeruiz@nuleep-rec.com';
        let ann = 'annie@user.com';
        let tst = 'user@nuleep-rec.com';
        TwilioChatManager.create(ann).then((manager) => {
            this.chatManager = manager;
        });
    }

    render() {
        return (
        <View style={styles.container}>
            <Text style={styles.headerText} >Home Activity</Text>
            <Button
            title="Go to Chat Activity"
            onPress={() => {this.props.navigation.navigate('Chat',
                {
                    managerFunctions: {
                        getMessagesFromChat: this.chatManager.getMessagesFromChat,
                        getChatPreviews: this.chatManager.getChatPreviews,
                        getChatNames: this.chatManager.getChatNames,
                        sendMessage: this.chatManager.sendMessage,
                        getChannelBySID: this.chatManager.getChannelBySID,
                        setAllMessagesConsumed: this.chatManager.setAllMessagesConsumed,
                        subscribeForChannelEvent: this.chatManager.subscribeForChannelEvent,
                        ingestNewMessage: this.chatManager.ingestNewMessage,
                        createNewChannel: this.chatManager.createNewChannel
                    }
                });
            }}
            />
        </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    },
    headerText: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold'
    },
});

export default Home;
