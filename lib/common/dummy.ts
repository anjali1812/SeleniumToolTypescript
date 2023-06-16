import * as fs from "fs"
import * as path from "path"
import * as globalConfig from "./config"
import * as reporter from "./reporter"
import "./extensions"

const papa = require("papaparse");
const _ = require("lodash")

export async function getCsvSteps() {

    let newSteps : any[] = []
    let invalidCsv= false
    let csvPath= await getCsvPath()

    if( fs.existsSync(csvPath) ){
        let keywords = await getKeywords()

        let csvData= fs.readFileSync(csvPath).toString()
        let csvParsedData = papa.parse(csvData, { delimiter: "," })
        let csvSteps= csvParsedData.data
    
        for (let i = 0; i < csvSteps.length; i++) {
            let step = csvSteps[i]
            let newStep : any = {}
            if(step && step.length>0){
                let firstColumn= _.first(step)

                if(firstColumn.toString().equalsIgnoreCase("skip")){
                    newStep['zeroColumn']= firstColumn 
                    step= _.drop(step)
                    firstColumn= _.first(step).trim()
                }

                let api = _.find(keywords, function(item: any){
                    return ( (item.name).toString().equalsIgnoreCase(firstColumn) )
                })

                if(api){
                    newStep['api']= api.name
                    newStep['path']=api.path
                    newStep['descr']= api.descr
                    newStep['data']= _.drop(step)

                    newSteps.push(newStep)
                }else {
                    reporter.failAndContinue("Method '" + firstColumn + "' does not exists. Check and update csv")
                    invalidCsv= true
                }
            }
        }
    }else{
        console.error(csvPath + " CSV does not exists at given path")
    }
    // console.log(newSteps)
    // console.log(">>>>>>>>>>>>>>>>>>>"+newSteps.length)

    if(invalidCsv)
        return []
    else
        return newSteps
}

async function getKeywords() {
    let keywords= JSON.parse(fs.readFileSync(path.resolve(__dirname+"/apiNamesPathsDescr.json"), "utf-8")).items

    return keywords
}

async function getCsvPath() {
    let folders :any[]= []
    let testFolder= globalConfig.test.testfolder

    getSubDirectories(testFolder, folders)

    for (let index = 0; index < folders.length; index++) {
        const testFolderPath = folders[index];
        if (fs.existsSync(path.join(testFolderPath, globalConfig.test.testname + ".csv")))
            return testFolderPath.replace(/\\/g, "/") + "/" + globalConfig.test.testname + ".csv"
    }

    return (testFolder + "/" + globalConfig.test.testname + ".csv").replaceAll("\\","/")
}

function getSubDirectories(testFolder: string, folders: any[]){
    fs.readdirSync( testFolder,  { withFileTypes: true } ).
    filter( (item)=>{ item.isDirectory() } ).
    map( (item)=>{
        folders.push(path.join(testFolder, item.name));
        getSubDirectories(path.join(testFolder, item.name), folders)
    } )
}

export async function executeStep(step: any) {
    await reporter.info("Step [ " + step.api + " ]", false)
    await reporter.info("Data [ " + step.data + " ]", false)

    let dataMap= await convertStepArrayToMap(step.data)

    let apiToCall = step.api
    let libPath= globalConfig.test.abspath + "/" + step.path
    let apis : any = await import(libPath)

    if( apis[apiToCall] ){
        if( (step.path).includes("uihelper") ){
            let argsArray : any []= []
            dataMap.forEach( value =>{
                argsArray.push(value)
            })
    
            await apis[apiToCall].apply(apis, argsArray )    
        }else{
            await apis[apiToCall].call(apis, dataMap)
        }
    }
    else{
        reporter.fail("Method '" + step.api + "' does not exists. Check and update csv.")
    }
}

async function convertStepArrayToMap(data: string[]){
    let map = new Map()
    
    for (let i = 0; i < data.length; i++) {
        let d= data[i].trim()        

        if(d.includes("=")){
            let key= d.substring(0, d.indexOf("=")).trim()
            let value = d.substring(d.indexOf("=")+1).trim()

            if(value != ""){
                map.set(key, value)
            }
        }else{
            map.set("arg" + i, d)
        }
    }

    return map;
}

async function dummy(){
    let arr= ["a","b","c","section"]

    let listLodash ='';

    // listLodash = _.head(arr)
    // console.log(listLodash)
    // arr= _.drop(arr)
    // console.log(arr)
    // arr.push(listLodash)
    // console.log(arr)
    console.log(path.resolve("./"))

}

dummy()

// getCsv()