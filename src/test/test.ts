import { assert } from "chai"
import io from "socket.io-client"
import { Socket } from "socket.io"

import { PORT, ADMIN } from "../config"
import { anyStringVal } from "../utils/util"

import { login } from "./actions";

describe('socket login', () => {
    let superClient: Socket

    beforeEach((done) => {
        superClient = <Socket><unknown>io.connect(`http://localhost:${PORT}`, {
            reconnectionDelay: 0,
            forceNew: true
        })

        superClient.on('connect', () => {
            done()
        })
    })

    it('as client', (done) => {
        login(superClient, 'hamid')

        superClient.on('validation', (data: anyStringVal) => {
            assert.isTrue(data['condition'])
            done()
        })
    })

    describe('as admin', () => {
        it('wrong data', (done) => {
            login(superClient, 'fjdk:dsjdl')

            superClient.on('validation', (data: anyStringVal) => {
                assert.isTrue(data['condition'])
                assert.isFalse(data['is_admin'])
                done()
            })

        })

        it('correct data', (done) => {
            login(superClient, `${ADMIN.username}:${ADMIN.password}`)

            superClient.on('validation', (data: anyStringVal) => {
                assert.isTrue(data['condition'])
                assert.isTrue(data['is_admin'])
                done()
            })
        })
    })

})

describe('get room data after login', () => {
    let superClient: Socket

    beforeEach((done) => {
        superClient = <Socket><unknown>io.connect(`http://localhost:${PORT}`, {
            reconnectionDelay: 0,
            forceNew: true
        })

        superClient.on('connect', () => {
            login(superClient, 'user')
            done()
        })
    })

    it('', (done) => {
        superClient.on('data', (data: anyStringVal) => {

            assert.hasAllKeys(data,
                ['currentTime', 'video_src', 'is_play', 'is_fullscreen']
            )

            done()
        })
    })

})