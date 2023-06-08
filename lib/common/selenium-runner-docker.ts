import * as fs from "fs";
import { getTimeStamp, sleep } from "./utilsCommon";
import * as os from "os";
import * as path from "path";
const cmd = require("node-cmd");
const YAML= require("js-yaml")

function run_spec() {
  let system = os.type().toLowerCase();
  const sel_runnner = fs.readFileSync(path.resolve(__filename, "../../../selenium-runner.txt"), "utf-8");
  const spec_array = sel_runnner.split("\n");
  const spec_array_with_result_folder: string[] = [];
  const spec_array_with_final_cmd: string[] = [];

  console.log("Below spec files / folders will be run serially in docker.\n");

  for (let i = 0; i < spec_array.length; i++) {
    if (system.startsWith("win")) {
      spec_array[i]= spec_array[i].replaceAll("\\","/")
   }
   console.log(spec_array[i]);

   let supportedBrowsers = ["chrome", "firefox", "safari"];
   if (!supportedBrowsers.includes(spec_array[i].split(" => ")[0].trim())) {
      console.log("\nPlease select serial runs supported browsers : " + supportedBrowsers.toString());
      return;
   }
   let split = "/";
  
   let name_index = spec_array[i].split(" => ")[1].split(split).length;
   let spec_run_data = spec_array[i] + " => " + getTimeStamp() + " => " + spec_array[i].split(" => ")[1].split(split)[name_index - 1].split(".")[0];
   spec_run_data= spec_run_data.replaceAll("\r\n", "").replaceAll("\r", "").replaceAll("\n", "")

   spec_array_with_result_folder.push(spec_run_data);
   sleep(1.3);
}

  // console.log(spec_array_with_result_folder);

  console.log("\nTotal spec files / folders found : " + spec_array_with_result_folder.length);

  for (let i = 0; i < spec_array_with_result_folder.length; i++) {
    if (spec_array_with_result_folder[i].split(" => ").length == 4) {
      let baseCommand = "npx mocha --require 'ts-node/register' --browser chrome --diff true --full-trace true --no-timeouts --reporter mochawesome --reporter-options 'reportDir=results/_docker/TEMP_RESULT_FOLDER_TEMP,reportFilename='selenium-report',reportPageTitle='Mochawesome',embeddedScreenshots=true,charts=true,html=true,json=true,overwrite=true,inlineAssets=true,saveAllAttempts=false,code=false,quiet=false,ignoreVideos=true,showPending=false,autoOpen=false' --spec ";
      baseCommand = baseCommand.replace("--browser chrome", "--docker true --browser " + spec_array_with_result_folder[i].split(" => ")[0]);
      baseCommand = baseCommand + spec_array_with_result_folder[i].split(" => ")[1];
      baseCommand = baseCommand.replace("TEMP_RESULT_FOLDER_TEMP", spec_array_with_result_folder[i].split(" => ")[3] + "/" + spec_array_with_result_folder[i].split(" => ")[2]);
      let final_result_folder = "results/_docker/" + spec_array_with_result_folder[i].split(" => ")[3] + "/" + spec_array_with_result_folder[i].split(" => ")[2];
      if (!fs.existsSync(final_result_folder)) {
        fs.mkdirSync(final_result_folder, { recursive: true });
      }

      let browserName= spec_array_with_result_folder[i].split(" => ")[0].trim().toLowerCase()

      let ymlJson = {
        version : '3',
        services : {
          'selenium-hub': {
            image: 'selenium/hub:latest',
            container_name: 'selenium-hub',
            ports: [ '4442:4442', '4443:4443', '4444:4444' ]
          },
          [browserName] : {
            image: 'selenium/node-'+browserName+':latest',
            shm_size: '2gb',
            depends_on: [ 'selenium-hub' ],
            environment: [
              'SE_EVENT_BUS_HOST=selenium-hub',
              'SE_EVENT_BUS_PUBLISH_PORT=4442',
              'SE_EVENT_BUS_SUBSCRIBE_PORT=4443',
              'SE_VNC_NO_PASSWORD=1',
              'SE_VNC_VIEW_ONLY=1'
            ]
          },
          video: {
            image: 'selenium/video:latest',
            volumes: [ '../'+final_result_folder+'/videos:/videos' ],
            depends_on: [ browserName ],
            environment: [ 'DISPLAY_CONTAINER_NAME='+ browserName, 'FILE_NAME='+spec_array_with_result_folder[i].split(" => ")[3]+'.mp4' ]
          }
        }
      }

      let updateYml= YAML.safeDump(ymlJson)
      // console.log(updateYml)
      
      // .yml file for each testcase/spec such as <testname>_<browsername>.yml will be created under docker_compose directory 
      fs.writeFileSync( path.resolve("./")+"\\docker_compose\\" + spec_array_with_result_folder[i].split(" => ")[3] + "_" + browserName + ".yml" , updateYml )

      spec_array_with_final_cmd.push( 
          "docker-compose -f docker_compose/"+ spec_array_with_result_folder[i].split(" => ")[3] + "_" + browserName +".yml up -d" 
          + "|" + baseCommand + " >> '" + final_result_folder + "/selenium-log.txt'" 
          + "|" + "docker-compose -f docker_compose/"+ spec_array_with_result_folder[i].split(" => ")[3] + "_" + browserName +".yml down");

    } else {
      console.error("\nPlease check selenium-runner.txt for error...");
      return;
    }
  }

  // console.log(spec_array_with_final_cmd);

  for (let i = 0; i < spec_array_with_final_cmd.length; i++) {
    spec_array_with_final_cmd[i] = spec_array_with_final_cmd[i] + "\n";
  }

  // console.log(spec_array_with_final_cmd);

  fs.writeFileSync("./selenium-docker-final.txt", spec_array_with_final_cmd.toString().replaceAll("\r", "").replaceAll("\n,", "\n"));

  console.log("\n==================== Selenium Report Files ====================\n");

  for (let i = 0; i < spec_array_with_result_folder.length; i++) {
    let report_folder_path = path.resolve(__dirname, "../../../results/_docker/" + spec_array_with_result_folder[i].split(" => ")[3] + "/" + spec_array_with_result_folder[i].split(" => ")[2]);
    let result_path = String("Spec " + (i + 1) + " Report => " + report_folder_path + "/selenium-report.html");
    if (system.startsWith("win")) {
      result_path = result_path.replaceAll("/", "\\\\");
    }
    console.log(result_path);
  }

  return;
}

run_spec();
