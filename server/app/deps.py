import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "photoverify")

# This check ensures you've set up your .env file correctly.
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is not set. Please update your .env file with your MongoDB Atlas connection string.")

print("[DB] Connecting to MongoDB Atlas...")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
print("[DB] Connection successful.")

def get_db():
    return db

import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "photoverify")

if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is not set. Please update your .env file with your MongoDB Atlas connection string.")

print("[DB] Connecting to MongoDB Atlas...")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    db = client[DB_NAME]
    print("[DB] Connection successful.")

except ConnectionFailure:
    print("\n" + "="*80)
    print("[DB] ERROR: Could not connect to MongoDB Atlas.")
    print("Please check the following:")
    print("  1. Your MONGO_URI in the .env file is correct.")
    print("  2. You have allowed access from ANYWHERE (0.0.0.0/0) in Atlas Network Access settings.")
    print("  3. Your internet connection or a firewall is not blocking the connection.")
    print("="*80 + "\n")
    raise

def get_db():
    return db

