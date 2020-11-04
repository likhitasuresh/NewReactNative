class ChatPreview
{
    constructor()
    {
        this.channelSID = null;
        this.lastMessageText = '';
        this.lastMessageDate = null;
        this.unreadMessagesCount = '0';
        this.channelName = '';

        this.currentUser = '';
        this.interlocutor = '';

        this.currentUserSID = '';
        this.interlocuterSID = '';

        this.isSubscribedForNewMessages = false;
    }

    setMembers = (membersList,currentUser) => {
        this.currentUser = currentUser;
        for (let i = 0;i<membersList.length;i++){
            if(membersList[i].identity !== currentUser){
                this.interlocutor = membersList[i].identity;
                this.interlocuterSID = membersList[i].sid;
            }
            else {
                this.currentUserSID = membersList[i].sid;
            }
        }
    }

    setUnconsumedMessageCountZero = () =>{
        this.unreadMessagesCount = '0';
    }
}

export default ChatPreview;
