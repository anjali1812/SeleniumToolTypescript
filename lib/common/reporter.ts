import * as globalConfig from "./config"
import * as utilsCommon from "./utilsCommon"
import { configure, getLogger } from "log4js";
import * as fs from "fs";

const addContext = require('mochawesome/addContext');
const logger = getLogger()
var screenshot = require('desktop-screenshot');

export let contextMessages : any[]=[]

export function setLogger() {
    configure({
        appenders: { 'out': { type: 'stdout', layout: { type: 'pattern', pattern: '[%d{yyyy-MM-dd} %r] [%p] %m' } } },
        categories: { default: { appenders: ['out'], level: "debug" } }
    });
}

export function clearContext() {
    contextMessages = []
}

export async function info(message: string, capture?: boolean) {
    logger.info(message);
    let contMsg: any = {};
 
    contMsg.txt = "[INFO] : " + message;
 
    if (capture) {
       let imagePath = "/screenshots/" + await utilsCommon.getTimeStamp() + ".png";
       await takeScreenshot(globalConfig.test.resultFolder + imagePath);
       contMsg.img = "." + imagePath;
    }
 
    contextMessages.push(contMsg);
    return;
}

export async function pass(message:string, capture?: boolean) {
    logger.info(message)
    let contMsg : any= {}

    contMsg.text= "[Pass] : " + message

    if(capture){
        let imagePath = "/screenshots/" + await utilsCommon.getTimeStamp() + ".png"
        await takeScreenshot(globalConfig.test.resultfolder + imagePath)
        contMsg.img= "." + imagePath

    }

    contextMessages.push(contMsg)
    return;
}

export async function fail(message:string, capture?: boolean) {
    logger.fatal(message)
    let contMsg : any= {}

    contMsg.text= "[FAIL] : " + message

    if(capture){
        let imagePath = "/screenshots/" + await utilsCommon.getTimeStamp() + ".png"
        await takeScreenshot(globalConfig.test.resultfolder + imagePath)
        contMsg.img= "." + imagePath

    }

    contextMessages.push(contMsg)
    throw new Error("Failed : " + message)
}

export async function takeScreenshot(imagePath: string) {
    let image = await globalConfig.driver.takeScreenshot()
    fs.writeFileSync(imagePath, image, 'base64')
        
}

export function addToContext(testContext:Mocha.Context) {

    // console.log("AddToContext : " + contextMessages.length)

    contextMessages.forEach( msg=>{
        addContext(testContext, msg.text)

        if(msg.img)
            addContext(testContext, msg.img)
    } )
}