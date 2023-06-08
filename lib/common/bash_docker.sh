docker_cmd=`cat selenium-docker-final.txt`

echo -e "\n======================== Selenium Grid ========================"
echo -e "\nhttp://localhost:4444"
echo -e "\n===============================================================\n"

IFS=$'\n'
ADDR=( ${docker_cmd} )

echo -e "<< entry >>"
docker network create grid
docker run -d -p 4442-4444:4442-4444 --net grid --name selenium-hub selenium/hub:latest
echo -e "<< entry >>"
sleep 3

for cmd in "${ADDR[@]}";
do
IFS=$'|'
read -a ADDRCMD <<< "$cmd"

echo -e "\n Initializing Docker => ${ADDRCMD[0]}"
#Release docker if any running
eval "${ADDRCMD[2]}" 

eval "${ADDRCMD[0]}" #YML up
eval "${ADDRCMD[1]}" # Run Case
echo -e "\n Releasing Docker => ${ADDRCMD[2]}"

eval "${ADDRCMD[2]}" #YML Down
sleep 5

done

echo -e "\n<< exit >>"
docker stop selenium-hub &>/dev/null && docker rm selenium-hub
docker rm $(docker ps --all -q) -f &>/dev/null
docker network rm grid
echo -e "<< exit >>"

exit