#!/bin/bash

for i in `seq 1 2000`
do
    curl -u admin:admin http://localhost:8080/Forms/ -F ":data=@TissueMetrix_Example.csv" -F ":questionnaire=/Questionnaires/TissueMetrix"
    echo "Loaded Form: $i"
done
