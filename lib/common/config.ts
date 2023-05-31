import { Builder, WebDriver } from "selenium-webdriver";

export let driver : WebDriver
export let test: any ={}
export async function setDriver(browser : string , parallel: string) {
    if (parallel) {
        let supportedBrowsers = ["chrome", "firefox"];
        if (supportedBrowsers.includes(browser)) {
           driver = new Builder().forBrowser(browser).build();
           driver.manage().window().maximize();

         } else {
           throw new Error("Please select any of the mentioned supported browsers for parallel runs, which are : " + supportedBrowsers.toString());
        }
     } else {
        let supportedBrowsers = ["chrome", "firefox", "safari"];
        if (supportedBrowsers.includes(browser)) {
         console.log("Executing on : " + browser)
           driver = new Builder().forBrowser(browser).build();
           driver.manage().window().maximize();
        } else {
           throw new Error("Please select any of the mentioned supported browsers, which are : " + supportedBrowsers.toString());
        }
     }
  
}

export async function quitDriver() {
    driver.quit()
}