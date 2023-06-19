serial_cmd=`cat lib/runner/selenium-final-runner.txt`

IFS=$'\n'
ADDR=( ${serial_cmd} )

if [ "${#ADDR[@]}" == "0" ]; then
  clear
  echo -e "\nNo spec found, please check selenium-runner.txt !!!"
  exit
fi

for cmd in "${ADDR[@]}";
do

eval $cmd

done

rm -f lib\\runner\\selenium-final-runner.txt

exit