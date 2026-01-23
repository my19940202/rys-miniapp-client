import { URL_PREFIX } from '../../constant/index';

Page({
    data: {
        showGuideVideo: false,  // 控制弹窗显示
        videoSrc: '',  // 随机视频源
        videoLoading: true, // 视频加载状态
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
            imageUrl: URL_PREFIX + '/images/ai-bot/share-guide-new.png'
        }
    },
    onLoad() {
        // 页面载入后 t-popup 马上显示，先展示 loading
        this.setData({ showGuideVideo: true, videoLoading: true });
        this.initRandomVideo();
    },

    // 随机选择视频
    initRandomVideo() {
        const videos = [
            'guide-leopard.mp4',
            'guide-fox.mp4',
            'guide-tiger.mp4',
            'guide-def.mp4'
        ];
        const icons = [
            'icon-leopard.jpg',
            'icon-fox.jpg',
            'icon-tiger.jpg',
            'icon-def.jpg'
        ];
        const randomIndex = Math.floor(Math.random() * videos.length);
        const videoPath = `cloud://cloud1-9gzmqwpsa8336a66.636c-cloud1-9gzmqwpsa8336a66-1393371278/video/guide/${videos[randomIndex]}`;
        this.setData({
            videoSrc: videoPath,
            iconSrc: `cloud://cloud1-9gzmqwpsa8336a66.636c-cloud1-9gzmqwpsa8336a66-1393371278/images/guide/${icons[randomIndex]}`,
            videoLoading: true
        });
    },

    // 视频可以播放时（加载完成）
    onVideoCanPlay() {
        this.finishVideoLoading();
    },

    // 元数据加载完成（比 canplay 更常触发）
    onVideoLoadedMeta() {
        this.finishVideoLoading();
    },

    // 开始播放（最可靠的时机）
    onVideoPlay() {
        this.finishVideoLoading();
    },

    // 统一收口：隐藏 loading，并兜底触发播放
    finishVideoLoading() {
        if (this.data.videoLoading) {
            this.setData({ videoLoading: false });
        }
        // 确保开始播放（autoplay 通常已足够，这里兜底）
        const ctx = wx.createVideoContext('guideVideo', this);
        ctx.play();
    },

    // 视频播放结束
    onVideoEnded() {
        this.closeGuideVideo();
    },

    // 视频加载/播放错误
    onVideoError(e) {
        console.error('视频播放错误:', e);
        this.closeGuideVideo();
    },

    // 跳过视频
    skipVideo() {
        this.closeGuideVideo()
    },

    // 关闭引导视频弹窗
    closeGuideVideo() {
        this.setData({ showGuideVideo: false, videoLoading: true });
        // wx.setStorageSync('guide_video_watched', true);
    }
})
