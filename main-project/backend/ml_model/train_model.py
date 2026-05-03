import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
import pickle

print("Step 1: Loading data...")
df = pd.read_csv('/Users/dinithiwijesinghe/Desktop/results.csv')
print(f"Total rows loaded: {len(df)}")

print("\nStep 2: Cleaning data...")
df = df[df['bin_id'].str.startswith('BIN')]
df = df.dropna(subset=['fill_level', 'gas_ppm', 'priority_label'])
df['fill_level'] = pd.to_numeric(df['fill_level'], errors='coerce')
df['gas_ppm'] = pd.to_numeric(df['gas_ppm'], errors='coerce')
df['temperature'] = pd.to_numeric(df['temperature'], errors='coerce').fillna(30)
df['humidity'] = pd.to_numeric(df['humidity'], errors='coerce').fillna(75)
df['health_risk'] = df['health_risk'].fillna(0)
df = df.dropna()
print(f"Clean rows: {len(df)}")
print(df['priority_label'].value_counts())

print("\nStep 3: Adding realistic sensor noise...")
np.random.seed(42)
df['gas_ppm'] = df['gas_ppm'] + np.random.normal(0, df['gas_ppm'] * 0.05)
df['fill_level'] = df['fill_level'] + np.random.normal(0, df['fill_level'] * 0.02)
df['gas_ppm'] = df['gas_ppm'].clip(0, 1000)
df['fill_level'] = df['fill_level'].clip(0, 100)
print("Noise added!")

print("\nStep 4: Creating weighted health score...")
df['gas_score'] = (df['gas_ppm'] / 1000) * 100
df['fill_score'] = df['fill_level']
df['weighted_score'] = (df['gas_score'] * 0.70) + (df['fill_score'] * 0.30)
print("Weighted score created!")

print("\nStep 5: Preparing features and labels...")
X = df[['fill_level', 'gas_ppm', 'temperature', 'humidity', 'weighted_score']]
y = df['priority_label']
print(f"Features: {list(X.columns)}")
print(f"Labels: {y.unique()}")

print("\nStep 6: Splitting 80/20...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)
print(f"Training rows: {len(X_train)}")
print(f"Testing rows: {len(X_test)}")

print("\nStep 7: Training Decision Tree...")
dt_model = DecisionTreeClassifier(
    max_depth=10,
    min_samples_split=5,
    random_state=42
)
dt_model.fit(X_train, y_train)
dt_pred = dt_model.predict(X_test)
dt_accuracy = accuracy_score(y_test, dt_pred)
print(f"Decision Tree Accuracy: {dt_accuracy * 100:.2f}%")

print("\nStep 8: Training Random Forest...")
rf_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    random_state=42
)
rf_model.fit(X_train, y_train)
rf_pred = rf_model.predict(X_test)
rf_accuracy = accuracy_score(y_test, rf_pred)
print(f"Random Forest Accuracy: {rf_accuracy * 100:.2f}%")

print("\n========== RESULTS ==========")
print(f"Decision Tree:  {dt_accuracy * 100:.2f}%")
print(f"Random Forest:  {rf_accuracy * 100:.2f}%")

if rf_accuracy >= dt_accuracy:
    print("WINNER: Random Forest!")
    best_model = rf_model
    best_name = "Random Forest"
else:
    print("WINNER: Decision Tree!")
    best_model = dt_model
    best_name = "Decision Tree"

print(f"\nDetailed Report for {best_name}:")
best_pred = rf_pred if best_name == "Random Forest" else dt_pred
print(classification_report(y_test, best_pred))

print("\nRunning 5-fold cross validation...")
cv_scores = cross_val_score(best_model, X, y, cv=5)
print(f"CV Scores: {cv_scores}")
print(f"Average CV Accuracy: {cv_scores.mean() * 100:.2f}%")

print(f"\nSaving {best_name} as model.pkl...")
with open('/Users/dinithiwijesinghe/Desktop/model.pkl', 'wb') as f:
    pickle.dump(best_model, f)

print("model.pkl saved to Desktop!")
print("Done!")
