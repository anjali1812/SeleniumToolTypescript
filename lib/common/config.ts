import { Builder, Capabilities, WebDriver } from "selenium-webdriver";

export let driver: WebDriver
export let test: any = {}
export async function setDriver(browser: string, dockerRun?: any) {

  if (browser.toLowerCase() == "chrome") {
    if (dockerRun == "true") {
      driver = new Builder().usingServer("http://localhost:4444/").withCapabilities(Capabilities.chrome()).build();
    } else {
      driver = new Builder().forBrowser("chrome").build();
    }
  } else if (browser.toLowerCase() == "firefox") {
    if (dockerRun == "true") {
      driver = new Builder().usingServer("http://localhost:4444/").withCapabilities(Capabilities.firefox()).build();
    } else {
      driver = new Builder().forBrowser("firefox").build();
    }
  } else if (browser.toLowerCase() == "edge") {
    if (dockerRun == "true") {
      driver = new Builder().usingServer("http://localhost:4444/").withCapabilities(Capabilities.edge()).build();
    } else {
      driver = new Builder().forBrowser("MicrosoftEdge").build();
    }
  }
  driver.manage().window().maximize();
}

export async function quitDriver() {
  driver.quit()
}