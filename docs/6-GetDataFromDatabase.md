# How to retrieve data from the database?

As recovering data from the database is a delicate matter privacy-wise, and cannot be implemented in the JavaScript layer, we have created a simple yet powerful mechanism in PHP. The way we implemented it is:

  1. The developer defines what data to be retrieved from the DB and implements a summary function;
  2. The mechanism retrieves the data and runs the summary function when needed;
  3. This mechanism produces a file called ``summary.json`` that should be used on the ``src/study.js`` file.

To trigger this mechanism, instead of loading the ``index.html`` page, one is required to load the ``index.php`` one.

## Configuration

You should find and configure two variables in the ``include/config.php`` file:

  - LITW_SUMMARY_DEADLINE: How many seconds old should the ``summary.json`` file be to trigger a new summary process?
  - LITW_SUMMARY_JSONKEY: What is the JSON_KEY in the study data that should be looked for when retrieving data from the database?

### Example

In the current template implementation, we configured the summary to retrieve all data that contains the JSON_TAG **country** as stored in the study initialization process. We also configured the process to be triggered every day with the intention to use as little hits to the database as possible.

The mechanism will create a temporary file called ``db_data.json`` with a list of entities like this:

    {"city":"Seattle","uuid":"048da639-4a4e-48ff-a6ba-7fa6c0223a53","country":"United States","data_type":"litw:initialize","contentLanguage":"en"}

## Summary Function

The summary function is a PHP function called ``summary`` inside the ``include/summary_data.php`` file. This function should receive a JSON text as input and return a JSON text as output. By default, the input is the data retrieved from the database (as read from the temporary ``db_data.json`` file), containing all the rows that contain the JSONKEY specified in the previous step.

As you might imagine, this algorithm is study specific as the data to be summarized depends not only on the current study needs but also on the stored data structure (which is defined by the study creator).

### Example

In the current template implementation, we have used the data containing participants location information to count the number and list of cities from all participants to this date. As expected, this produces a ``summary.json`` file that looks like this:

    {"city_number":2,"cities":["Seattle","Chicago"]}

## Using the data

As the ``summary.json`` data is now created and up-to-date in the root of the study directory, this can be easily loaded from the ``src/study.js`` file and used as you may.

### Example

In the current template implementation, loading the data is triggered by calling the function ``readSummaryData``. This function logs the summarized data on the browser console but could easily be used to check if the participant comes from a new city and congratulate them on being the first to help from that specific region. =)