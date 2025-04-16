import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder, StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras import Input
import numpy as np

# Load dataset
df = pd.read_csv("/kaggle/input/ann-data/repeated_file.csv")

# Separate features and label
X = df.iloc[:, :-1].copy()  # Make a copy to avoid SettingWithCopyWarning
y = df.iloc[:, -1]

# Encode categorical features
label_encoders = {}
for col in X.columns:
    le = LabelEncoder()
    X.loc[:, col] = le.fit_transform(X[col])
    label_encoders[col] = le

# Encode label column
label_encoder_y = LabelEncoder()
y = label_encoder_y.fit_transform(y)
label_encoders['label'] = label_encoder_y
print(X)
print(y)
# Save encoders
joblib.dump(label_encoders, "ann_label_encoders.pkl")

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
joblib.dump(scaler, "ann_scaler.pkl")

# Build ANN model
model = Sequential([
    Input(shape=(X_scaled.shape[1],)),
    Dense(32, activation='relu'),
    Dense(16, activation='relu'),
    Dense(2, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train model
model.fit(X_scaled, y, epochs=40, batch_size=16, verbose=1)

# Save model
model.save("ann_focus_model.h5")
