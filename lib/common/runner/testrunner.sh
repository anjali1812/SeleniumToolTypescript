var=("${1}")

# echo $var

if [[ "${var}" == "serial" ]]; then
    npx ts-node lib/common/runner/selenium-runner-serial.ts
    bash lib/common/runner/bash_serial.sh
elif [[ "${var}" == "parallel" ]]; then
    ts-node lib/common/runner/selenium-runner-parallel.ts
    bash lib/common/runner/bash_parallel.sh
elif [[ "${var}" == "docker" ]]; then
    ts-node lib/common/runner/selenium-runner-docker.ts
    bash lib/common/runner/bash_docker.sh
elif [[ "${var}" == "help" ]]; then
    cat lib/common/runner/help.txt
fi
