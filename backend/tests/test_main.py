from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Car Leasing ML API is running"}

def test_predict_price():
    payload = {
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "mileage": 50000,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "engine_size": 2.5
    }
    response = client.post("/predict_price", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_price" in data
    assert data["currency"] == "USD"
    assert isinstance(data["predicted_price"], float)

def test_create_car():
    payload = {
        "make": "Honda",
        "model": "Civic",
        "year": 2022,
        "mileage": 10000,
        "price": 25000,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "engine_size": 2.0,
        "description": "Clean car",
        "is_available": True
    }
    response = client.post("/cars/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["make"] == "Honda"
    assert "id" in data

def test_read_cars():
    response = client.get("/cars/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
