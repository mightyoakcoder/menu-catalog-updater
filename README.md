# Menu Catalog Updater

...is a project created to update a catalog in Braze with menu data from the company's API

- It is updated daily using GitLab's CI/CD pipeline
- It utilizes the Braze API to upload menu data, sending the data in batches of 50 to  comply with Braze rate limiting.

***Note:** No actual, identifiable data has been included in this repository*