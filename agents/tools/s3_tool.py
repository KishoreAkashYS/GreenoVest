from crewai.tools import tool
import boto3
import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()
access_key = os.getenv("AWS_ACCESS_KEY_ID")
secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
s3_client = boto3.client('s3', aws_access_key_id= access_key, aws_secret_access_key=secret_key)
bucket_name = "esg-icon-v1"
conn = sqlite3.connect("static/db/ESG_DATA.db", check_same_thread=False)

class S3Tool:
    @tool("S3 File read tool")
    def obj_file_read(report_name: str, company: str) -> str:
        """Retrieves content from s3
        Params:
        - report_name: Should give name of the report [ESG or SEC or CARBON].
        - company: Should give name of the company
        """
        key = f"{report_name}/{company}_{report_name}.md"
        print(f"Fetching file from S3 bucket: {bucket_name}, key: {key}")
        response = s3_client.get_object(Bucket=bucket_name, Key=key)
        content = response['Body'].read().decode('utf-8')  # Decode to string
        return content
    
    @tool("DB read tool")
    def db_read(sector:str) -> list:
        """Fetches scores from DB
        Params:
        - ticker: Ticker of the company
        """
        try:
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM COMPANY WHERE SECTOR=?", (sector,))
            rows = cursor.fetchall()
            conn.close() 
            return rows
        except:
            return None