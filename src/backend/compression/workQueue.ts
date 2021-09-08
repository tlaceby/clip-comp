export class Work_Queue {
    private queue: WorkProperties[] = [];
    public count = 0;
    public current: WorkProperties | null = null;

    public push (newWork: WorkProperties[]) {
        newWork.forEach((w) => {
            this.queue.push(w);
            this.count ++;
        })

        this.current = this.queue[0];

        return this.queue;
    }

    public next () {
        if (this.queue.shift()) this.count -= 1;
        
        if (this.queue.length == 0) return null;

        else {
            this.current = this.queue[0];
            return this.current;
        }
    }


    public get() {
        return this.queue;
    }
}