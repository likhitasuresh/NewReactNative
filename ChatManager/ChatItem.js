import ChatPreview from "./ChatPreview";

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
        this.chatPreview.lastMessageText = this.messageHistory[0].body;
        this.chatPreview.lastMessageDate = this.messageHistory[0].timestamp;
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
    }

    setMessageHistory = (history) => {
        //TODO: implement message wrapper and rewrite it here
        this.messageHistory = history;
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
