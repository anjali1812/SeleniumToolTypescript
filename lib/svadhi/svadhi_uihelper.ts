import * as uihelper from "../common/uihelper"
import { By, Key} from "selenium-webdriver"
import * as globalconfig from "../common/config"
import * as reporter from "../common/reporter"

let driver= globalconfig.driver

export async function login_svadhi(username: string, password: string) {
    await setInInputText_svadhi("Email", username)
    await setInInputText_svadhi("Password", password)

    await clickButton_svadhi("Login")

    await reporter.pass(username + " logged in successfully", true)
}
export async function setInInputText_svadhi(label: string, value: string) {
    let xpath: string
    if(label.includes("xpath")){
        await uihelper.setInInputText_with_xpath(label, value)
        return
    }

    xpath = "//label[contains(text(),'" + label + "')]//following::input[1]"
    let inputElem= driver.findElement(By.xpath(xpath))
    if(inputElem != null){
        await inputElem.clear()

        await inputElem.sendKeys(value)
        await inputElem.sendKeys(Key.TAB)
    
        await reporter.pass("Value " + value + " entered in " + label + " inputbox", true)
        return true
    }else{
        await reporter.fail(label + " not found", true)
        return false;
    }
}

export async function clickButton_svadhi(label: string) {
    
    if( label.toLowerCase().includes("xpath ") || label.includes("//"))
    {
        await uihelper.clickButton_with_xpath(label)
        return
    }

    let buttonElem= await driver.findElement(By.xpath("//button[text()='" + label + "' or @title='" + label + "']"))

    if(buttonElem != null){
        await uihelper.moveToElement(buttonElem)
        await uihelper.highlightElement(buttonElem)
        await buttonElem.click()
    
        await reporter.pass("Clicked on " + label, true)      
        return true  
    }else{
        await reporter.fail(label + " not found", true)
        return false
    }
}