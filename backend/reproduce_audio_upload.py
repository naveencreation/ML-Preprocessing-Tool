import requests
import os

# Create a dummy wav file (just random bytes, not valid audio, but enough to test upload)
with open("test_audio.wav", "wb") as f:
    f.write(os.urandom(1024))

url = "http://localhost:8000/datasets/upload"
files = {'file': open('test_audio.wav', 'rb')}
# Frontend sends dataset_type, let's include it
data = {'dataset_type': 'audio'}

try:
    print(f"Uploading test_audio.wav to {url}...")
    response = requests.post(url, files=files, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
finally:
    files['file'].close()
    if os.path.exists("test_audio.wav"):
        os.remove("test_audio.wav")
