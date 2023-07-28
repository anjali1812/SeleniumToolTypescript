import * as uihelper from "../common/uihelper"
import * as reporter from "../common/reporter"
import * as briUihelper from "./bridgeinvest_uihelper"
import { driver } from "../common/config"

export async function freezeUnfreezeColumns(dataMap : Map<string, string>) {

    console.log(dataMap.keys())

    await uihelper.click_with_xpath("//*[@id='freeze-column']")

    if(dataMap.has("columnNameToSelect")){
        await briUihelper.multipleSelectDropdown(dataMap.get("columnNameToSelect")!)
    }

    if(dataMap.has("columnNamesUnselect")){
        await briUihelper.multipleUnSelectInDropdown(dataMap.get("columnNamesUnselect")!)
    }

    if(dataMap.has("verifyColumnsFreezed")){
        let freezedColNames= dataMap.get("verifyColumnsFreezed")?.split(";") ?? []

        let selectedElems= await uihelper.getElementsWithXpath("//*[text()='freeze column']/../..//*[contains(@class,'css-b62m3t-container')]//div[normalize-space(@class)='css-wsp0cs-MultiValueGeneric']")
        let selectedoptions: string[]= []

        for (let i = 0; i < selectedElems.length; i++) {
            selectedoptions[i]= await selectedElems[i].getText()
        }

        for (let i = 0; i < freezedColNames.length; i++) {
            if(selectedoptions.includes[freezedColNames[i]])
                await reporter.pass("Given option : " + freezedColNames[i] + " is freezed as expected")
            else
                await reporter.failAndContinue("Given options : " + freezedColNames + " is not freezed as expected")
        }
    }

    if(dataMap.has("verifyErrorOnUnfreezeByDefaultCols")){

        if( await uihelper.verifyReadOnlyText("Can not Remove Default Freezed Column") )
            await reporter.pass("Error verified on trying to delete default freezed column", true)
        else
            await reporter.fail("Error NOT verified on trying to delete default freezed column", true)
    }
    
    if(dataMap.has("verifyMax6ColumnCanBeFreezed")){
        // try freezing 7 columns using columnNames and freezeUnfreeze keys
        // after 6 columns other labels will not get selected / not appear in the list 

        let colNotFreezed= dataMap.get("namesOfColumnNotFreezed")


        
    }

    await uihelper.click_with_xpath("//*[text()='freeze column']/../..//button[text()='Ok']")  
}