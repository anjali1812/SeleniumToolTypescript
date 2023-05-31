import { afterEach, before, beforeEach } from "mocha";
import * as uihelper from "../lib/common/uihelper";
import * as utilsCommon from "../lib/common/utilsCommon";
import * as globalConfig from "../lib/common/config"
const argv = require('yargs').argv

import * as reporter from "../lib/common/reporter"
import { WebDriver } from "selenium-webdriver";

let driver: WebDriver

export const initVideoRecorder = () => {
// Only start recording with getUserMedia API if we're in firefox and video-enabled and run mode.
// TODO: this logic should be cleaned up or gotten from some video-specific config value

    window.navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
        // mediaSource "browser" is supported by a firefox user preference
        // @ts-ignore
        mediaSource: 'browser',
        frameRate: {
        exact: 30,
        },
    },
    })
    .then((stream) => {
    const options = {
        mimeType: 'video/webm',
    }

    const mediaRecorder = new window.MediaRecorder(stream, options)

    mediaRecorder.start(200)

    // mediaRecorder.addEventListener('dataavailable', (e) => {
    //   Cypress.action('recorder:frame', e.data)
    // })
    })
}

describe("dummy test", function(){
    before(function(){
        utilsCommon.init(argv, __dirname,__filename) 
        driver= globalConfig.driver   
    })

    beforeEach(async function(){
        reporter.clearContext()        
    }) 

    it("1. Login with correct username and password", async function(){

        // let js= "window.navigator.mediaDevices.getDisplayMedia()"

        // console.log(await driver.executeAsyncScript("return " + js) != null +" CHECK")
        await uihelper.launchUrl("https://svadhi.globalvoxprojects.com/")
        await uihelper.login("svadhi@admin.com","Admin@1234","Login")
        await uihelper.logout()
    })

    afterEach(async function(){
        reporter.addToContext(this)
    })

    after("Quit Driver", async function() {
        await utilsCommon.videoConverter()
        uihelper.quit()
    })
})

console.log(__dirname)
// console.log(__filename)