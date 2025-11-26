from app.schemas import PreprocessingOptions
from pydantic import ValidationError

# Simulate payload from frontend for an image dataset
payload = {
    "missing_option": "Drop Rows",
    "encoding_method": "None",
    "scaling_method": "None"
}

try:
    options = PreprocessingOptions(**payload)
    print("Validation Successful")
    print(options.dict())
except ValidationError as e:
    print("Validation Failed")
    print(e)
except Exception as e:
    print(f"An error occurred: {e}")
