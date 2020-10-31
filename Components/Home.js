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
        TwilioChatManager.create('louis@nuleep-user.com').then((manager) => {
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
                    chatManager: this.chatManager
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
