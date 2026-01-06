// pages/exhibits/detail/index.js

Page({
  data: {
    exhibitDetail: {},
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    audioContext: null,
    // t-swiper 配置
    current: 0,
    autoplay: true,
    swiperDuration: 500,
    interval: 5000,
    navigation: { type: 'fraction' },
    paginationPosition: 'bottom-right',
    swiperList: [],
    // t-image-viewer 配置
    visible: false,
    images: [],
    currentIndex: 0,
    deleteBtn: false,
    closeBtn: true,
    showIndex: true
  },

  async onLoad(options) {
    const id = options.id;
    if (id) {
      await this.loadDetail(id);
    }
  },

  // 从数据库加载详情数据
  async loadDetail(id) {
    try {
      const me = getApp();
      await me.getInitPromise();

      const res = await me.globalData.db.collection('exhibits').doc(id).get();
      const data = res.data;

      if (data) {
        const audioDuration = data.audio?.duration || 0;
        this.setData({
          exhibitDetail: {
            _id: data._id,
            name: data.name,
            description: data.description,
            audioUrl: data.audio?.url || '',
            duration: audioDuration,
            durationText: this.formatDuration(audioDuration)
          },
          swiperList: data.images || [],
          duration: audioDuration
        });

        // 创建音频上下文
        if (data.audio?.url) {
          this.createAudioContext(data.audio.url);
        }
      }
    } catch (err) {
      console.error('获取展品详情失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 创建音频上下文
  createAudioContext(audioUrl) {
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = audioUrl;

    audioContext.onPlay(() => {
      this.setData({ isPlaying: true });
    });

    audioContext.onPause(() => {
      this.setData({ isPlaying: false });
    });

    audioContext.onTimeUpdate(() => {
      this.setData({
        currentTime: Math.floor(audioContext.currentTime),
        duration: Math.floor(audioContext.duration) || this.data.duration
      });
    });

    audioContext.onEnded(() => {
      this.setData({
        isPlaying: false,
        currentTime: 0
      });
    });

    this.data.audioContext = audioContext;
  },

  // 播放/暂停音频
  toggleAudio() {
    const { audioContext, isPlaying } = this.data;

    if (!audioContext) {
      wx.showToast({
        title: '音频加载中...',
        icon: 'none'
      });
      return;
    }

    if (isPlaying) {
      audioContext.pause();
    } else {
      audioContext.play();
    }
  },

  // 滑块改变
  onSliderChange(e) {
    const value = e.detail.value;
    const { audioContext } = this.data;
    if (audioContext) {
      audioContext.seek(value);
    }
  },

  // 格式化时长显示（秒 -> m:ss）
  formatDuration(seconds) {
    if (!seconds) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  },

  // 格式化时间显示（用于进度条）
  formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  },

  // 打开图片查看器
  onSwiperTap() {
    const { swiperList, current } = this.data;
    if (swiperList && swiperList.length > 0) {
      this.setData({
        visible: true,
        images: swiperList,
        currentIndex: current || 0
      });
    }
  },

  // 图片查看器切换
  onImageViewerChange(e) {
    this.setData({
      currentIndex: e.detail.index
    });
  },

  // 关闭图片查看器
  onImageViewerClose() {
    this.setData({
      visible: false
    });
  },

  onUnload() {
    // 页面卸载时销毁音频
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }
  },

  // 分享转发功能
  onShareAppMessage() {
    const { exhibitDetail, swiperList } = this.data;
    return {
      title: `日月山景区 - ${exhibitDetail.name || '导览详情'}`,
      path: `/pages/exhibits/detail/index?id=${exhibitDetail._id}`,
      imageUrl: swiperList[0] || ''
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { exhibitDetail, swiperList } = this.data;
    return {
      title: `日月山景区 - ${exhibitDetail.name || '导览详情'}`,
      query: `id=${exhibitDetail._id}`,
      imageUrl: swiperList[0] || ''
    };
  }
});

