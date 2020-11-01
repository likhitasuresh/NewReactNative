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
    }

    setMembers = (membersList,currentUser) => {
        console.log('I got here, user name: '+currentUser);

        this.currentUser = currentUser;
        for (let i = 0;i<membersList.length;i++){
            if(membersList[i].identity !== currentUser){
                this.interlocutor = membersList[i].identity;
                console.log('Adding '+this.interlocutor);
            }
        }
    }
}

export default ChatPreview;
