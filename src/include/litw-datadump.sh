#!/bin/bash
#Use: ./litw-datadump.sh my_db_password

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER="localhost"
USER="ninja_user"
DB="the_most_important_db"
FILE="study_data_dump"

mysql -h$SERVER -u$USER -p$1 $DB -B -e "select * from study_data;" | sed 's/"/""/g;s/\t/";"/g;s/^/"/;s/$/"/;s/\n//g' > "${DIR}/${FILE}.csv"
tar -czf "${DIR}/${FILE}.csv.tgz" -C $DIR "${FILE}.csv"