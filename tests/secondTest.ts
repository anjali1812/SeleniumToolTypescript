import { afterEach, before, beforeEach } from "mocha";
import * as uihelper from "../lib/common/uihelper";
import * as utilsCommon from "../lib/common/utilsCommon";
import * as globalConfig from "../lib/common/config"
// const addContext = require('mochawesome/addContext');
const argv = require('yargs').argv

import * as reporter from "../lib/common/reporter"
import { By, Key, WebDriver, until } from "selenium-webdriver";

describe("dummy test", function(){
    let driver :WebDriver
    before(function(){
        utilsCommon.init(argv, __dirname,__filename)
    })

    beforeEach(async function(){
        reporter.clearContext()        
    })

    it("2. Login with correct username and password and verify TOAST and Home Page Url", async function(){
        await uihelper.launchUrl("https://svadhi.globalvoxprojects.com/")
        await uihelper.login("svadhi@admin.com","Admin@1234","Login")
        await uihelper.verifyToastMessage("user login successfully")
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

// console.log(__dirname)
// console.log(__filename)