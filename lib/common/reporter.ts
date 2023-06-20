import { assert } from "chai";
import * as globalConfig from "./config"
import * as utilsCommon from "./utilsCommon"
import { configure, getLogger } from "log4js";
import * as fs from "fs";

const addContext = require('mochawesome/addContext');
const logger = getLogger()
const dateFormat = require("dateformat")

export let contextMessages: any[] = []

export function setLogger() {
    configure({
        appenders: { 'out': { type: 'stdout', layout: { type: 'pattern', pattern: '[%d{yyyy-MM-dd} %r] [%p] %m' } } },
        categories: { default: { appenders: ['out'], level: "debug" } }
    });
}

export let step_status = { abort: false, fail: false, msg: "" }

export function clearContext() {
    contextMessages = []
    step_status.fail = false
}

export async function debug(value: string) {
    logger.debug(value);
    return;
}

export async function info(message: string, capture?: boolean) {
    logger.info(message);
    let contMsg: any = {};

    contMsg.text = "[" + dateFormat("yyyy-mm-dd HH:MM:ss") + "]" + "[INFO] : " + message;

    if (capture) {
        let imagePath = "/screenshots/" + await utilsCommon.getTimeStamp() + ".png";
        await takeScreenshot(globalConfig.test.resultfolder + imagePath);
        contMsg.img = "." + imagePath;
    }

    contextMessages.push(contMsg);
    return;
}

export async function pass(message: string, capture?: boolean) {
    logger.info(message)
    let contMsg: any = {}

    contMsg.text = "[" + dateFormat("yyyy-mm-dd HH:MM:ss") + "]" + "[Pass] : " + message

    if (capture) {
        let imagePath = "/screenshots/" + await utilsCommon.getTimeStamp() + ".png"
        await takeScreenshot(globalConfig.test.resultfolder + imagePath)
        contMsg.img = "." + imagePath
    }

    contextMessages.push(contMsg)
    return;
}

export async function fail(message: string, capture?: boolean) {
    logger.fatal(message)
    let contMsg: any = {}

    contMsg.text = "[" + dateFormat("yyyy-mm-dd HH:MM:ss") + "]" + "[FAIL] : " + message

    if (capture) {
        let imagePath = "/screenshots/" + await utilsCommon.getTimeStamp() + ".png"
        await takeScreenshot(globalConfig.test.resultfolder + imagePath)
        contMsg.img = "." + imagePath

    }

    contextMessages.push(contMsg)

    step_status.abort = true
    step_status.fail = true
    step_status.msg = contMsg.text

    assert.fail(message)
}
export async function failAndContinue(message: string, capture?: boolean) {
    logger.fatal(message)
    let contMsg: any = {}

    contMsg.text = "[" + dateFormat("yyyy-mm-dd HH:MM:ss") + "]" + "[FAIL] : " + message

    if (capture) {
        let imagePath = "/screenshots/" + await utilsCommon.getTimeStamp() + ".png"
        await takeScreenshot(globalConfig.test.resultfolder + imagePath)
        contMsg.img = "." + imagePath

    }

    contextMessages.push(contMsg)

    step_status.fail = true
    step_status.msg = contMsg.text
}

export async function takeScreenshot(imagePath: string) {
    let image = await globalConfig.driver.takeScreenshot()
    fs.writeFileSync(imagePath, image, 'base64')
}

export function addToContext(testContext: Mocha.Context) {
    // console.log("AddToContext : " + contextMessages.length)
    contextMessages.forEach(msg => {
        addContext(testContext, msg.text)

        if (msg.img)
            addContext(testContext, msg.img)
    })
}