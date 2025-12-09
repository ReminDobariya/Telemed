from tensorflow.keras.preprocessing import image
import numpy as np
import tensorflow_hub as hub
from tensorflow.keras.models import load_model
from PIL import Image
import io
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load MobileNetV2 feature extractor
feature_extractor = hub.load("https://tfhub.dev/google/tf2-preview/mobilenet_v2/feature_vector/4")

def extract_features(x):
    return feature_extractor(x)

# Load your trained model
model = load_model("skin_disease_model.h5", custom_objects={"extract_features": extract_features})

# Class labels
class_labels = [
    'cellulitis',
    'impetigo',
    'athlete-foot',
    'nail-fungus',
    'ringworm',
    'cutaneous-larva-migrans',
    'chickenpox',
    'shingles'
]

@app.route("/predict", methods=["POST"])
def predict():
    # Accept either 'image' or 'file' key
    file = request.files.get("image") or request.files.get("file")
    if file is None or file.filename == "":
        return jsonify({"error": "No image uploaded. Use form-data key 'image' or 'file'."}), 400

    try:
        img = Image.open(file.stream).convert("RGB").resize((224, 224))
    except Exception:
        return jsonify({"error": "Invalid image file."}), 400

    # Preprocess image
    img_array = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, axis=0)

    # Make prediction
    prediction = model.predict(img_array)
    predicted_index = int(np.argmax(prediction))
    predicted_class = class_labels[predicted_index]
    confidence = float(np.max(prediction))  # 🔹 get confidence (highest probability)

    # Return both
    return jsonify({
        "predicted_disease": predicted_class,
        "confidence": round(confidence * 100, 2)  # in percentage
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
