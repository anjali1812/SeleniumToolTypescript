docker_cmd_tmp=`cat selenium-final-runner.txt`

IFS=$'\n' read -a lines_tmp <<< "$docker_cmd_tmp"

sel_type="${lines_tmp[0]}"

echo $sel_type

tail -n +2 "selenium-final-runner.txt" > "selenium-final-runner.txt.tmp" && mv "selenium-final-runner.txt.tmp" "selenium-final-runner.txt"

echo -e "\n======================== Selenium Grid ========================"
echo -e "\nhttp://localhost:4444"
echo -e "\n===============================================================\n"

docker_cmd=`cat selenium-final-runner.txt`

IFS=$'\n' lines=( ${docker_cmd} )

echo -e "<< entry >>"
docker network create grid
docker run -d -p 4442-4444:4442-4444 --net grid --name "${sel_type}"-hub "${sel_type}"/hub:latest
echo -e "<< entry >>"
sleep 5

for cmd in "${lines[@]}";
do

IFS=$'`'
read -a lines_split <<< "$cmd"

echo -e "\ndocker running spec => ${lines_split[0]}\n"

width=1920
height=1080
frame=30

docker run --env SE_EVENT_BUS_HOST="${sel_type}"-hub --env SE_EVENT_BUS_PUBLISH_PORT=4442 --env SE_EVENT_BUS_SUBSCRIBE_PORT=4443 --env SE_SCREEN_WIDTH=$width --env SE_SCREEN_HEIGHT=$height --env SE_VNC_NO_PASSWORD=1 --env SE_VNC_VIEW_ONLY=1 --net grid -d --name "${sel_type}" --shm-size='2g' "${lines_split[1]}"

if [ "${sel_type}" == "selenium" ]; then
  docker run --env SE_EVENT_BUS_HOST="${sel_type}"-hub --env SE_EVENT_BUS_PUBLISH_PORT=4442 --env SE_EVENT_BUS_SUBSCRIBE_PORT=4443 --env SE_SCREEN_WIDTH=$width --env SE_SCREEN_HEIGHT=$height --env SE_FRAME_RATE=$frame --env FILE_NAME="${lines_split[0]}".mp4 -d --net grid --name video -v "${lines_split[2]}":/videos selenium/video:latest
fi

eval "${lines_split[3]}"

if [ "${sel_type}" == "selenium" ]; then
  docker stop video &>/dev/null && docker rm video
fi

docker stop "${sel_type}" &>/dev/null && docker rm "${sel_type}"

done

sleep 3
echo -e "\n<< exit >>"
docker stop "${sel_type}"-hub &>/dev/null && docker rm "${sel_type}"-hub
docker rm $(docker ps --all -q) -f &>/dev/null
docker network rm grid
echo -e "<< exit >>"

exit