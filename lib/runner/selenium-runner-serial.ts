import * as fs from "fs";
import { getTimeStamp, sleep } from "../common/utilsCommon";
import * as path from "path";

function run_spec() {
  const sel_runnner = fs.readFileSync(path.resolve("selenium-runner.txt"), "utf-8");
  const spec_array = sel_runnner.split("\n");
  let spec_array_with_result_folder: string[] = [];
  const spec_array_with_final_cmd: string[] = [];

  let supportedBrowsers = ["chrome", "firefox", "edge"];
  let unsupported_browser = false;

  console.log("Below spec files / folders will be run serially.\n");

  for (let i = 0; i < spec_array.length; i++) {
    if (spec_array[i].startsWith("##") || !spec_array[i]) {
      continue;
    }

    spec_array[i] = spec_array[i].replaceAll("\\", "/")
    console.log(spec_array[i]);

    if (!supportedBrowsers.includes(spec_array[i].split(" => ")[0])) {
      spec_array[i] = spec_array[i].replace(spec_array[i].split(" => ")[0], "chrome");
      unsupported_browser = true;
    }

    let split = "/";
    let name_index = spec_array[i].split(" => ")[1].split(split).length;
    let spec_run_data: string;

    if (spec_array[i].includes("**")) {
      spec_run_data = (spec_array[i] + " => " + getTimeStamp() + " => " + spec_array[i].split(" => ")[1].split("**")[0]).replaceAll("\r", "")
    } else {
      spec_run_data = (spec_array[i] + " => " + getTimeStamp() + " => " + spec_array[i].split(" => ")[1].split(split)[name_index - 1].split(".")[0]).replaceAll("\r","");
    }

    spec_array_with_result_folder.push(spec_run_data);

    sleep(1.3);
  }

  let allSpec : string[] = []

  for (let i = 0; i < spec_array_with_result_folder.length; i++) {
    let fileFolder = spec_array_with_result_folder[i]

    if(fileFolder.split(" => ")[1].includes("**")){
      let dirs : string[] = []

      getSubDirectories(fileFolder.split(" => ")[3], dirs)

      if( fs.readdirSync(fileFolder.split(" => ")[3]).length>0 ){

        let files = fs.readdirSync(fileFolder.split(" => ")[3])
        for (let j = 0; j < files.length; j++) {
          if(files[j].includes(".ts")){
            let spec_data = spec_array_with_result_folder[i].split(" => ")[0] + " => " 
                            + (fileFolder.split(" => ")[3] + "/" + files[j]).replaceAll("\\","/").replaceAll("//","/") + " => "
                            + spec_array_with_result_folder[i].split(" => ")[2] + " => "
                            + (fileFolder.split(" => ")[3] + path.sep + files[j]).split(".")[0].replaceAll("\\","/").replaceAll("//","/")
            allSpec.push(spec_data)
          }
        }
      }

      for (let j = 0; j < dirs.length; j++) {
        // console.log(dirs[j])
        let files= fs.readdirSync(dirs[j])

        for (let k = 0; k < files.length; k++) {
          if(files[k].includes(".ts")){
            let spec_data = spec_array_with_result_folder[i].split(" => ")[0] + " => " 
                            + (dirs[j] + "/" + files[k]).replaceAll("\\","/") + " => "
                            + spec_array_with_result_folder[i].split(" => ")[2] + " => "
                            + (dirs[j] + path.sep + files[k]).split(".")[0].replaceAll("\\","/")
            allSpec.push(spec_data)
          }
        }
      }
    }
    else{
      allSpec.push(spec_array_with_result_folder[i])
    }
  }

  spec_array_with_result_folder= allSpec
  
  console.log(spec_array_with_result_folder)

  console.log("\nTotal spec files / folders found : " + spec_array_with_result_folder.length);

  if (unsupported_browser) {
    console.log("\nWarning : Please select docker serial runs supported browsers : " + supportedBrowsers.toString() + ", for current run defaulting to chrome...");
  }

  for (let i = 0; i < spec_array_with_result_folder.length; i++) {
    if (spec_array_with_result_folder[i].split(" => ").length == 4) {
      let baseCommand = "npx mocha --require 'ts-node/register' --browser chrome --diff true --full-trace true --no-timeouts --reporter mochawesome --reporter-options 'reportDir=results/_serial/TEMP_RESULT_FOLDER_TEMP,reportFilename='selenium-report',reportPageTitle='Mochawesome',embeddedScreenshots=true,charts=true,html=true,json=false,overwrite=true,inlineAssets=true,saveAllAttempts=false,code=false,quiet=false,ignoreVideos=true,showPending=true,autoOpen=false' --spec ";

      baseCommand = baseCommand.replace("--browser chrome", "--browser " + spec_array_with_result_folder[i].split(" => ")[0]);
      baseCommand = baseCommand + spec_array_with_result_folder[i].split(" => ")[1].replaceAll("\\\\", "/");
      baseCommand = baseCommand.replace("TEMP_RESULT_FOLDER_TEMP", spec_array_with_result_folder[i].split(" => ")[3] + "/" + spec_array_with_result_folder[i].split(" => ")[2]);

      let final_result_folder = "results/_serial/" + spec_array_with_result_folder[i].split(" => ")[3] + "/" + spec_array_with_result_folder[i].split(" => ")[2];
      if (!fs.existsSync(final_result_folder)) {
        fs.mkdirSync(final_result_folder, { recursive: true });
      }

      let final_command_push = String(baseCommand + " > '" + final_result_folder + "/selenium-log.txt'").replaceAll("\r", "");

      spec_array_with_final_cmd.push(final_command_push);
    } else {
      console.error("\nPlease check selenium-runner.txt for error...");
      return;
    }
  }

  // console.log(spec_array_with_final_cmd);

  for (let i = 0; i < spec_array_with_final_cmd.length; i++) {
    if (i == spec_array_with_final_cmd.length - 1) {
      spec_array_with_final_cmd[i] = spec_array_with_final_cmd[i];
    } else {
      spec_array_with_final_cmd[i] = spec_array_with_final_cmd[i] + "\n";
    }
  }

  // console.log(spec_array_with_final_cmd);

  fs.writeFileSync(__dirname.replaceAll("\\", "/") + "/selenium-final-runner.txt", spec_array_with_final_cmd.toString().replaceAll("\n,", "\n"));

  console.log("\n==================== Selenium Report Files ====================\n");

  for (let i = 0; i < spec_array_with_result_folder.length; i++) {
    let report_folder_path = path.resolve("results").replaceAll("\\", "/") + "/_serial/" + spec_array_with_result_folder[i].split(" => ")[3] + "/" + spec_array_with_result_folder[i].split(" => ")[2];
    let log = path.resolve(__dirname, String(report_folder_path + "/selenium-log.txt"));
    let report = path.resolve(__dirname, String(report_folder_path + "/selenium-report.html"));
    console.log(log);
    console.log(report + "\n");
  }

  console.log("Running specs...");

  return;
}

function getSubDirectories(dirPath: string, dirs: string[]) {
    return fs.readdirSync(dirPath, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => { dirs.push(path.join(dirPath, item.name)); getSubDirectories(path.join(dirPath, item.name), dirs) });
}

run_spec();
