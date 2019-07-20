class Timer {
    constructor(autoStart = false) {
        this.time = 0

        if (autoStart) this.start()
    }

    reset() {
        this.time = 0
        this.startTime = null
    }

    set(currentTime) {
        this.time = currentTime

        if (this.startTime) this.start()
    }

    start(startTime = new Date()) {
        this.startTime = startTime
    }

    stop(endTime = new Date()) {
        if (!this.startTime) {
            console.log('start time is not defined', this.time)
            return
        }

        this.time += (endTime - this.startTime) / 1000
        this.startTime = null
    }

    now() {
        let nowTime = new Date(),
            deltaTime = 0

        if (this.startTime) {
            deltaTime += (nowTime - this.startTime) / 1000
        }

        return this.time + deltaTime
    }
}

module.exports = Timer