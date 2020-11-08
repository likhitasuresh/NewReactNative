class MessageItem
{
    constructor()
    {
    }

    static createFromTwilioMessage = (twilioMessage) => {
        let newMessage = {
            _id: twilioMessage.sid,
            index: twilioMessage.index,
            text: twilioMessage.body,
            createdAt: twilioMessage.timestamp,
            user: {
                _id: twilioMessage.author,
                name: twilioMessage.author
            },
        };
        return newMessage;
    }


}
export default MessageItem;
