class ChatPreview
{
    constructor()
    {
        this.channelSid = null;
        this.lastMessageText = '';
        this.lastMessageDate = null;
        this.unreadMessagesCount = '0';
        this.channelName = '';
    }

    getUnconsumedState = () => {
        if (this.unreadMessagesCount !== 'undefined')
        {
            if(this.unreadMessagesCount === '0')
                return true;
            else return false;
        }
        //TODO: handle undefined
        else
            return false;
    }
}

export default ChatPreview;
