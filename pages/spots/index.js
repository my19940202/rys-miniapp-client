Page({
  data: {
    spotsList: [],
    page: 0,
    pageSize: 5,
    hasMore: true,
    loading: false
  },

  async onLoad() {
    await this.fetchSpotsList();
  },

  // 从数据库获取景点列表
  async fetchSpotsList() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });

    try {
      const me = getApp();
      await me.getInitPromise();
      const { page, pageSize, spotsList } = this.data;

      const res = await me.globalData.db.collection('scenic_spots')
        .where({
          isDelete: false,
          status: 'active'
        })
        .field({
          name: true,
          images: true,
          description: true,
          audio: true
        })
        .skip(page * pageSize)
        .limit(pageSize)
        .get();

      const list = res.data.map(item => ({
        _id: item._id,
        name: item.name,
        coverImage: item.images?.[0] || '',
        description: item.description,
        audioUrl: item.audio?.url || '',
        duration: this.formatDuration(item.audio?.duration || 0)
      }));

      this.setData({
        spotsList: [...spotsList, ...list],
        page: page + 1,
        hasMore: list.length === pageSize,
        loading: false
      });
    } catch (err) {
      console.error('获取景点列表失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 触底加载更多
  onReachBottom() {
    this.fetchSpotsList();
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({
      spotsList: [],
      page: 0,
      hasMore: true
    });
    await this.fetchSpotsList();
    wx.stopPullDownRefresh();
  },

  // 跳转到详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/spots/detail/index?id=${id}`
    });
  },

  // 格式化时长显示（秒 -> m:ss）
  formatDuration(seconds) {
    if (!seconds) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  },

  // 分享转发功能
  onShareAppMessage() {
    return {
      title: '日月山景区导览',
      path: '/pages/spots/index',
      imageUrl: this.data.spotsList[0]?.coverImage || ''
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '日月山景区导览',
      query: ''
    };
  }
});
