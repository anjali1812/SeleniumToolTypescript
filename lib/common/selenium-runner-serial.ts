import * as fs from "fs";
import { getTimeStamp, sleep } from "./utilsCommon";
import * as os from "os";
import * as path from "path";

function run_spec() {
  const sel_runnner = fs.readFileSync(path.resolve(__filename, "../../../selenium-runner.txt"), "utf-8");
  const spec_array = sel_runnner.split("\n");
  const spec_array_with_result_folder: string[] = [];
  const spec_array_with_final_cmd: string[] = [];

  let supportedBrowsers = ["chrome", "firefox", "edge"];
  let unsupported_browser = false;

  console.log("Below spec files / folders will be run serially.\n");

  for (let i = 0; i < spec_array.length; i++) {
      spec_array[i]= spec_array[i].replaceAll("\\","/")
      console.log(spec_array[i]);

      if (!supportedBrowsers.includes(spec_array[i].split(" => ")[0])) {
         spec_array[i] = spec_array[i].replace(spec_array[i].split(" => ")[0], "chrome");
         unsupported_browser = true;
      }
   
      let split = "/";
      let name_index = spec_array[i].split(" => ")[1].split(split).length;
      let spec_run_data: string;

      if (spec_array[i].includes("**")) {
      spec_run_data = spec_array[i] + " => " + getTimeStamp() + " => " + spec_array[i].split(" => ")[1].split(split)[name_index - 3].split(".")[0];
      } else {
      spec_run_data = spec_array[i] + " => " + getTimeStamp() + " => " + spec_array[i].split(" => ")[1].split(split)[name_index - 1].split(".")[0];
      }

      spec_array_with_result_folder.push(spec_run_data);

      sleep(1.3);
  }

  // console.log(spec_array_with_result_folder);

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

  fs.writeFileSync("selenium-final-runner.txt", spec_array_with_final_cmd.toString().replaceAll("\n,", "\n"));

  console.log("\n==================== Selenium Report Files ====================\n");

  for (let i = 0; i < spec_array_with_result_folder.length; i++) {
    let report_folder_path = "../../results/_serial/" + spec_array_with_result_folder[i].split(" => ")[3] + "/" + spec_array_with_result_folder[i].split(" => ")[2];
    let log = path.resolve(__dirname, String(report_folder_path + "/selenium-log.txt"));
    let report = path.resolve(__dirname, String(report_folder_path + "/selenium-report.html"));
    console.log(log);
    console.log(report + "\n");
  }

  console.log("Running specs...");

  return;
}

run_spec();
