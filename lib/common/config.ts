import { Builder, WebDriver } from "selenium-webdriver";

export let driver : WebDriver
export let test: any ={}
export async function setDriver(browser : string, dockerRun? : any) {

    if(dockerRun){
        driver = new Builder().usingServer("http://localhost:4444").forBrowser(browser).build();
    }else{
        driver = new Builder().forBrowser(browser).build();
        driver.manage().window().maximize();         
    }
}

export async function quitDriver() {
    driver.quit()
}