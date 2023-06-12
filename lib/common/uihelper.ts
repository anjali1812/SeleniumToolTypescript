import * as globalConfig from "./config"
import * as reporter from "./reporter"
import { By, Key, WebDriver, until } from "selenium-webdriver"

let driver: WebDriver
export async function launchUrl(url :string) {
    driver= globalConfig.driver;
    driver.get(url)

    await reporter.pass("Launched " + url, true)
}
export async function think(Sec: number) {
    return new Promise(resolve => setTimeout(resolve, Sec * 1000));
}
export async function login(username:string, password:string, buttonText: string){
    await setInInputText("Email", username)
    await setInInputText("Password", password)

    await clickButton(buttonText)

    await reporter.pass(username + " logged in successfully", true)
}


export async function logout(){
    if((await driver.findElements(By.css(".Toastify"))).length > 0){
        await think(5)
    }
    
    await clickLink("Logout")

    await reporter.pass("Logged out successfully", true)
}

export async function clickLink(linkName: string){

    await driver.findElement(By.xpath("//a[.='"+linkName+"']")).click()

    await reporter.pass("Clicked on " + linkName, true)
}

export async function setInInputText(label : string,text: string){

    let xpath= "//label[contains(text(),'"+label+"')]//following::input[1]"

    await driver.findElement(By.xpath(xpath)).clear()

    await driver.findElement(By.xpath(xpath)).sendKeys(text)
    await driver.findElement(By.xpath(xpath)).sendKeys(Key.TAB)

    await reporter.pass("Value " + text + " entered in " + label + " inputbox", true)
}

export async function clickButton(buttonText:string){
    await driver.findElement(By.xpath("//button[text()='"+buttonText+"' or @title='"+buttonText+"']")).click()

    await reporter.pass("Clicked on " + buttonText, true)
}

export async function verifyToastMessage(textToBeVerified: string){

    await driver.wait(until.elementLocated(By.css(".Toastify__toast-container")), 50000)

    let toastElem= await driver.findElements(By.css(".Toastify__toast-container"))

    if(toastElem.length > 0){
        let toastMsg= await toastElem[0].getAttribute("innerText")
        await reporter.info("Toast Message On UI : " + toastMsg, false)

        if( toastMsg.toLowerCase().includes(textToBeVerified) ){
            await reporter.pass("Toast message [ " + textToBeVerified + " ] verified successfully.", true);
        } else {
            await reporter.fail("Toast message [ " + textToBeVerified + " ] not verified successfully.", true);
        }
    }else{
        await reporter.fail("Toast not displayed on UI", true)
    }

}

export async function quit() {
    globalConfig.quitDriver()
}