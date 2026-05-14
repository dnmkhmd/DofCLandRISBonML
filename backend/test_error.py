from fastapi.testclient import TestClient
from main import app
import traceback

client = TestClient(app)

try:
    response = client.post("/auth/login", data={"username": "admin", "password": "admin"})
    print("STATUS", response.status_code)
    print("CONTENT", response.content)
except Exception as e:
    traceback.print_exc()
