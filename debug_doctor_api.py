import requests

# Login as doctor
BASE_URL = "http://localhost:8000"

# Use the doctor credentials we created earlier or try to register one if needed
email = "doctor1@example.com"
password = "password123"

print(f"Logging in as {email}...")
response = requests.post(f"{BASE_URL}/auth/token", data={"username": email, "password": password})

if response.status_code != 200:
    print(f"Login failed: {response.text}")
    # Try creating it if it doesn't exist (though we assume it does from previous steps)
    exit()

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("\nFetching /doctors/me...")
response = requests.get(f"{BASE_URL}/doctors/me", headers=headers)

if response.status_code == 200:
    data = response.json()
    print("Response JSON:")
    import json
    print(json.dumps(data, indent=2))
    
    if "user" in data and data["user"]:
        print("\n✅ 'user' field is present.")
    else:
        print("\n❌ 'user' field is MISSING or NULL.")
else:
    print(f"Error: {response.status_code} - {response.text}")
