from app.schemas import PreprocessingOptions
from pydantic import ValidationError

# Simulate payload where missing_option might be invalid
# or where other fields are sent
payload = {
    "missing_option": "Drop Rows",
    "encoding_method": "None",
    "scaling_method": "None",
    # Simulate fields that might be sent if the frontend logic was different
    "outlier_method": "Z-Score", 
    "remove_high_correlation": True,
    "train_test_split": True,
    "test_size": 0.2
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
