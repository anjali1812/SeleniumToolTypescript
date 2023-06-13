serial_cmd=`cat selenium-final-runner.txt`

IFS=$'\n'
ADDR=( ${serial_cmd} )

for cmd in "${ADDR[@]}";
do

eval $cmd

done

exit