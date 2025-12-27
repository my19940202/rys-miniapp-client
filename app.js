// app.js 入口
App({
    onLaunch: async function () {
        if (wx.cloud) {
            // 初始化云开发环境 cdn和云数据库
            const wxCloud = new wx.cloud.Cloud({
                resourceEnv: 'cloud1-9gzmqwpsa8336a66',
                resourceAppid: 'wx407b5d02bf64bfb0'
            });
            await wxCloud.init();
            const db = wxCloud.database();
            this.globalData = {
                wxCloud, db
            };

            // 获取初始化配置
            this.fetchInitData();
        }
    },
    fetchInitData() {
        const me = this;
        // 云函数请求 获取用户id
        const openId = wx.getStorageSync('openId');
        if (!openId) {
            me.globalData.wxCloud.callFunction({
                name: 'helloworld',
                success: function (res) {
                    const { openId } = res.result && res.result.event && res.result.event.userInfo;
                    wx.setStorageSync('openId', openId);
                    me.fetchUserInfo(openId)
                    me.fetchWordCounter(openId)
                }
            })
        }
        else {
            me.fetchUserInfo(openId)
            me.fetchWordCounter(openId)
        }
    },
    fetchUserInfo(openId) {
        const me = this;
        // 加载用户信息 用于判断是否强制跳转个人信息页面填写
        me.globalData.db.collection('users')
            .where({ _openid: { $eq: openId } })
            .field({ name: true, school: true, grade: true, is_admin: true })
            .get()
            .then(res => {
                const userInfos = res.data || [];
                if (userInfos && userInfos[0]) {
                    wx.setStorageSync('userInfo', userInfos[0]);
                }
            });
    },
    fetchWordCounter(openId) {
        const me = this;
        me.globalData.db.collection('word_counters')
            .where({ _openid: { $eq: openId } })
            .get()
            .then(res => {
                wx.setStorageSync('wordCounters', res.data);
            });
    }
});
