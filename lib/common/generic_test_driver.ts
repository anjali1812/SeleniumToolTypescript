import * as uihelper from "./uihelper";
import * as utilsCommon from "./utilsCommon";
import * as reporter from "./reporter"
import * as globalConfig from "./config"
import { assert } from "chai";

export function runTest(argv: any, dirname: string, filename: string){
    it("Test Details", async function(){
        await reporter.addToContext(this)
    })
    
    before(async function () {
        utilsCommon.init(argv, dirname, filename)
        let teststeps = await utilsCommon.getCsvSteps();
    
        describe(globalConfig.test.testname, async function () {
            beforeEach(async function () {
                reporter.clearContext()
                if (reporter.step_status.abort)
                    this.skip()
            })
        
            if (teststeps.length >0) {
                for (let i = 0; i < teststeps.length; i++) {
                    const step = teststeps[i];
                    (step.zeroColumn=='skip' ? xit : it)(step.descr, async function () {
                        await utilsCommon.executeStep(step)
                        
                        if (reporter.step_status.fail)
                            assert.fail(reporter.step_status.msg)
                    })
                }
            } else {
                it("Failed to get test data", async function () {
                    assert.fail("Check 'seleniumlog.txt' for more details")
                });
            }
        
            afterEach(async function () {
                reporter.addToContext(this)
            })
        })
    })
    
    after("Quit Driver", async function () {
        await utilsCommon.videoConverter()
        uihelper.quit()
    })
}



