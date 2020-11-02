import ChatPreview from "./ChatPreview";
import MessageItem from "./MessageItem";

class ChatItem
{
    constructor()
    {
        this.channelSID = null;
        this.channelName = '';
        this.messageHistory = [];
        this.chatPreview = new ChatPreview();
    }

    update = () => {
        console.log('History: ');
        console.log(this.messageHistory);


        this.chatPreview.lastMessageText = this.messageHistory[0].text;
        this.chatPreview.lastMessageDate = this.messageHistory[0].createdAt;
    }

    getUnconsumedState = () => {
        if (this.chatPreview.unreadMessagesCount !== 'undefined')
        {
            if(this.chatPreview.unreadMessagesCount === '0')
                return true;
            else return false;
        }
        //TODO: handle undefined
        else
            return false;
    }

    setChannelName = (name) => {
        this.channelName = name;
        this.chatPreview.channelName = name;
    }

    setChannelSID = (channelSID) =>{
        this.channelSID = channelSID;
        this.chatPreview.channelSID = channelSID;
    }

    setMessageHistory = (history) => {
        for (let i = 0; i < history.length; i++){
            this.messageHistory.unshift(MessageItem.createFromTwilioMessage(history[i]));
        }
    }

    setFromTwilioUsers = (users,currentUser) => {
        this.currentUser = currentUser;
        for(let i = 0;i<users.length;i++){
            if(users[i].identity !== currentUser){
                this.interlocutor = users[i];
                return
            }
        }
    }

    //TODO: rewrite to satisfy the view
    setUnreadMessages = (number) => {
        this.chatPreview.unreadMessagesCount = number;
    }

    addBatchToHistory = (messageBatch) => {
        for(let i = 0;i<messageBatch.length;i++){
            this.messageHistory.push(messageBatch[i]);
        }
    }

}

export default ChatItem;
