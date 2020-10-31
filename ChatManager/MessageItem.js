class MessageItem
{
    constructor()
    {
    }

    static createFromTwilioMessage = (twilioMessage) => {
        let newMessage = {
            _id: twilioMessage.sid,
            text: twilioMessage.body,
            user: twilioMessage.author,
            createdAt: twilioMessage.timestamp
        };

        return newMessage;
    }


}
export default MessageItem;
