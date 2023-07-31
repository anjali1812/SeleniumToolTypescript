import * as uihelper from "../lib/common/uihelper";
import * as utilsCommon from "../lib/common/utilsCommon";
import * as reporter from "../lib/common/reporter"
import { Alert, WebDriver } from "selenium-webdriver";
import { driver } from "../lib/common/config"
import * as briUihelper from "../lib/bridgeinvest/bridgeinvest_uihelper"

const argv = require('yargs').argv

describe("dummy test", function(){
    before(function(){
        utilsCommon.init(argv, __dirname,__filename) 
    })

    beforeEach(async function(){
        reporter.clearContext()        
    }) 

    // it("1. Login with correct username and password", async function(){
    //     // await uihelper.launchUrl("https://the-internet.herokuapp.com/basic_auth")
    //     await uihelper.launchUrl("https://the-internet.herokuapp.com/javascript_alerts")
    //     await uihelper.waitForPageLoad()
    //     await uihelper.click_with_xpath("//*[text()='Click for JS Confirm']")    
    //     await uihelper.waitForPageLoad()      
    //     // await driver.switchTo().alert().sendKeys("HI")
    //     let alert =await driver.switchTo().alert()//.authenticateAs("admin","admin")

    //     await alert.dismiss()

    // })

    it("1. Grid fetch" , async function() {
        await uihelper.launchUrl("http://localhost:3000/demo/broker")
        await uihelper.waitForPageLoad()
        // await briUihelper.getTableHeaders()
        
        /* FILTER AND SAVE FILTER */
        // await briUihelper.filterTable("Hobbies and Interests", "input", "Foot")
        // await briUihelper.briClickButton("Save Current Filter")
        // await uihelper.setInInputText_with_xpath("xpath=//input[@placeholder='Filter Name']", "Test")
        // await uihelper.click_with_xpath("//*[text()='Save Filer']/../..//button[text()='Ok']")

        /* GET TABLE DATA */
        // await uihelper.click_with_xpath("xpath=(//*[@stroke='currentColor'])[1]")
        // await briUihelper.getTableData()

        /* Lock and edit thr row */
        // await uihelper.click_with_xpath("xpath=//button[@id='lockUnlock']")
        // await briUihelper.getTableData()
        // driver.actions().doubleClick(<ROW ELEM>).perform()

        /* DELETE NON SELECTED RECORD i.e just delete functionality */
        // await uihelper.click_with_xpath("xpath=//button[@id='delete']")
        // await briUihelper.selectCheckBox("Are you sure want to delete this contact only here?", "check");
        // await briUihelper.briClickButton("Delete")

        /* Verify values in table */
        // await briUihelper.verifyTableRow("First name;Last name;Notes;Addres","John;Doe;Will update him;B 203 Vasand nagar town",1)

        /* Add Entity Value */
        await briUihelper.addEntity("Entity Type;First name;Last name;Notes added date","Company;ABC;ABC;02/07/2023")
        await briUihelper.verifyTableRow("Entity Type;First name;Last name;Notes added date","Company;ABC;ABC;02/07/2023",1)

        await uihelper.click_with_xpath("xpath=//button[@id='lockUnlock']")
        await briUihelper.editEntity("First name;Last name;Notes added date","ABC;ABC;02/07/2023",2)


    })

    afterEach(async function(){
        reporter.addToContext(this)
    })

    after("Quit Driver", async function() {
        await utilsCommon.videoConverter()
        uihelper.quit()
    })
})