import requests

# Use the dataset ID from the user's error (37)
dataset_id = 37
url = f"http://localhost:8000/preprocessing/{dataset_id}/comparison"

try:
    print(f"Sending request to {url}...")
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
