class ChannelItem
{
    constructor()
    {
        this.channelSID = '';
        this.channel = null;
    }

    static createFromTwilioChannel = (twilioChannel) => {
        let channelItem = new ChannelItem();
        channelItem.channelSID = twilioChannel.sid;
        channelItem.channel = twilioChannel;
        return channelItem;
    }
}

export default ChannelItem;
