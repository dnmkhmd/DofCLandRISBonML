import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, KFold
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import json

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
        
    X_full = df.drop(['rent_price_day', 'leasing_price'], axis=1)
    # Ensure column order is consistent
    feature_cols = ['make', 'model', 'year', 'mileage', 'fuel_type', 'transmission', 'engine_size']
    X = X_full[feature_cols].values
    
    models_to_train = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, random_state=42)
    }

    results = {
        "rental": [],
        "leasing": []
    }

    if not os.path.exists('models'):
        os.makedirs('models')

    for target_name, target_col in [("rental", "rent_price_day"), ("leasing", "leasing_price")]:
        y = df[target_col].values
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        for model_name, model in models_to_train.items():
            # Standard training
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            y_pred_train = model.predict(X_train)
            
            r2_tr = round(float(r2_score(y_train, y_pred_train)), 3)
            r2_te = round(float(r2_score(y_test, y_pred)), 3)
            mae = round(float(mean_absolute_error(y_test, y_pred)), 2)
            rmse = round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 2)
            mape_raw = mean_absolute_percentage_error(y_test, y_pred)
            mape = round(float(mape_raw), 4)
            
            # Cross-validation (5 folds)
            kf = KFold(n_splits=5, shuffle=True, random_state=42)
            cv_scores = []
            for tr_idx, te_idx in kf.split(X):
                X_kf_train, X_kf_test = X[tr_idx], X[te_idx]
                y_kf_train, y_kf_test = y[tr_idx], y[te_idx]
                
                model_kf = model.__class__(**model.get_params()) # New instance
                model_kf.fit(X_kf_train, y_kf_train)
                cv_pred = model_kf.predict(X_kf_test)
                cv_scores.append(round(float(r2_score(y_kf_test, cv_pred)), 3))
            
            # Save scatter data (max 100 points for performance)
            indices = np.random.choice(len(y_test), 
                        min(100, len(y_test)), replace=False)
            
            scatter_points = [
                {
                    "actual": round(float(y_test[i]), 2),
                    "predicted": round(float(y_pred[i]), 2)
                }
                for i in indices
            ]

            results[target_name].append({
                "model": model_name,
                "r2_train": r2_tr,
                "r2_test": r2_te,
                "r2_mean": round(float(np.mean(cv_scores)), 3),
                "r2_std": round(float(np.std(cv_scores)), 3),
                "mae": mae,
                "rmse": rmse,
                "mape": mape,
                "mape_str": f"{mape:.4f}",
                "cv_scores": cv_scores,
                "scatter": scatter_points,
                "color": {
                    "Linear Regression": "#2563EB",
                    "Random Forest": "#7C3AED",
                    "Gradient Boosting": "#16A34A"
                }[model_name]
            })
            
            # Save models
            model_file = f"models/model_{target_name}_{model_name.replace(' ', '_').lower()}.pkl"
            joblib.dump(model, model_file)
            
            # Save the primary Gradient Boosting models for production use
            if model_name == "Gradient Boosting":
                if target_name == "rental":
                    joblib.dump(model, 'models/price_prediction_model.pkl')
                elif target_name == "leasing":
                    joblib.dump(model, 'models/price_prediction_model_leasing.pkl')

    # Save all results
    with open('model_metrics.json', 'w') as f:
        # Add metadata for the dashboard
        final_output = {
            "metadata": {
                "train_samples": len(X_train),
                "test_samples": len(X_test),
                "total_models": len(models_to_train)
            },
            "results": results
        }
        json.dump(final_output, f, indent=4)
        
    # Save encoders
    joblib.dump(encoders, 'models/encoders.pkl')

    print("Training complete!")
    for target in ["rental", "leasing"]:
        print(f"\n{target.upper()} MODELS:")
        for r in results[target]:
            print(f"  {r['model']}: R2 Test={r['r2_test']}, MAE={r['mae']}, MAPE={r['mape']:.4f}")

if __name__ == "__main__":
    train_model()
