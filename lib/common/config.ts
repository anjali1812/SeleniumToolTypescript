import { Builder, WebDriver } from "selenium-webdriver";
export let driver: WebDriver
export let test: any = {}

export async function setDriver(capabilities: any, dockerRun?: any) {

  if(dockerRun){
    driver = new Builder().usingServer("http://localhost:4444/").withCapabilities(capabilities).build();
  }else{
    driver= new Builder().withCapabilities(capabilities).build()
  }

  // if (browser.toLowerCase() == "chrome") {
  //   if (dockerRun == "true") {
  //     let caps={
  //       "browserName": "chrome"
  //     }
  //     driver = new Builder().usingServer("http://localhost:4444/").withCapabilities(capabilities).build();
  //   } else {
  //     let caps={}

  //     driver= new Builder().withCapabilities(caps).build()
  //   }
  // } else if (browser.toLowerCase() == "firefox") {
  //     if (dockerRun == "true") {
  //       let caps={
  //         "browserName": "firefox"
  //       }
  //       driver = new Builder().usingServer("http://localhost:4444/").withCapabilities(caps).build();
  //     } else {
  //       driver = new Builder().withCapabilities(caps).build();
  //     }
  // }
  // //  else if (browser.toLowerCase() == "edge") {
  // //     if (dockerRun == "true") {
  // //       driver = new Builder().usingServer("http://localhost:4444/").withCapabilities(Capabilities.edge()).build();
  // //     } else {
  // //       driver = new Builder().forBrowser("MicrosoftEdge").build();
  // //     }
  // // }
  driver.manage().window().maximize();
}

export async function quitDriver() {
  driver.quit()
}