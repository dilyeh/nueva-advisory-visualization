# cleaning up data
import csv
import re
import json

# read csv
path = "/Users/dilyeh/Documents/10th Grade/Semester 2/DataScience/MA1 Misc/clean up data/advisory_responses_5_13.csv"
write_path = "/Users/dilyeh/Documents/10th Grade/Semester 2/DataScience/MA1 Misc/clean up data/clean_data.json"

data = []
with open(path, "r") as csv_file:
    reader = csv.DictReader(csv_file)
    for row in reader: 
        data.append(row)

# map fieldnames to something more useable
og_fieldnames = data[0].keys()
new_fieldnames = ["Timestamp", "Grade", "Advisory", "Value", "Activities", "Frequency", "EarlyRelease", "MinutesEarly", "Skipped", "Other", "Interview"]
clean_key_dict = dict(zip(og_fieldnames, new_fieldnames))
for idx in range(len(data)):
    og_entry = data[idx]
    new_entry = {clean_key_dict.get(k, v): v for k, v in og_entry.items()} # this line was chatgpted
    data[idx] = new_entry


# get rid of timestamp, attendance data, interview
things_to_get_rid_of = ["Timestamp", "Skipped", "Interview", "EarlyRelease", "MinutesEarly", "Other"]
for entry in data:
    for thing in things_to_get_rid_of:
        entry.pop(thing)

# clean up grade
for idx in range(len(data)):
    grade = re.findall("[0-9]", data[idx]["Grade"]) # regex
    grade = ''.join(grade)
    data[idx]["Grade"] = grade
    
# clean up activities
# TODO: this doesn't keep track of custom responses.
activities_list = {
    "One-on-one meetings with advisors": "one on ones",
    "Whole-advisory discussions": "advisory discussions",
    "Announcements (for example, trips meetings, course catalog explanations, etc.)": "announcements",
    "Games (cards, scatagories, semantle, etc.)": "games",
    "Work periods/free time": "work periods",
    "Cross-advisory activities": "cross-advisory activities",
    "Off-campus trips": "off-campus trips",
    "None of the above": "none"
}
form_activities = activities_list.keys()
for idx in range(len(data)):
    raw_activities = data[idx]["Activities"]
    all_activities = []
    for activity in form_activities: 
        if activity in raw_activities:
            all_activities.append(activities_list[activity]) # there's like 5 variables that all have the name "activity" in them
    data[idx]["Activities"] = all_activities # this is why this needs to be a json

fieldnames = data[0].keys()

# write data
#with open (write_path, "w") as csv_file: # csv
    #writer = csv.DictWriter(csv_file, fieldnames)
    #writer.writeheader()
    #for row in data:
        #writer.writerow(row)

with open (write_path, "w") as json_file: # json
    json.dump(data, json_file, indent=4)