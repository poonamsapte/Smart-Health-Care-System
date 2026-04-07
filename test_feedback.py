import requests

def test_feedback():
    base_url = "http://localhost:8000"
    
    # 1. Test POST /feedback/
    feedback_data = {
        "name": "Test User",
        "email": "testuser@example.com",
        "message": "This is a great app! I'm testing the feedback form from the landing page. We need it for the Ideathon 2026!."
    }
    print("Testing POST /feedback/")
    try:
        response = requests.post(f"{base_url}/feedback/", json=feedback_data)
        if response.status_code == 201:
            print("Successfully created feedback.")
            print(f"Response: {response.json()}")
        else:
            print(f"Failed to create feedback. Status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}. Is the server running?")

if __name__ == "__main__":
    test_feedback()
