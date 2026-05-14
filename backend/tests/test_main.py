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
        "brand": "Honda",
        "model": "Civic",
        "year": 2022,
        "engine_volume": 2.0,
        "power": 150,
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "drive": "FWD",
        "seats": 5,
        "body_type": "Sedan",
        "color": "Black",
        "rent_price_day": 50.0,
        "rent_price_month": 1200.0,
        "leasing_price": 400.0,
        "is_available": True
    }
    response = client.post("/cars/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["brand"] == "Honda"
    assert "id" in data

def test_read_cars():
    response = client.get("/cars/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
