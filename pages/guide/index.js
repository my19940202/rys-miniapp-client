Page({
    data: {
        questions: [
            { icon: '📖', text: '为我讲个日月山的故事' },
            { icon: '✨', text: '去哪玩？日月山景点必打卡攻略' },
            { icon: '🐪', text: '文成公主与日月山的传说' },
            { icon: '🏔️', text: '日月山的地理与气候小知识' }
        ]
    },
    
    // 点击问题跳转到聊天页面
    onQuestionTap(e) {
        const { question } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/guide/chat/index?question=${encodeURIComponent(question)}`
        });
    },
    
    // 分享到聊天
    onShareAppMessage() {
        return {
            title: '日月山AI导览，智能问答带你游览~',
            path: '/pages/guide/index',
            imageUrl: 'https://636c-cloud1-9gzmqwpsa8336a66-1393371278.tcb.qcloud.la/images/ai-bot/share-guide-new.png'
        }
    },
    
    onLoad() {
    }
})
