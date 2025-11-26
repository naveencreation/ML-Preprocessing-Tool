import requests
import json

dataset_id = 34
url = f"http://localhost:8000/preprocessing/{dataset_id}/apply"

# Get dataset info first
try:
    info_response = requests.get(f"http://localhost:8000/datasets/{dataset_id}")
    print(f"Dataset Info: {info_response.json()}")
except Exception as e:
    print(f"Failed to get dataset info: {e}")

# Complex options
payload = {
  "missing_option": "Drop Rows",
  "encoding_method": "None",
  "scaling_method": "None",
  "text_cleaning_method": "Advanced",
  "stopword_removal": True,
  "stemming": True,
  "lemmatization": False,
  "tokenization": True,
  "vectorization_method": "TF-IDF",
  "columns": []
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    with open("debug_apply_output.txt", "w") as f:
        f.write(response.text)
    print("Response logged to debug_apply_output.txt")
except Exception as e:
    print(f"Error: {e}")
