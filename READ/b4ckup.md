mysqldump -u root -p finalui3 > C:\xampp\htdocs\finaluimaster\backups\finalui3_%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%_%TIME:~0,2%-%TIME:~3,2%-%TIME:~6,2%.sql

-- EVERY 15 DAYS PLS

RUN IN WINDOWS POWERSHELL


$timestamp = Get-Date -Format yyyy-MM-dd_HH-mm-ss
mysqldump -u root finalui3 > "C:\xampp\htdocs\finaluimaster\backups\finalui3_$timestamp.sql"

