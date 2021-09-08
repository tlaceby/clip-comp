"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Work_Queue = void 0;
var Work_Queue = /** @class */ (function () {
    function Work_Queue() {
        this.queue = [];
        this.count = 0;
        this.current = null;
    }
    Work_Queue.prototype.push = function (newWork) {
        var _this = this;
        newWork.forEach(function (w) {
            _this.queue.push(w);
            _this.count++;
        });
        this.current = this.queue[0];
        return this.queue;
    };
    Work_Queue.prototype.next = function () {
        if (this.queue.shift())
            this.count -= 1;
        if (this.queue.length == 0)
            return null;
        else {
            this.current = this.queue[0];
            return this.current;
        }
    };
    Work_Queue.prototype.get = function () {
        return this.queue;
    };
    return Work_Queue;
}());
exports.Work_Queue = Work_Queue;
