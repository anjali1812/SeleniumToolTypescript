import * as uihelper from "../lib/common/uihelper";
import * as utilsCommon from "../lib/common/utilsCommon";
import * as reporter from "../lib/common/reporter"
import * as supertest from "supertest";

const argv = require('yargs').argv

const token= "02d6354a267117606049840b3b275aba2fb1c539270544e627861855e89b8379"

describe("dummy test", function(){
    before(function(){
        utilsCommon.init(argv, __dirname,__filename) 
    })

    beforeEach(async function(){
        reporter.clearContext()        
    }) 

    it("1. Get Operation" , async function() {
        let getOperation= supertest("https://gorest.co.in/public/v2")

        let res= await getOperation.get("/users?access-token="+token)

        if(res==null)
            reporter.fail(res)
        else
            reporter.pass(res.body)
    })

    it("2. One User Get Operation" , async function() {
        let getOperation= supertest("https://gorest.co.in/public/v2")

        let res= await getOperation.get("/users/5131589?access-token="+token)

        if(res==null)
            reporter.fail(res)
        else
            reporter.pass(res.body.id)
    })

    afterEach(async function(){
        reporter.addToContext(this)
    })

    after("Quit Driver", async function() {
        await utilsCommon.videoConverter()
        uihelper.quit()
    })
})