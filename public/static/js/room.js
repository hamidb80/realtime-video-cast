/**
 * ABOUT HTML5 video player
 * it has a currentTime propery that exists when the video exists
 * the currentTime property is a Interger that shows how many seonds
 * has spended from the first of the video
 * 
 * e.g: currentTime: 100 => currentTime: 1:40'
 */

const fullUrl = window.location.href
let socket = io.connect(fullUrl)

let room = new Vue({
    el: '#app',

    delimiters: ['[[', ']]'],

    data: {
        // user data
        username: '',
        is_admin: false,
        is_offline: false,

        // video data
        is_play: false,
        is_fullscreen: false,

        additionalTime: 0,
        savedTime: 0,

        video_src: '',
        nameSuggestion: [],
        selectedIndex: 0,

        extantTime: 0,

        slide: 0,
        clients: [],

        video_names: []
    },

    computed: {
        onlineClients() {
            return this.clients.filter(client => client.is_online).length
        }
    },

    methods: {
        send_username() {
            socket.emit('set_username', { username: this.username })
        },

        // --- admin functions ---
        set_play() {
            this.send_play_state(!this.is_play)
        },

        send_play_state(val) {
            socket.emit('set_play', { condition: val })
        },

        set_video_time(val) {
            socket.emit('set_video_time', { currentTime: val })
        },

        set_zero() {
            this.send_play_state(false)
            this.set_video_time(0)
        },

        set_video_src() {
            socket.emit('set_video_src', { src: this.video_src })
        },

        set_fullscreen() {
            // toggle is_fullscreen
            this.is_fullscreen = !this.is_fullscreen

            socket.emit('set_fullscreen', { condition: this.is_fullscreen })
        },

        logout() {
            // remove saved username from localStorage
            localStorage.removeItem('username')
            // send leave message to the server
            socket.emit('leave')

            // refresh the page
            setTimeout(() => document.location.reload(), 300)
        },

        timeUpdate() {
            // update size of progess-bar
            let currentTime = this.$refs['video_player'].currentTime
            let duration = this.videoDuration()

            this.extantTime = duration - currentTime

            this.$refs['progress_bar'].style['width'] =
                (currentTime / duration) * 100 + '%'
        },

        surfOnVideo(event) {
            // admin required checler
            if (!this.is_admin) return

            let fullWidth = this.$refs['progress'].clientWidth
            let distanceFromLeft = event.offsetX

            this.set_video_time((distanceFromLeft / fullWidth) * this.videoDuration())
        },


        playPauseVideoPlayer(fisrtPlay = false) {
            let video_player = this.$refs['video_player']

            // wait for initalize video player & check video is ready to play 
            // readyState = 4: have enought buffering to play video
            if (video_player === undefined || video_player.readyState !== 4) {

                if (this.savedTime != 0) {
                    this.additionalTime = this.savedTime
                    this.savedTime = 0
                }

                let delay = 500 // per ms
                this.additionalTime += delay / 1000 // ms to sec

                setTimeout(() => this.playPauseVideoPlayer(true), delay)
                return
            }

            // if video wants to play for first time after video source changed
            if (fisrtPlay) {
                video_player.currentTime = this.additionalTime
                this.additionalTime = 0
            }
            else {
                video_player.currentTime += this.additionalTime
            }

            // change play state
            if (this.is_play)
                video_player.play()
            else
                video_player.pause()
        },

        // make digital clock style
        clockify(seconds) {
            let mins = Math.floor(seconds / 60),
                secs = Math.floor(seconds % 60)

            return `${timeStyle(mins)} : ${timeStyle(secs)}`
        },

        videoDuration() {
            return this.$refs['video_player'].duration
        },


        getSuggestionFile() {
            if (this.video_src == '') {
                this.nameSuggestion = []
                this.selectedIndex = 0
                return
            }

            fetch(`${fullUrl}videos?name=${this.video_src}`)
                .then(res => res.json())
                .then(res => {
                    this.nameSuggestion = res['matchedNames']
                })
        },

        changeSelectedIndex(action) {
            if (action === 1 && this.selectedIndex != this.nameSuggestion.length - 1)
                this.selectedIndex += 1

            else if (action === -1 && this.selectedIndex != 0)
                this.selectedIndex -= 1
        },

        setVideoSrc() {
            this.video_src = this.nameSuggestion[this.selectedIndex]
            this.selectedIndex = 0
            this.nameSuggestion = []
        }
    },

    watch: {
        is_play() {
            let video_player = this.$refs['video_player']
            this.playPauseVideoPlayer()
        },

        is_fullscreen(newVal) {
            body = document.body

            if (newVal)
                body.classList.add('fullscreen')
            else
                body.classList.remove('fullscreen')
        },
    },

    mounted() {
        // register with saved username if it exists
        let saved_username = localStorage.getItem('username')

        if (saved_username) {
            this.username = saved_username
            this.send_username()
        }


        // define listerners
        socket.on('validation', data => {
            // check validation is successful
            if (data.condition) {
                let username = this.username

                // save the username to localStorage
                localStorage.setItem('username', username)

                if (data.is_admin) {
                    this.is_admin = true
                    username = 'admin'
                }

                this.username = username

                // go to next slide
                this.slide++
            }

            else notify('data is not correct', 'bg-danger')

        })

        socket.on('change_play', data => {
            this.is_play = data.condition
        })

        socket.on('change_video_src', data => {
            this.video_src = data.src
            this.additionalTime = 0
            video_player = this.$refs['video_player']

            video_player.pause()
        })

        socket.on('change_fullscreen', data => {
            this.is_fullscreen = data.condition
        })

        socket.on('get_users', data => {
            this.clients = data.clients
        })

        socket.on('user_action', data => {
            let boldedText = bold(data.username)

            switch (data['action']) {
                case 'connected':
                    notify(`user ${boldedText} is connected`, 'bg-success')
                    break

                case 'disconnected':

                    notify(`user ${boldedText} is disconnected`, 'bg-danger')
                    break

                case 'left':
                    notify(`user ${boldedText} logged out`, 'bg-warning')
                    break
            }

        })

        socket.on('change_video_time', data => {
            this.timeUpdate()

            video_player = this.$refs['video_player']
            video_player.currentTime = data.currentTime
        })


        socket.on('data', data => {
            this.is_fullscreen = data.is_fullscreen
            this.video_src = data.video_src
            this.savedTime = data.currentTime
            this.is_play = data.is_play
        })

        socket.on('disconnect', data => {
            notify('connection error', 'bg-danger', 10000)
            notify('please refresh this webpage', 'bg-info', 10000)

            this.is_offline = true
        })

    }
})

function bold(text) {
    return `<b>${text}</b>`
}

function notify(text, className = '', duration = 3000) {

    Toastify({
        'text': text,
        'duration': duration,
        'close': true,
        'gravity': "bottom", // `top` or `bottom`
        'positionLeft': false, // `true` or `false`
        'className': className
    }).showToast()

}

function timeStyle(num) {
    return num < 10 ? '0' + num : num
}