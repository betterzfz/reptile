/*
 * 并发任务池 v0.0.1
 *
 * By stone
 *
 * 用于管理并发事件的任务池
 */

var Q = require('q-retry');

var TaskPool = (function () {
    /**
     * 初始化一个人任务池.
     * @参数 maxcur 同时进行任务数
     * @参数 call 一个对任务进行操作的方法。
     */
    function TaskPool(maxcur, call) {
        this.tasks = []; //任务队列 

        this.suNum = 0; //完成数

        this.failNum = 0; //失败数

        this.waitNum = 0; //等待进行的任务数
        
        this.totalNum = 0; //总任务数
        
        
        this.index = 0; //当前任务索引
        this.onTask = 0; //当前正在进行的任务数
        
        this.maxcur = maxcur;
        this.call = call;
    }
    TaskPool.prototype.add = function (tasks) {
        
        if (!(tasks instanceof Array)) {
            tasks = [tasks];
        }
        this.totalNum += tasks.length;
        this.waitNum += tasks.length;
        this.tasks = this.tasks.concat(tasks);
    };
    
    TaskPool.prototype.start = function () {
        while (this.onTask < this.maxcur && this.tasks.length) {
            this.onTask++;
            this.deal(this.tasks.shift(), this.index++);
        }
    };
    TaskPool.prototype.deal = function (task, index) {
        var that = this;
            that.call(task, index)
                .then(function(){
                    that.fulfilled++;
                    that.waitNum--;
                    that.next();
                }).
                catch(function(err){
                    that.rejected++;
                    that.waitNum--;
                    that.next();
                });
    };
    
    TaskPool.prototype.next = function () {
        this.onTask--;
        if (this.pauseEvent) {
            if (!this.onTask) {
                this.pauseEvent.resolve(null);
            }
        }
        else {
            this.start();
        }
    };
    
    // 暂停任务队列，当前正在进行的任务会进行完而不会被取消
    TaskPool.prototype.pause = function () {
        if (this.pauseEvent) {
            if (!this.pauseEvent.promise.isPending()) {
                console.warn('任务队列已经被暂停。');
            }
            else {
                console.warn('任务队列暂停中。');
            }
        }
        else {
            this.pauseEvent = Q.defer();
            if (!this.onTask) {
                this.pauseEvent.resolve(null);
            }
        }
        return this.pauseEvent.promise;
    };
    /**
     * 重启任务
     */
    TaskPool.prototype.resume = function () {
        if (!this.pauseEvent) {
            console.warn('任务没有暂停');
            return;
        }
        this.pauseEvent = null;
        this.start();
    };
    
    return TaskPool;
})();
exports.TaskPool = TaskPool;