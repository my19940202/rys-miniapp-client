// app.js 入口
App({
    onLaunch: async function () {
        // 初始化 Promise 用于等待初始化完成
        this.globalData = this.globalData || {};
        this._resolveInit = null;
        this.initPromise = new Promise((resolve) => {
            this._resolveInit = resolve;
        });

        if (wx.cloud) {
            // 初始化云开发环境 cdn和云数据库
            const wxCloud = new wx.cloud.Cloud({
                resourceEnv: 'cloud1-9gzmqwpsa8336a66',
                resourceAppid: 'wx407b5d02bf64bfb0'
            });
            await wxCloud.init();
            const db = wxCloud.database();
            this.globalData = {
                ...this.globalData,
                wxCloud, db
            };
        }

        // 初始化完成，resolve
        if (this._resolveInit) this._resolveInit();
    },
    getInitPromise() {
        return this.initPromise;
    }
});
