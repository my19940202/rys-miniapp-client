Page({
  data: {
    spotsList: [],
    page: 0,
    pageSize: 5,
    hasMore: true,
    loading: false,
    selectedTag: '历史人文'
  },

  async onLoad() {
    await this.fetchSpotsList();
  },

  // 从数据库获取景点列表
  async fetchSpotsList(type) {
    if (this.data.loading || (type !== 'reload' && !this.data.hasMore)) return;
    this.setData({ loading: true });

    try {
      const me = getApp();
      await me.getInitPromise();
      const { page, pageSize, spotsList } = this.data;

      const res = await me.globalData.db.collection('scenic_spots')
        .where({
          isDelete: false,
          status: 'active',
          tags: this.data.selectedTag
        })
        .field({
          name: true,
          images: true,
          description: true,
          audio: true,
          tags: true
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
        spotsList: type === 'reload' ? list : [...spotsList, ...list],
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
    console.log('onReachBottom')
    this.fetchSpotsList();
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
  },

  // 标签选择改变
  onTagChange(e) {
    const me = this;
    me.setData({
      selectedTag: e.detail.value,
      page: 0,
    }, () => {
      me.fetchSpotsList('reload');
    });
  }
});
