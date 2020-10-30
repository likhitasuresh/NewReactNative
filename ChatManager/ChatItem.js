class ChatItem
{
    constructor()
    {
        this.channel = null;
        this.lastMessage = null;
        this.messageHistory = [];
        this.unreadMessages = null;
    }

    update = () => {
        this.lastMessage = this.messageHistory[0];
    }

    setChannel = (channel) =>{
        this.channel = channel;
    }

    setLastMessage = (message) => {
        this.lastMessage = message;
    }

    setMessageHistory = (history) => {
        this.messageHistory = history;
    }

    setUnreadMessages = (number) => {
        this.unreadMessages = number;
    }

    addBatchToHistory = (messageBatch) => {
        for(let i = 0;i<messageBatch.length;i++){
            this.messageHistory.push(messageBatch[i]);
        }
    }

}

export default ChatItem;
