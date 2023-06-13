import * as globalConfig from "./config";
import * as reporter from "./reporter"
import * as fs from "fs";
import * as path from "path";

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const Jimp = require("jimp");

export function init(cmdArgs: any, dirPath:string, filePath:string){
   
    console.log("\n" + JSON.stringify(cmdArgs) + "\n")

    globalConfig.test.testname=  filePath.replace(dirPath + "\\", "").split(".")[0]

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

    globalConfig.test.browser= cmdArgs.browser

    if(cmdArgs.docker){
        console.log("DOCKER RUN")
        globalConfig.test.execType= "docker"
        globalConfig.setDriver(cmdArgs.browser, "true")
    }else{
        globalConfig.setDriver(cmdArgs.browser)
    }

    reporter.setLogger()
    
}

export async function videoConverter() {

    if( globalConfig.test.execType!=="docker" ){

        const videoEncoder = "h264"
        try {
    
            let videoDirPath= path.resolve(globalConfig.test.resultfolder+"/videos")
            let imagesDirPath= path.resolve(globalConfig.test.resultfolder+"/screenshots")
    
            if( fs.readdirSync(imagesDirPath).length > 0){
                let videoFilePath= path.resolve(videoDirPath + "/" + globalConfig.test.testname)
    
                fs.mkdirSync(globalConfig.test.resultfolder + "/temp", { recursive: true })
                let tempDirpath= path.resolve(globalConfig.test.resultfolder + "/temp")
        
                let images = fs.readdirSync(imagesDirPath)
        
                for(let i=0; i<images.length;i++){
                    let image= await Jimp.read(imagesDirPath+"\\"+images[i]) ;
                    image.writeAsync(tempDirpath + "\\" + (i+1) + ".png")
                }
        
                console.log("Encoding" );
                await exec(`ffmpeg -start_number 1 -i ${tempDirpath}\\%d.png -vcodec ${videoEncoder} -filter:v "setpts=4.0*PTS" ${videoDirPath}\\tempVideo.mp4`);
        
                if(fs.existsSync(videoDirPath+ "\\tempVideo.mp4")){
                    console.log("Slowing down");
                    await exec(`ffmpeg -i ${videoDirPath}\\tempVideo.mp4 -vf "setpts=10.0*PTS" ${videoFilePath}.mp4`);
                }
                else{
                    await reporter.fail("No Video Created")
                }
        
                fs.rmSync(tempDirpath, { recursive: true, force: true })
                fs.unlinkSync(videoDirPath+ "\\tempVideo.mp4")
            }       
            
        } catch (error) {
            console.log("An error occurred:", error);
        }
    }
    

};

export function getTimeStamp() {
    const runDate = new Date();
    return String(runDate.getFullYear() + "_" + String(Number(runDate.getMonth() + 1)).padStart(2, "0") + "_" + String(runDate.getDate()).padStart(2, "0") + "T" + String(runDate.getHours()).padStart(2, "0") + "_" + String(runDate.getMinutes()).padStart(2, "0") + "_" + String(runDate.getSeconds()).padStart(2, "0") + "_" + String(runDate.getMilliseconds()).padStart(3, "0"));
 }
 

export async function sleep(seconds: number) {
    const waitTill = new Date(new Date().getTime() + Number(seconds * 1000));
    while (waitTill > new Date()) {}
}
 