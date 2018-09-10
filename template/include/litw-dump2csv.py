import warnings
warnings.filterwarnings("ignore", message="numpy.dtype size changed")

import csv
import json
import pandas
from pandas.io.json import json_normalize
from datetime import datetime
import argparse

def clean_json_data(json_db_entry):
    clean_json = json_db_entry
    clean_json = clean_json.replace('\\\\','\\')    
    return clean_json


def read_litw_data_dump(filename):
    all_data = []
    with open(filename, newline='', encoding="latin-1") as csvfile:
        datareader = csv.reader(csvfile, delimiter=';', quotechar='"')
        for row in datareader:
            try:
                db_id, json_data, timestamp = row
                clean_data = clean_json_data(json_data)
                data = json.loads(clean_data)
                all_data.append(data)
            except json.JSONDecodeError:
                print('INFO: Could not process the JSON bellow:')
                print(clean_data)
                pass
            except ValueError:
                print('INFO: The following line has more fields than it should:')
                print(row)
                pass
                
    return all_data


def litw_data_by_UUID(litw_dump_data, data_types):
    data_by_UUID = {}
    for entry in litw_dump_data:
        try:
            uuid = entry.pop('uuid')
            if uuid not in data_by_UUID:
                data_by_UUID[uuid]={'uuid':uuid}
            
            data_type = entry.pop('data_type', None)
            if data_type in data_types:
                data_by_UUID[uuid].update(entry)
        except:
            print('Could not find the UUID in this entry:')
            print(entry)
    return data_by_UUID


def main():
    parser = argparse.ArgumentParser(description='Converts LITW data dumps containing JSON data to a CSV file formed by attributed per UUID.')
    parser.add_argument('input', help='the LITW data dump CSV file')
    parser.add_argument('output', help='the output file name')
    parser.add_argument('data_type', help='a comma separated list of data type to be written to the output file, e.g. litw:initialize,study:demographics,study:data')
    args = parser.parse_args()
    print(args)

    DATA_TO_GET = args.data_type.split(',')
    INPUT_FILE = args.input
    OUTPUT_FILE = args.output

    data = read_litw_data_dump(INPUT_FILE)
    data_uuid = litw_data_by_UUID(data, DATA_TO_GET)
    json_normalize(list(data_uuid.values())).to_csv(OUTPUT_FILE, index=False, quoting=csv.QUOTE_ALL)


if __name__ == "__main__":
    main()
