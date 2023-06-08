docker_cmd=`cat selenium-docker-final.txt`

echo -e "\n======================== Selenium Grid ========================"
echo -e "\nhttp://localhost:4444"
echo -e "\n===============================================================\n"

IFS=$'\n'
ADDR=( ${docker_cmd} )

for cmd in "${ADDR[@]}";
do
IFS=$'|'
read -a ADDRCMD <<< "$cmd"

echo -e "\n Initializing Docker => ${ADDRCMD[0]}"
#Release docker if any running
eval "${ADDRCMD[2]}" 

eval "${ADDRCMD[0]}"
eval "${ADDRCMD[1]}"
echo -e "\n Releasing Docker => ${ADDRCMD[2]}"

eval "${ADDRCMD[2]}"
sleep 5

done

exit