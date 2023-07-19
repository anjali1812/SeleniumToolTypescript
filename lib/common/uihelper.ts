import * as path from "path";
import * as globalConfig from "./config"
import * as reporter from "./reporter"
import { By, Key, WebDriver, WebElement, until } from "selenium-webdriver"
import * as fs from "fs";

let driver: WebDriver
export async function launchUrl(url: string) {
    driver = globalConfig.driver;
    driver.get(url)

    await reporter.pass("Launched " + url, true)
}

export async function think(Sec: number) {
    return new Promise(resolve => setTimeout(resolve, Sec * 1000));
}

export async function logout() {
    if ((await driver.findElements(By.css(".Toastify"))).length > 0) {
        await think(5)
    }

    await clickLink("Logout")

    await reporter.pass("Logged out successfully", true)
}

export async function clickLink(linkName: string) {

    await driver.findElement(By.xpath("//a[.='" + linkName + "']")).click()

    await reporter.pass("Clicked on " + linkName, true)
}

export async function setInInputText_with_xpath(label: string, value: string) {
    let xpath: string
    xpath= label.substring(label.indexOf("=")+1, label.length).trim()

    let inputElem= await getElementWithXpath(xpath)

    if(inputElem != null){
        if (value && value.toLowerCase().equals("[tab]")) {
            await inputElem.sendKeys(Key.TAB)
            return
        } else if (value && value.toLowerCase().equals("[enter]")) {
            await inputElem.sendKeys(Key.ENTER)
            return
        }else{
            await moveToElement(inputElem)
            await inputElem.clear()

            await inputElem.sendKeys(value)
            await inputElem.sendKeys(Key.TAB)
        
            await reporter.pass("Value " + value + " entered in input field with xpath " + label , true)
            return false
        }
    }else{
        await reporter.fail("Element not found with xpath " + xpath, true)
        return false
    }
}

export async function click_with_xpath(label: string) {

    let buttonXpath: string=""

    if(label.toLowerCase().includes("xpath") || label.startsWith("//")){
        if(label.startsWith("//"))
            buttonXpath= label
        else
            buttonXpath = label.substring(label.indexOf("=")+1, label.length).trim()
    }

    let buttonElem : WebElement = await getElementWithXpath(buttonXpath)

    if(buttonElem!=null && await buttonElem.isDisplayed()){
        await moveToElement(buttonElem)
        await highlightElement(buttonElem)
        await buttonElem.click()
        await reporter.pass("Clicked button with xpath : " + label, true)
        return true
    }
    else{
        await reporter.fail("Element/ Button not found with xpath : "+ label, true)
        return false
    }

}

export async function getElementWithXpath(xpath:string) {
    try{
        try{
            await waitForPageLoad()
            let elem: any = await driver.wait(until.elementLocated(By.xpath(xpath)), 2000)
            return elem
        }
        catch(err){
            return null
        }    
    }finally{}

}

export async function getElementsWithXpath(xpath: string) {
	try {
		await waitForPageLoad();
		let elements = await driver.findElements(By.xpath(xpath))
		return elements;
	} finally {
	}
}

export async function waitForPageLoad() {
    for (let i = 0; i < 180; i++) {
        await think(1)
        try{
            let pageready : string = await driver.executeScript("return document.readyState")

            if(pageready == "complete")
                return
        }catch(error){
            reporter.debug("Problem while loading page ... " + error)
        }
    }
}

export async function moveToElement(elem:WebElement) {
    await driver.executeScript("arguments[0].scrollIntoView(true);", elem)
}

export async function highlightElement(elem:WebElement) {
    await driver.executeScript("arguments[0].setAttribute('style', 'background: yellow; border: 2px solid red;');", elem)
    await think(0.5)
}

export async function verifyToastMessage(textToBeVerified: string) {

    await driver.wait(until.elementLocated(By.css(".Toastify__toast-container")), 50000)

    let toastElem = await driver.findElements(By.css(".Toastify__toast-container"))

    if (toastElem.length > 0) {
        let toastMsg = await toastElem[0].getAttribute("innerText")
        await reporter.info("Toast Message On UI : " + toastMsg, true)

        if (toastMsg.toLowerCase().includes(textToBeVerified)) {
            await reporter.pass("Toast message [ " + textToBeVerified + " ] verified successfully.", true);
        } else {
            await reporter.fail("Toast message [ " + textToBeVerified + " ] not verified successfully.", true);
        }
    } else {
        await reporter.fail("Toast not displayed on UI", true)
    }

}

export async function quit() {
    globalConfig.quitDriver()
}

export async function isTextOrElementPresent(label: string) {

    if(label.toLowerCase().includes("xpath") || label.startsWith("//")){
        let elems= await getElementsWithXpath(label.replace("xpath=",""))
        if(elems.length>0){
            if(await elems[0].isDisplayed()){
                await moveToElement(elems[0])
                await reporter.pass("Text | Element with xpath [" + label + "] found", true)
                return true
            }
        }
        else{
            await reporter.info("Text | Element with xpath [" + label + "] not found", true)
            return false;
        }
    }else{
        return await verifyReadOnlyText(label)
    }

    return false
}

export async function verifyReadOnlyText(text:string, strictCheck= true) {
    let ele: WebElement;
    try {
        let XPATH = "";
        if (strictCheck == false) {
            let case_in_sensitive_xpath = 'translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="' + text.toLowerCase() + '"';
            XPATH = '//*[normalize-space(text())="' + text + '" or normalize-space(@title)="' + text + '" or .="' + text + '" or ' + case_in_sensitive_xpath + "]";
        } else {
            XPATH = '//*[normalize-space(text())="' + text + '" or normalize-space(@title)="' + text + '" or .="' + text + '"]';
        }
        await reporter.debug(XPATH);
        ele = await driver.findElement(By.xpath(XPATH));
        if (ele) {
            if ((await ele.isDisplayed()) == true) {
                await highlightElement(ele);
                await moveToElement(ele);
                await reporter.pass("Text found [ " + text + " ]", true);
                return true
            } else {
                await reporter.warn("Text found but not displayed [ " + text + " ]", true);
                return true
            }
        } else {
            await reporter.info("Text not found [ " + text + " ]", true);
            return false
        }
    } catch (error) {
        await reporter.fail(String(error), true);
    }

    return false
}

export async function closeModal(dialogTitle: string) {
    let closeElem = await driver.findElement(By.xpath("//*[normalize-space(@class)='modal-title' and text()='"+dialogTitle+"']/following-sibling::button[@aria-label='Close']"))

    if(closeElem!= null)
    {
        await reporter.info("Closing dialog : " + dialogTitle)
        await closeElem.click()
        await reporter.pass(dialogTitle + " dialog closed", true)
    }else{
        await reporter.fail(dialogTitle + " dialog not found to close", true)
    }
}

export async function getDownloadedFile() {
    await think(5)
    let downloadDirPath = path.resolve(globalConfig.test.resultfolder + "/downloads")
    let newFile= ""
    let files= fs.readdirSync(downloadDirPath)

    for (let i = 0; i < files.length; i++) {
        if( newFile==null ){
            newFile= files[i]
            continue
        }

        let file1_time= fs.statSync(path.resolve(downloadDirPath + "/" + files[i])).mtime.getTime()
        let file2_time= fs.statSync(path.resolve(downloadDirPath + "/" + newFile)).mtime.getTime()

        if(file1_time > file2_time)
            newFile= files[i]
    }

    if(newFile != null){
        await reporter.pass("Latest downloaded file path : " + path.resolve(downloadDirPath + "/" + newFile))
        return (downloadDirPath + "/" + newFile)
    }else{
        await reporter.fail("No files found in downloads folder ")
        return null
    }
}