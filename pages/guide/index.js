Page({
    data: {
        questions: [
            { icon: '✨', text: '邂逅日月山：令人心动的风景' },
            { icon: '📖', text: '为我讲个日月山的故事' },
            { icon: '✨', text: '去哪玩？日月山景点必打卡攻略' },
            { icon: '📷', text: '来拍！日月山出片秘境全解锁' },
            { icon: '🍖', text: '你难道不知道吗？青海美食多到扶墙走' },
            { icon: '🐪', text: '文成公主与日月山的传说' },
            { icon: '🎁', text: '特产&非遗：带得走的青海记忆' },
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
