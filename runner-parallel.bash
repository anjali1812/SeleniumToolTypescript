NC='\033[0m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'

value=`cat selenium-runner.txt`

IFS=$'\n'
ADDR=( ${value} )

baseCommand="npx cypress run --headed --browser electron --spec "
runnerCommand=""

current=0
length=${#ADDR[@]}

clear
echo -e "${GREEN}Below spec files / folders will be run parallelly.\n${NC}"

for spec in "${ADDR[@]}";
do
current=$((current + 1))
echo $spec
if [[ "$current" -eq "$length" ]]
then
   runnerCommand=$runnerCommand$baseCommand$spec
else
   runnerCommand="$runnerCommand$baseCommand$spec & sleep 1 && "
fi
done

echo -e "\n${GREEN}Total spec files / folders found : $current${NC}"

echo -e "${YELLOW}\nAvailable browses on running system.\n${NC}"
eval "npx browser-list"

echo -e "${YELLOW}\nEnter browser name you want to run your specs ? ( default is electron, which comes with cypress )${NC}"
echo -e "${RED}\nNOTE : If you are using MacOS, Safari is not supported yet !\n${NC}"
read browser

if [[ -z "$browser" ]]
then
   final=$runnerCommand
   echo -e "${GREEN}Running in electron.\n${NC}"
else
   final="${runnerCommand//electron/$browser}"
   echo -e "\n${GREEN}Running in $browser.\n${NC}"
fi

eval $final
clear
exit