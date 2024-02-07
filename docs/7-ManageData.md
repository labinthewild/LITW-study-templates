# Study data workflow

The simplest way to save your study data is to use our library call `LITW.data.submitStudyData(JsonData)`. This function accepts a JavaScript dictionary, and it will inject the session UUID before inserting a new JSON entry into permanent storage. Although this strategy gives a lot of flexibility to your study data structure, this can be a problem when retrieving and using this data.

In this document, we will suggest a data storage and analysis workflow that will get you from saving well-structured data to having a nicely formatted CSV to load into your favorite analysis tool.

##Step 1: Saving data

Since you can submit as many entries per session (i.e., per participant) to the database, we recommend that you make sure the set of dictionary keys DO NOT contain repetitive keys!

Let's say that you want to save data collected in two different slides of your study. For that, you will probably call `submitStudyData` two times like this:

```
var trial_data_1 = {"stimulus_1": trial.stimulus, "answer_1": trial.response};
LITW.data.submitStudyData(trial_data_1);
...
var trial_data_2 = {"stimulus_2": trial.stimulus, "answer_2": trial.response};
LITW.data.submitStudyData({trial_data_2});
```

From this example, you can see we opted to insert the trial number in each dictionary key, instead of using something more generic like `{"trial_number": 1, "stimulus": trial.stimulus, "answer": trial.response}`. Why is that? For analysis purposes, all data from one session will probably be merged under one UUID and having repeated keys will make it harder to differentiate the data.

##Step 2: Retrieving data

If you are either using your own infrastructure or ours, one approach to get your data out of the database is a simple DATA DUMP. If you are using our infrastructure, we will provide you files that looks like this:

```
"59";"{""uuid"": ""ce69563a-8e88-4c06-9b41-2723fe1c89d7"", ""data_type"": ""study:data"", ""stimulus_1"": [""cat1"",""cat2""], ""answer"": ""cat1""}";"2018-08-23 22:31:41"
"60";"{""uuid"": ""ce69563a-8e88-4c06-9b41-2723fe1c89d7"", ""data_type"": ""study:data"", ""stimulus_2"": [""cat3"",""cat4""], ""answer"": ""cat4""}";"2018-08-23 22:31:51"
"61";"{""uuid"": ""85a197eb-eef8-4f8b-b025-a1bf0a982811"", ""data_type"": ""study:data"", ""stimulus_1"": [""cat1"",""cat2""], ""answer"": ""cat1""}";"2018-08-23 23:01:41"
"62";"{""uuid"": ""85a197eb-eef8-4f8b-b025-a1bf0a982811"", ""data_type"": ""study:data"", ""stimulus_2"": [""cat3"",""cat4""], ""answer"": ""cat3""}";"2018-08-23 23:01:51"
```

(You can use the provided `litw-datadump.sh` script inside the `include` folder to get this data dump from your MySQL database -- Bash/Linux only but translatable to your favorite programming language. Make sure to edit the file with the correct database information and call it passing the database password.)

You can see that this data dump has the [ID;JSON;TIMESTAMP] format and that the submitted JSON data gained the UUID and metadata called `data_type` which we internally use to differentiate study data from tracking and other possible meta-data. Because we thought this format is not very convenient to use in data analysis tools, the next section is about converting it to a more suitable format.

##Step 3: Dump to CSV

We figured that a more convenient format for data analysis would be:

```
"uuid","stimulus_1","answer_1","stimulus_2","answer_2"
"ce69563a-8e88-4c06-9b41-2723fe1c89d7","['cat1','cat2']","cat1","['cat3','cat4']","cat4"
"85a197eb-eef8-4f8b-b025-a1bf0a982811","['cat1','cat2']","cat1","['cat3','cat4']","cat3"
```

To create a file with this structure from your data dump, we provide a Python3 script called `litw-dump2csv.py` also available at the `include` folder. Just call:

```
python3 litw-dump2csv.py study_data_dump.csv study_data.csv study:data
```

The first two parameters are the input and output files, and the third one is a comma-separated list of data types you want to add to your CSV file. For instance, a typical call will also include the demographic information, which can be done by typing `study:demographics,study:data`.

This script uses a Python Pandas trick to flatten down JSON to CSV, so you will need to install that library before using the script. The flattening process is well documented [HERE](https://pandas.pydata.org/pandas-docs/stable/generated/pandas.io.json.json_normalize.html), so you might want to check it out if you need to save more complex data structures and use this workflow to keep the data management more straightforward.

We hope this helps! If you find any bug, please let us know at our repository ToDo list.