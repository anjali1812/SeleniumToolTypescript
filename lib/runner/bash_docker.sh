docker_cmd_tmp=`cat lib/runner/selenium-final-runner.txt`

IFS=$'\n' read -a lines_tmp <<< "$docker_cmd_tmp"

sel_type="${lines_tmp[0]}"

echo $sel_type

tail -n +2 "lib/runner/selenium-final-runner.txt" > "lib/runner/selenium-final-runner.txt.tmp" && mv "lib/runner/selenium-final-runner.txt.tmp" "lib/runner/selenium-final-runner.txt"

echo -e "\n======================== Selenium Grid ========================"
echo -e "\nhttp://localhost:4444"
echo -e "\n===============================================================\n"

docker_cmd=`cat lib/runner/selenium-final-runner.txt`

IFS=$'\n' lines=( ${docker_cmd} )

echo -e "<< entry >>"
docker network create grid
docker run -d -p 4442-4444:4442-4444 --net grid --name "${sel_type}"-hub "${sel_type}"/hub:latest
echo -e "<< entry >>"
sleep 5

exeCmd=""

for cmd in "${lines[@]}";
do

IFS=$'`'
read -a lines_split <<< "$cmd"

echo -e "\ndocker running spec => ${lines_split[0]}\n"

width=1920
height=1080
frame=30

docker run --env SE_EVENT_BUS_HOST="${sel_type}"-hub --env SE_EVENT_BUS_PUBLISH_PORT=4442 --env SE_EVENT_BUS_SUBSCRIBE_PORT=4443 --env SE_SCREEN_WIDTH=$width --env SE_SCREEN_HEIGHT=$height --env SE_VNC_NO_PASSWORD=1 --env SE_VNC_VIEW_ONLY=1 -v C:/AnjaliParmar/SeleniumToolTypescript/results:/home/seluser/Downloads --net grid -d --name "${lines_split[4]}" --shm-size='2g' "${lines_split[1]}" 

if [ "${sel_type}" == "selenium" ]; then
  docker run --env SE_EVENT_BUS_HOST="${sel_type}"-hub --env SE_EVENT_BUS_PUBLISH_PORT=4442 --env SE_EVENT_BUS_SUBSCRIBE_PORT=4443 --env SE_SCREEN_WIDTH=$width --env SE_SCREEN_HEIGHT=$height --env SE_FRAME_RATE=$frame --env FILE_NAME="${lines_split[0]}".mp4 -d --net grid --name video"${lines_split[4]}" -v "${lines_split[2]}":/videos selenium/video:latest
fi

exeCmd+="${lines_split[3]} & " 
done

finalCmd="${exeCmd:0:"${#exeCmd}"-3}"

echo "${finalCmd}"
eval "${finalCmd}"

exit
for cmd in "${lines[@]}";
do

IFS=$'`'
read -a lines_split <<< "$cmd"

echo -e "\ndocker existing spec => ${lines_split[0]}\n"

if [ "${sel_type}" == "selenium" ]; then
  docker stop video"${lines_split[5]}" &>/dev/null && docker rm video"${lines_split[5]}"
fi

docker stop "${sel_type}""${lines_split[4]}" &>/dev/null && docker rm "${sel_type}""${lines_split[4]}"

done

sleep 3
echo -e "\n<< exit >>"
docker stop "${sel_type}"-hub &>/dev/null && docker rm "${sel_type}"-hub
docker rm $(docker ps --all -q) -f &>/dev/null
docker network rm grid
echo -e "<< exit >>"

rm -f lib\\runner\\selenium-final-runner.txt

exit