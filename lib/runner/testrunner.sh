var=("${1}")

# echo $var

if [[ "${var}" == "create" ]]; then
    npx ts-node lib/runner/selenium-test-create.ts
elif [[ "${var}" == "serial" ]]; then
    npx ts-node lib/runner/selenium-runner-serial.ts
    bash lib/runner/bash_serial.sh
elif [[ "${var}" == "parallel" ]]; then
    ts-node lib/runner/selenium-runner-parallel.ts
    bash lib/runner/bash_parallel.sh
elif [[ "${var}" == "docker" ]]; then
    ts-node lib/runner/selenium-runner-docker.ts
    bash lib/runner/bash_docker.sh
elif [[ "${var}" == "help" ]]; then
    echo -e "refer below options for running spec : \n\nnpm test create \n- to generate required spec files ( mention spec details in selenium-spec-create.txt ) \n\nnpm test serial \n- to run the cases serially \n\nnpm test parallel \n- to run the cases parallely \n\nnpm test docker \n- to run the case in docker"
else
    echo -e "refer below options for running spec : \n\nnpm test create \n- to generate required spec files ( mention spec details in selenium-spec-create.txt ) \n\nnpm test serial \n- to run the cases serially \n\nnpm test parallel \n- to run the cases parallely \n\nnpm test docker \n- to run the case in docker"
fi
