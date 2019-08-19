export class Timer {
    time: number;
    startTime: Date;
    is_run: boolean;

    constructor(autoStart = false) {
        this.time = 0
        this.startTime = new Date()

        this.is_run = autoStart

        if (autoStart) this.start()
    }

    reset() {
        this.time = 0
    }

    set(currentTime: number) {
        this.time = currentTime

        if (this.is_run) this.start()
    }

    start(startTime = new Date()) {
        this.startTime = startTime
        this.is_run = true
    }

    stop(endTime = new Date()) {
        if (!this.is_run) {
            console.log('start time is not defined', this.time)
            return
        }

        this.time += (endTime.getTime() - this.startTime.getTime()) / 1000
        this.is_run = false
    }

    now() {
        let nowTime = new Date(),
            deltaTime = 0

        if (this.is_run) {
            deltaTime += (nowTime.getTime() - this.startTime.getTime()) / 1000
        }

        return this.time + deltaTime
    }
}
