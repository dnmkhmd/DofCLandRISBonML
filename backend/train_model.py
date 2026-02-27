import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def train_model():
    # Load data
    df = pd.read_csv('car_data.csv')
    
    # Preprocessing
    encoders = {}
    categorical_cols = ['make', 'model', 'fuel_type', 'transmission']
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
        
    X = df.drop('price', axis=1)
    y = df['price']
    
    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    score = model.score(X_test, y_test)
    print(f"Model R^2 Score: {score}")
    
    # Save artifacts
    if not os.path.exists('models'):
        os.makedirs('models')
        
    joblib.dump(model, 'models/price_prediction_model.pkl')
    joblib.dump(encoders, 'models/encoders.pkl')
    
    print("Model and encoders saved to models/")

if __name__ == "__main__":
    train_model()
