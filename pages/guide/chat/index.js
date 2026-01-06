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
        },
        initialQuestion: '' // 存储从URL传入的初始问题
    },
    // 分享到聊天
    onShareAppMessage() {
        return {
            title: '日月山AI导览，智能问答带你游览~',
            path: '/pages/guide/index',
            imageUrl: 'https://636c-cloud1-9gzmqwpsa8336a66-1393371278.tcb.qcloud.la/images/ai-bot/share-guide-new.png'
        }
    },
    async onLoad(options) {
        const app = getApp();
        await app.getInitPromise();
        
        // 获取URL参数中的问题
        if (options.question) {
            this.setData({ 
                showAgent: true,
                initialQuestion: decodeURIComponent(options.question)
            });
            // 在 onLoad 中启动轮询等待组件初始化完成
            this.waitForAgentReady();
        } else {
            this.setData({ showAgent: true });
        }
    },
    
    // 轮询等待 agent-ui 组件初始化完成
    waitForAgentReady() {
        const maxRetries = 3; // 最多重试20次，共10秒
        let retryCount = 0;
        
        const checkReady = () => {
            const agentUI = this.selectComponent('#agentUI');
            // 检查组件是否存在且 bot 数据已初始化
            if (agentUI && agentUI.data && agentUI.data.bot && agentUI.data.bot.botId) {
                // 组件已准备好，发送初始问题
                this.sendInitialQuestion();
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(checkReady, 500);
            } else {
                console.warn('agent-ui 组件初始化超时');
            }
        };
        
        // 首次延迟500ms后开始检查
        setTimeout(checkReady, 500);
    },
    
    // 发送初始问题
    sendInitialQuestion() {
        const agentUI = this.selectComponent('#agentUI');
        if (agentUI && this.data.initialQuestion) {
            agentUI.sendMessage(this.data.initialQuestion);
            // 发送后清空，避免重复发送
            this.setData({ initialQuestion: '' });
        }
    }
})
