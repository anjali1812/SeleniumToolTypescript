import * as uihelper from "../lib/common/uihelper";
import * as utilsCommon from "../lib/common/utilsCommon";
import * as reporter from "../lib/common/reporter"

const argv = require('yargs').argv

describe("dummy test", function(){
    before(function(){
        utilsCommon.init(argv, __dirname,__filename) 
    })

    beforeEach(async function(){
        reporter.clearContext()        
    }) 

    it("1. Login with correct username and password", async function(){
        await uihelper.launchUrl("https://svadhi.globalvoxprojects.com/")
        await uihelper.login("svadhi@admin.com","Admin@1234","Login")
        await uihelper.logout()

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