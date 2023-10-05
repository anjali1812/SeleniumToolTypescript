import * as globalConfig from "./config";
import * as reporter from "./reporter"
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import "../common/extensions"

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const Jimp = require("jimp");
const papa = require("papaparse");
const _ = require("lodash")

export async function init(cmdArgs: any, dirPath: string, filePath: string) {

    console.log("\n" + JSON.stringify(cmdArgs) + "\n")

    globalConfig.test.testname = filePath.replace(dirPath + "/", "").replace("ts", "");
    if (os.type().toLocaleLowerCase().startsWith("win")) {
        globalConfig.test.testname = filePath.replace(dirPath + "\\", "").replace("ts", "");
    }

    globalConfig.test.abspath = path.resolve(__dirname, "../../../SeleniumToolTypescript").replaceAll("\\", "/")
    globalConfig.test.tsPath = filePath
    globalConfig.test.csvPath = filePath.replaceAll("\\", "/").replace(".ts", ".csv")

    let ro = String(cmdArgs["reporter-options"]).split(",");
    ro.forEach(function (o: string) {
        if (o.startsWith("reportDir")) {
            globalConfig.test.resultfolder = o.replace("reportDir=", "");
        }
    });

    console.log("Result Folder : " + globalConfig.test.resultfolder)

    if (!fs.existsSync(globalConfig.test.resultfolder + "/screenshots"))
        fs.mkdirSync(globalConfig.test.resultfolder + "/screenshots", { recursive: true })
    if (!fs.existsSync(globalConfig.test.resultfolder + "/downloads"))
        fs.mkdirSync(globalConfig.test.resultfolder + "/downloads", { recursive: true })
    if (!fs.existsSync(globalConfig.test.resultfolder + "/videos"))
        fs.mkdirSync(globalConfig.test.resultfolder + "/videos", { recursive: true })

    globalConfig.test.browser = cmdArgs.browser

    await setBrowserConfig(cmdArgs.browser, cmdArgs.docker)

    reporter.setLogger()
}

export async function setBrowserConfig(browser:string, docker: boolean) {
    if( browser.equalsIgnoreCase("chrome") ){
        if(docker){
            console.log("DOCKER RUN")
            globalConfig.test.execType = "docker"
            let caps={
                "browserName": "chrome"
            }

            globalConfig.setDriver(caps, "true")
        }else{
            let caps= {
                "browserName": "chrome",
                "goog:chromeOptions": {
                    "prefs":{
                        "download.default_directory": path.resolve(globalConfig.test.resultfolder + "/downloads"),
                        "download.prompt_for_download": false,
                        "download.directory_upgrade": true,
                        "plugins.plugins_disabled": "Chrome PDF Viewer",
                        "plugins.always_open_pdf_externally": true,
                        "download.extensions_to_open": "applications/pdf",
                        "safebrowsing.enabled": true
                    }
                },
            }
    
            globalConfig.setDriver(caps)
        }
    }else if(browser.equalsIgnoreCase("firefox")){
        if(docker){
            console.log("DOCKER RUN")
            globalConfig.test.execType = "docker"
            let caps={
                "browserName": "firefox"
            }

            globalConfig.setDriver(caps, "true")
        }else{
            let caps= {
                "browserName": "firefox",
                    "moz:firefoxOptions": {
                        "prefs":{
                            "browser.download.folderList": 2,
                            "browser.download.dir": path.resolve(globalConfig.test.resultfolder + "/downloads"),
                            "browser.helperApps.neverAsk.saveToDisk":"text/csv",
                            "pdfjs.disabled": true
                        }
                    },
            }

            globalConfig.setDriver(caps)
        }
    }
}

export function getTimeStamp() {
    const runDate = new Date();
    return String(runDate.getFullYear() + "_" + String(Number(runDate.getMonth() + 1)).padStart(2, "0") + "_" + String(runDate.getDate()).padStart(2, "0") + "T" + String(runDate.getHours()).padStart(2, "0") + "_" + String(runDate.getMinutes()).padStart(2, "0") + "_" + String(runDate.getSeconds()).padStart(2, "0") + "_" + String(runDate.getMilliseconds()).padStart(3, "0"));
}

export async function sleep(seconds: number) {
    const waitTill = new Date(new Date().getTime() + Number(seconds * 1000));
    while (waitTill > new Date()) { }
}

export async function getCsvSteps() {

    let newSteps: any[] = []
    let invalidCsv = false
    let csvPath = globalConfig.test.csvPath

    if (fs.existsSync(csvPath)) {
        let keywords = await getKeywords()

        let csvData = fs.readFileSync(csvPath).toString()
        let csvParsedData = papa.parse(csvData, { delimiter: "," })
        let csvSteps = csvParsedData.data

        for (let i = 0; i < csvSteps.length; i++) {
            let step = csvSteps[i]
            let newStep: any = {}
            if (step && step.length > 0) {
                let firstColumn = _.first(step)

                if (firstColumn.toString().equalsIgnoreCase("skip")) {
                    newStep['zeroColumn'] = firstColumn
                    step = _.drop(step)
                    firstColumn = _.first(step).trim()
                }

                let api = _.find(keywords, function (item: any) {
                    return ((item.name).toString().equalsIgnoreCase(firstColumn))
                })

                if (api) {
                    newStep['api'] = api.name
                    newStep['path'] = api.path
                    newStep['descr'] = api.descr
                    newStep['data'] = _.drop(step)

                    newSteps.push(newStep)
                } else {
                    reporter.failAndContinue("Method '" + firstColumn + "' does not exists. Check and update csv")
                    invalidCsv = true
                }
            }
        }
    } else {
        console.error(csvPath + " CSV does not exists at given path")
    }
    // console.log(newSteps)
    // console.log(">>>>>>>>>>>>>>>>>>>"+newSteps.length)

    if (invalidCsv)
        return []
    else
        return newSteps
}

async function getKeywords() {
    let keywords = JSON.parse(fs.readFileSync(path.resolve("./apiNamesPathsDescr.json"), "utf-8")).items

    return keywords
}

export async function executeStep(step: any) {
    await reporter.info("Step [ " + step.api + " ]", false)
    await reporter.info("Data [ " + step.data + " ]", false)

    let dataMap = await convertStepArrayToMap(step.data)

    let apiToCall = step.api
    let libPath = globalConfig.test.abspath + "/" + step.path
    let apis: any = await import(libPath)

    if (apis[apiToCall]) {
        if ((step.path).includes("uihelper")) {
            let argsArray: any[] = []
            dataMap.forEach(value => {
                argsArray.push(value)
            })

            await apis[apiToCall].apply(apis, argsArray)
        } else {
            await apis[apiToCall].call(apis, dataMap)
        }
    }
    else {
        reporter.fail("Method '" + step.api + "' does not exists. Check and update csv.")
    }
}

async function convertStepArrayToMap(data: string[]) {
    let map = new Map()

    for (let i = 0; i < data.length; i++) {
        let d = data[i].trim()

        if (d.includes("=")) {
            if (d.includes("xpath")) {
                map.set("arg" + i, d.substring(d.indexOf("xpath")))
            }else{
                let key = d.substring(0, d.indexOf("=")).trim()
                let value = d.substring(d.indexOf("=") + 1).trim()
    
                if (value != "") {
                    map.set(key, value)
                }    
            }
        } else {
            map.set("arg" + i, d)
        }
    }

    return map;
}

export async function videoConverter() {

    if (globalConfig.test.execType !== "docker") {

        const videoEncoder = "h264"
        try {

            let videoDirPath = path.resolve(globalConfig.test.resultfolder + "/videos")
            let imagesDirPath = path.resolve(globalConfig.test.resultfolder + "/screenshots")

            if (fs.readdirSync(imagesDirPath).length > 0) {
                let videoFilePath = path.resolve(videoDirPath + "/" + globalConfig.test.testname)

                fs.mkdirSync(globalConfig.test.resultfolder + "/temp", { recursive: true })
                let tempDirpath = path.resolve(globalConfig.test.resultfolder + "/temp")

                let images = fs.readdirSync(imagesDirPath)

                for (let i = 0; i < images.length; i++) {
                    let image = await Jimp.read(imagesDirPath + "\\" + images[i]);
                    image.writeAsync(tempDirpath + "\\" + (i + 1) + ".png")
                }

                // console.log("Encoding");
                await exec(`ffmpeg -start_number 1 -i ${tempDirpath}\\%d.png -vcodec ${videoEncoder} -filter:v "setpts=4.0*PTS" ${videoDirPath}\\tempVideo.mp4`);

                if (fs.existsSync(videoDirPath + "\\tempVideo.mp4")) {
                    // console.log("Slowing down");
                    await exec(`ffmpeg -i ${videoDirPath}\\tempVideo.mp4 -vf "setpts=10.0*PTS" ${videoFilePath}.mp4`);
                }
                else {
                    await reporter.fail("No Video Created")
                }

                fs.rmSync(tempDirpath, { recursive: true, force: true })
                fs.unlinkSync(videoDirPath + "\\tempVideo.mp4")
            }

        } catch (error) {
            console.log("An error occurred:", error);
        }
    }


};
