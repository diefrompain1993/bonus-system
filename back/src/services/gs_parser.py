# import gspread  # можно оставить, если понадобится в будущем
import pandas as pd
# from oauth2client.service_account import ServiceAccountCredentials

# CREDENTIALS_FILE = 'test-project-smk-warehouse-4497a6694a02.json'
# SCOPE = [
#     "https://spreadsheets.google.com/feeds",
#     "https://www.googleapis.com/auth/drive",
# ]
# CREDENTIALS = ServiceAccountCredentials.from_json_keyfile_name(
#     CREDENTIALS_FILE, SCOPE
# )
# LOGGING = gspread.authorize(CREDENTIALS)
# SPREADSHEET = LOGGING.open_by_url(
#     'https://docs.google.com/spreadsheets/d/1_7slwZyYSreee2wq7JTAMmwXAeeVX6Jqcdp-7jKUbmg/edit?pli=1&gid=556824075' # noqa
# )
# WORKSHEET = SPREADSHEET.worksheet('склад')

START_GS_ID = 5

def get_sheet_data():
    return {}

def update_sheet_data(new_data, user_info):
    pass
