import * as uihelper from "../lib/common/uihelper";
import * as svadhi from "../lib/svadhi/svadhi_uihelper"
import * as utilsCommon from "../lib/common/utilsCommon";
const argv = require('yargs').argv

import * as reporter from "../lib/common/reporter"
import { assert } from "chai";

describe("dummy test", function(){
    before(function(){
        utilsCommon.init(argv, __dirname,__filename)
    })

    beforeEach(async function(){
        reporter.clearContext()  
        if(reporter.step_status.abort)      
            this.skip()
    })

    it("2. Login with correct username and password and verify TOAST and Home Page Url", async function(){
        await uihelper.launchUrl("https://svadhi.globalvoxprojects.com/")
        await uihelper.think(5)
        await svadhi.login_svadhi("svadhi@admin.com","Admin@1234")
        await uihelper.verifyToastMessage("user login successfully")
        await uihelper.logout()

        if(reporter.step_status.fail)
            assert.fail(reporter.step_status.msg)
    })

    it.skip("2. Login with correct username and password and verify TOAST and Home Page Url", async function(){
        await uihelper.launchUrl("https://svadhi.globalvoxprojects.com/")
        // await uihelper.login("svadhi@admin.com","Admin@1234","Login")
        await uihelper.verifyToastMessage("user login successfully")
        await uihelper.logout()

        if(reporter.step_status.fail)
            assert.fail(reporter.step_status.msg)
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