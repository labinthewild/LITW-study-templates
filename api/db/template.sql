PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE comments (participantId int(10) not null, data text, timestampComments datetime default current_timestamp, ind integer primary key autoincrement);
CREATE TABLE demographics (ind integer primary key autoincrement, participantId int(10) not null, data text, timestampDemographics datetime default current_timestamp);
CREATE TABLE participantInfo (participantId integer primary key autoincrement, ipCity varchar(255), ipCountry varchar(255), contentLanguage varchar(6), timestampParticipantInfo datetime default current_timestamp, userAgent text);
CREATE TABLE studyData (ind integer primary key autoincrement, participantId int(10) not null, data text, timestampData datetime default current_timestamp);
CREATE TABLE tracking (ind integer primary key autoincrement, participantId int(10) not null, dropoutCode tinyint, checkpoint varchar(255), timestampTracking datetime default current_timestamp);
COMMIT;