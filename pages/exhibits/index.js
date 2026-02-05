Page({
  data: {
    exhibitsList: [],
    page: 0,
    pageSize: 5,
    hasMore: true,
    loading: false,
    searchKeyword: '',
    selectedTag: '古道博物馆北馆'
  },

  async onLoad() {
    await this.fetchExhibitsList();
  },

  // 从数据库获取展品列表
  async fetchExhibitsList(type) {
    if (this.data.loading || (type !== 'reload' && !this.data.hasMore)) return;
    this.setData({ loading: true });

    try {
      const me = getApp();
      await me.getInitPromise();
      const { page, pageSize, exhibitsList, searchKeyword } = this.data;

      // 构建查询条件
      const query = {
        isDelete: false,
        status: 'active',
        tags: this.data.selectedTag
      };

      // 如果有搜索关键词，使用正则表达式进行模糊匹配
      if (searchKeyword && searchKeyword.trim()) {
        query.name = me.globalData.db.RegExp({
          regexp: searchKeyword.trim(),
          options: 'i'
        });
      }

      const res = await me.globalData.db.collection('exhibits')
        .where(query)
        .field({
          name: true,
          images: true,
          description: true,
          audio: true,
          code: true,
          tags: true
        })
        .skip(page * pageSize)
        .limit(pageSize)
        .get();

      const list = res.data.map(item => ({
        _id: item._id,
        name: item.name,
        code: item.code,
        coverImage: item.images?.[0] || '',
        description: item.description,
        audioUrl: item.audio?.url || '',
        duration: this.formatDuration(item.audio?.duration || 0)
      }));

      this.setData({
        exhibitsList: type === 'reload' ? list : [...exhibitsList, ...list],
        page: page + 1,
        hasMore: list.length === pageSize,
        loading: false
      });
    } catch (err) {
      console.error('获取展品列表失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 触底加载更多
  onReachBottom() {
    this.fetchExhibitsList();
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({
      exhibitsList: [],
      page: 0,
      hasMore: true
    });
    await this.fetchExhibitsList();
    wx.stopPullDownRefresh();
  },

  // 搜索输入框值变化
  onSearchInputChange(e) {
    this.setData({
      searchKeyword: e.detail.value || ''
    });
  },

  // 处理搜索按钮点击
  async handleSearch() {
    // 重置分页状态
    this.setData({
      exhibitsList: [],
      page: 0,
      hasMore: true
    });
    // 重新获取数据
    await this.fetchExhibitsList();
  },

  // 跳转到详情页
  goToDetail(e) {
    const code = e.currentTarget.dataset.code;
    wx.navigateTo({
      url: `/pages/exhibits/detail/index?code=${code}`
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
      path: '/pages/exhibits/index',
      imageUrl: this.data.exhibitsList[0]?.coverImage || ''
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
      page: 0
    }, () => {
      me.fetchExhibitsList('reload');
    });
  }
});
