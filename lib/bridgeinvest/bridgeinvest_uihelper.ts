import { By, Key, WebElement } from "selenium-webdriver"
import * as uihelper from "../common/uihelper"
import * as reporter from "../common/reporter"
import { driver } from "../common/config"

export async function briClickButton(label: string) {

    if( label.toLowerCase().includes("xpath ") || label.includes("//"))
    {
        await uihelper.click_with_xpath(label)
        return
    }

    if(( await driver.findElements(By.xpath("//button[text()='" + label + "' or @title='" + label + "' or normalize-space(text())='"+ label +"']"))).length>0 ){
        let buttonElem: WebElement= await uihelper.getElementWithXpath("//button[text()='" + label + "' or @title='" + label + "' or normalize-space(text())='"+ label +"']")

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

export async function selectOneChoice(optionsToSelect:string, section? : string) {
    
    if(section){
        await uihelper.click_with_xpath("//*[text()='"+section+"']/../..//*[contains(@class,'css-b62m3t-container')]")
        await uihelper.click_with_xpath("//*[text()='"+section+"']/../..//*[contains(@class,'css-b62m3t-container')]//*[text()='"+optionsToSelect+"']")
    }
    else{
        await uihelper.click_with_xpath("xpath=(//*[contains(@class,'css-b62m3t-container')])[3]")
        await uihelper.click_with_xpath("xpath=(//*[contains(@class,'css-b62m3t-container')])[3]//*[text()='"+optionsToSelect+"']")
    }

}

export async function multipleSelectDropdown(optionsToSelect : string, section? : string, search?: string) {

    let options= optionsToSelect.split(";")

    let selectContainer: WebElement 
    if(section)
        selectContainer= await uihelper.getElementWithXpath("//*[text()='"+section+"']/../..//*[contains(@class,'css-b62m3t-container')]")
    else
        selectContainer= await uihelper.getElementWithXpath("(//*[contains(@class,'css-b62m3t-container')])[3]")

    if(selectContainer!= null){
        await selectContainer.click()
        await uihelper.waitForPageLoad()

        for (let i = 0; i < options.length; i++) {
        
            let option= options[i]
            
            await uihelper.waitForPageLoad()
            await uihelper.think(2)

            // if(search){
            //     let searchElem: WebElement= await selectContainer.findElement(By.xpath("//div[@class=' css-qbdosj-Input']"))
            //     await driver.executeScript("document.getElementsByClassName(' css-qbdosj-Input')[2].setAttribute('data-value','First name')")
            //     // await driver.executeScript("arguments[0].setAttribute(\"data-value\",arguments[1]);", searchElem, "abc");
    
            //     searchElem = searchElem.findElement(By.xpath("//input"))
            //     await driver.executeScript("document.getElementById('react-select-5-input').setAttribute('value','First name')")
            //     // await driver.executeScript("arguments[0].setAttribute(\"value\",arguments[1]);", searchElem, "abc");
    
            //     // await searchElem.click()
            //     // console.log("ID : "+ await searchElem.getAttribute("role"))
            //     // searchElem.sendKeys("abc")
            //     // searchElem.sendKeys(Key.ENTER)
                
            //     await uihelper.waitForPageLoad()
            //     await reporter.info("Searched with : " + optionToSelect, true)
    
            //     let searchResults= await selectContainer.findElements(By.xpath("//label"))
            //     if(searchResults.length == 0 ){
            //         await reporter.failAndContinue("Search option is not present in dropdown list", true)
            //         await uihelper.click_with_xpath("//*[text()='freeze column']/../..//button[text()='Ok']")
            //         return
            //     }
            //     return
            // }
            
            let allSelectedOptionsElem= await selectContainer.findElements(By.xpath("//*[normalize-space(@class)='css-wsp0cs-MultiValueGeneric']"))
            let allSelectedOptions : string[] = []

            for (let i = 0; i < allSelectedOptionsElem.length; i++) {
                allSelectedOptions[i]= await allSelectedOptionsElem[i].getText()
            }

            let selectElem = await selectContainer.findElements(By.xpath("//div[text()='"+option+"']")) //preceding-sibling::input")) //NO use of checkbox in multiple select

            if( allSelectedOptions.includes(option) ){
                await reporter.info(option + " is already selected", true)
            }else if(selectElem.length>0){
                let ifElemDisable= await selectElem[0].getAttribute("aria-disabled") 
                // Commented as the componentes arrangement changed
                //await selectElem[0].findElement(By.xpath("..")).getAttribute("aria-disabled")

                if(ifElemDisable.equalsIgnoreCase("false")) {
                    await uihelper.moveToElement(selectElem[0])
                    await selectElem[0].click()
                    await uihelper.waitForPageLoad()
                    await reporter.pass(option + " selected", true)
                }else{
                    await reporter.info(option + " is disabled in dropdown.", true)
                }
            }else{
                await reporter.fail(option + " not found in dropdown to select ", true)
            }
        
            await uihelper.waitForPageLoad()
            
        }
        await uihelper.click_with_xpath("//body")
        await uihelper.think(2)

    }else{
        await reporter.fail("Select Dropdown not present")
    }
    
}

export async function multipleUnSelectInDropdown(optionsToSelect : string, section? : string, search?: string) {
                    
    let options= optionsToSelect.split(";")

    let selectContainer: WebElement 
    if(section)
        selectContainer= await uihelper.getElementWithXpath("//*[text()='"+section+"']/../..//*[contains(@class,'css-b62m3t-container')]")
    else
        selectContainer= await uihelper.getElementWithXpath("(//*[contains(@class,'css-b62m3t-container')])[3]")
    
    if(selectContainer!= null){
        await uihelper.waitForPageLoad()

        for (let i = 0; i < options.length; i++) {
        
            let option= options[i]

            let selectedElems= await selectContainer.findElements(By.xpath("//*[normalize-space(@class)='css-wsp0cs-MultiValueGeneric']"))
    
            if(selectedElems.length > 0 ){
                await selectedElems[0].click()
                let allOptions = await getAllSelectedLabelsOfSelectComp(selectContainer)
                console.log(allOptions)
                await selectedElems[0].click()
        
                let unselectElem= await selectContainer.findElements(By.xpath("//following::div[@role='button' and @aria-label='Remove "+option+"']"))
        
                if(unselectElem.length==0 && allOptions.includes(option)){
                    await reporter.info(option + " already unselected", true)
                }
                else if(unselectElem.length > 0){
                    await unselectElem[0].click()
                    await uihelper.waitForPageLoad()
                    await reporter.pass(option + " unselected", true)
                }
                else
                    await reporter.fail(option + " not found to unselect", true)
            }else{
                await reporter.fail("No options are selected from the dropdown", true)
            }
        }
    }
    else{
        await reporter.fail("Select Dropdown not present")
    }
}

async function getAllSelectedLabelsOfSelectComp(selectElem : WebElement) {
    let allOptionsElem= await selectElem.findElements(By.xpath("//label"))
    let allOptions : string[] = []

    for (let i = 0; i < allOptionsElem.length; i++) {
        allOptions[i]= await allOptionsElem[i].getText()
    }

    return allOptions
}

export async function dragAndDrop() {
    await uihelper.click_with_xpath("//*[@id='config-column']")

    let fromElem= await driver.findElement(By.xpath("//*[@data-rbd-draggable-id='notesDate-3']"))

    // let toElem= await driver.findElement(By.xpath("//*[@data-rbd-droppable-id='droppable-1']"))

    driver.actions().dragAndDrop(fromElem, {x:434,y:40}).perform()

    
}

export async function selectCheckBox(checkboxName:string, checkUncheck: string) {
    let elem = await driver.findElements(By.xpath("//label[text()='"+checkboxName+"']/preceding-sibling::input"))

    if(elem.length > 0 ){
        let checkBoxElem= elem[0]
        let checkedState: string= await checkBoxElem.getAttribute("checked")

        // console.log("CHECKED : " + checkedState)

        if(checkUncheck.equalsIgnoreCase("check")){
            if(checkedState != null && checkedState.trim().equalsIgnoreCase("true"))
                await reporter.pass( checkboxName + " Already checked", true)
            else{
                await checkBoxElem.click()
                await reporter.pass(checkboxName + " checked", true)
            }    
        }else{
            if(checkedState.equalsIgnoreCase("false") || checkedState==null)
                await reporter.pass( checkboxName + " Already unchecked", true)
            else{
                await checkBoxElem.click()
                await reporter.pass(checkboxName + " unchecked", true)
            }
        }
        
    }else{
        await reporter.fail("Checkbox with label [" + checkboxName + "] not found", true)
    }
}

let headerElemLabel: string[]= []

export async function getTableHeaders() {
    let firstColumnHeaderElem= await driver.findElements(By.xpath("//*[@role='columnheader']"))

    let headerElems: WebElement[] = []

    await uihelper.waitForPageLoad()
    await firstColumnHeaderElem[0].findElement(By.xpath("//*[text()='#']/..")).click()

    let i =0
    while (true) {

        await uihelper.think(0.5)
        let elems= await driver.findElements(By.xpath("//*[@role='columnheader' and contains(@class,'ag-header-active')]"))

        headerElems[i] = elems[0]

        if(headerElems[i] != null ){
            headerElemLabel[i] = await headerElems[i].getText()

            if(headerElemLabel[i-1] === headerElemLabel[i])
            {
                // console.log("BREAK")
                break;
            }

            // console.log("Column : " + i + " => Text : " + headerElemLabel[i])
        }

        if(i==0)
            headerElemLabel[0]="#"

        await driver.actions().sendKeys(Key.ARROW_RIGHT).perform()

        i++

    }

}

export async function filterTable(colName: string, filterType: string, filterValue: string) {
    await getTableHeaders()

    await driver.findElement(By.xpath("//*[contains(@class,'ag-floating-filter') and @aria-colindex='1']")).click()

    let colPostion= headerElemLabel.indexOf(colName)
    console.log("Column : " + colName + " found at " + colPostion)
    let filter= filterType

    if(colPostion>=0){
        for (let i = 0; i < colPostion+1; i++) {
            await driver.actions().sendKeys(Key.RIGHT).perform()
        }

        await uihelper.think(2)

        if(filter.equalsIgnoreCase("input")){
            // let filterElem= await driver.findElement(By.xpath("//div[contains(@class,'ag-floating-filter') and @aria-colindex='"+ (colPostion + 1) +"']"))            
            await uihelper.setInInputText_with_xpath("xpath=//*[contains(@class,'ag-floating-filter') and @aria-colindex='"+ (colPostion + 1) +"']//input", filterValue)
        }else if(filter.equalsIgnoreCase("dropdown")){
            
        }else if(filter.equalsIgnoreCase("date")){
            await uihelper.setInInputText_with_xpath("xpath=(//*[contains(@class,'ag-floating-filter') and @aria-colindex='"+ (colPostion + 1) +"']//input)[last()]", filterValue)
        }else if(filter.equalsIgnoreCase("selection")){

        }

    }else{
        await reporter.fail("Column : " + colName + " not found in table")
    }
    
}

export async function getTableData() {


    let rows= await driver.findElements(By.xpath("//*[@class='ag-pinned-left-cols-container']//*[@row-index]"))

    let headerColumnMap = new Map<string,string>()
    let tableMap = new Map<number, Map<string,string>>()

    for (let i = 0; i < rows.length; i++) {
        await rows[0].findElement(By.xpath("//div[@aria-colindex='1']")).click()

        headerColumnMap= new Map<string,string>()

        for (let j = 0; j < headerElemLabel.length-1; j++) {
            let colvalue = await driver.findElement(By.xpath("//*[@class='ag-pinned-left-cols-container' or @class='ag-center-cols-container']//*[@row-index='"+ i +"']//div[@aria-colindex='"+(j+1)+"']"))

            // console.log(i + " => " + headerElemLabel[j] + " : " +  await colvalue.getText())
            headerColumnMap.set(headerElemLabel[j], await colvalue.getText())

            await driver.actions().sendKeys(Key.RIGHT).perform()
            await uihelper.think(0.2)
        }

        tableMap.set(i, headerColumnMap)
    }    

    // for (let i = 0; i < tableMap.size; i++) {
    //     console.log("Row Num : " + i)

    //     let tableData= tableMap.get(i)
    //     for(let headers of tableData!?.keys()){
    //         console.log("Column : " + headers + " => Value : "+ tableData?.get(headers))
    //     }
    // }

    return tableMap
}

export async function verifyTableRow(columnNames: string , columnValues: string, rowNumber: number) {
    let tableMap= await getTableData()

    let colNames= columnNames.split(";")
    let colValues= columnValues.split(";")

    let rowColMap = tableMap.get(rowNumber-1)

    if( rowColMap!= null){
        for (let j = 0; j < colNames.length; j++) {
            let uiColValue = rowColMap?.get(colNames[j])
    
            if(uiColValue == null){
                await reporter.failAndContinue("Column with name : " + colNames[j] + " does not exists")
                continue
            }
            if(uiColValue?.equalsIgnoreCase(colValues[j])){
                await reporter.pass("Column Name : " + colNames[j] + " at row " + rowNumber + " have value : " + colValues[j] )
            }else{
                await reporter.failAndContinue("Column Name : " + colNames[j] + " at row " + rowNumber + " not have value : " + colValues[j] )
            }
        }
    }else{
        await reporter.fail("Not found any record for given row number : " + rowNumber)
    }
}

export async function addEntity(columnNames: string, columnValues:string) {

    if(headerElemLabel.length <=0)
        await getTableHeaders()

    await briClickButton("Add")

    await addOrUpdateTableEntries(columnNames, columnValues, 0)
}

export async function editEntity(columnNames: string, columnValues:string, rowNumberToEdit : number) {
    if(headerElemLabel.length <=0)
        await getTableHeaders()

    if(await uihelper.isTextOrElementPresent("xpath=//*[@data-icon='lock']")){
        await uihelper.click_with_xpath("xpath=//button[@id='lockUnlock']")
        // Code to click collapse all . Then only editEntity accor to collapsed rows number
    }
    await uihelper.click_with_xpath("//*[contains(@class,'ag-header-row-column-filter')]//div[@aria-colindex='1']")

    for (let i = 0; i < 7; i++) {
        await driver.actions().sendKeys(Key.ARROW_RIGHT).perform()
    }

    let editRowElem= await uihelper.getElementWithXpath("//*[@class='ag-pinned-left-cols-container']//*[@row-index='"+(rowNumberToEdit-1)+"']//*[@aria-colindex='1']")
    await driver.actions().doubleClick(editRowElem).perform()

    await addOrUpdateTableEntries(columnNames, columnValues, (rowNumberToEdit-1))
}



export async function addContact(columnNames: string, columnValues:string, entitySrNo: number) {

    await uihelper.click_with_xpath("xpath=(//div[text()='"+entitySrNo+"']/..//*[@stroke='currentColor'])[2]")
    
    let rowNum= await driver.findElement(By.xpath("//div[text()='"+entitySrNo+"']/..")).getAttribute("row-index")

    console.log("New Contact Row Number : " + (parseInt(rowNum)+2))
}

async function addOrUpdateTableEntries(columnNames: string, columnValues:string, rowNumber: number) {
    let colNames= columnNames.split(";")
    let colValues= columnValues.split(";")

    await uihelper.click_with_xpath("//*[@class='ag-pinned-left-cols-container' or @class='ag-center-cols-container']//*[@row-index='"+rowNumber+"']//*[@aria-colindex='1']")
    for (let i = 0; i < headerElemLabel.length; i++) {
        
        if(colNames.includes(headerElemLabel[i])){
            let colPos= headerElemLabel.indexOf(headerElemLabel[i])

            let cellElemXpath= "//*[@class='ag-pinned-left-cols-container' or @class='ag-center-cols-container']//*[@row-index='"+rowNumber+"']//*[@aria-colindex='"+(colPos+1)+"']"
            if( (await driver.findElements(By.xpath(cellElemXpath+"//input"))).length > 0 ){
                await uihelper.setInInputText_with_xpath("xpath="+cellElemXpath+"//input",colValues[colNames.indexOf(headerElemLabel[i])])
            }else{
                await uihelper.click_with_xpath(cellElemXpath)
                await uihelper.click_with_xpath("xpath=//*[contains(@class,'ag-popup')]//*[text()='"+colValues[colNames.indexOf(headerElemLabel[i])]+"']")
            }
        }

        await uihelper.think(0.2)
        if( i< (headerElemLabel.length -3) )
            await driver.actions().sendKeys(Key.TAB).perform()

    }

    await uihelper.click_with_xpath("//*[@class='ag-pinned-left-cols-container' or @class='ag-center-cols-container']//*[@row-index='"+rowNumber+"']//*[@class='fa-solid fa-check']")
}