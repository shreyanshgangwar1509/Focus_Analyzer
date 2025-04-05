from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from PIL import Image
from io import BytesIO
from model import predict_from_image 
import numpy as np
import cv2
app = Flask(__name__)
CORS(app)  

@app.route('/')
def home():
    return "Shreyansh gangwar"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        image_data = data.get("image")

        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        # Strip the base64 header (e.g., "data:image/jpeg;base64,")
        header, encoded = image_data.split(",", 1)
        img_bytes = base64.b64decode(encoded)

        # Convert to NumPy array
        npimg = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Image decoding failed"}), 500

        # Your prediction logic
        result = predict_from_image(frame)

        return jsonify({"result": result})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
