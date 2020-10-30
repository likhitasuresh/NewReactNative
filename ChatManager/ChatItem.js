class ChatItem
{
    constructor()
    {
        this.channel = null;
        this.lastMessage = null;
        this.messageHistory = [];
        //TODO: load this too
        this.unreadMessages = '0';
    }

    update = () => {
        this.lastMessage = this.messageHistory[0];
    }

    getUnconsumedState = () => {
        if (this.unreadMessages !== 'undefined')
        {
            if(this.unreadMessages === '0')
                return true;
            else return false;
        }
        //TODO: handle undefined
        else
            return false;
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
