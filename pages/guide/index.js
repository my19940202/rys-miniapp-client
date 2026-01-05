Page({
    data: {
        showAgent: false,
        chatMode: "bot",
        showBotAvatar: true,
        agentConfig: {
            botId: "ibot-rysduide-xjqndi",
            allowWebSearch: false,
            allowUploadFile: false,
            allowPullRefresh: true,
            allowUploadImage: false,
            showToolCallDetail: false,
            allowMultiConversation: true,
            allowVoice: false
        }
    },
    async onLoad() {
        const app = getApp();
        await app.getInitPromise();
        this.setData({ showAgent: true });
    }
})
