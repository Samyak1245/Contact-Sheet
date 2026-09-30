import io
import cv2
import numpy as np
from flask import Flask, render_template, request, send_file, jsonify

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


def read_image_from_request(file_storage):
    data = np.frombuffer(file_storage.read(), np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    return img


def encode_image(img):
    success, buffer = cv2.imencode(".jpg", img)
    if not success:
        raise ValueError("Could not encode processed image")
    return io.BytesIO(buffer.tobytes())


def apply_grayscale(img, form):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)


def apply_crop(img, form):
    h, w = img.shape[:2]
    x = int(form.get("x", 0))
    y = int(form.get("y", 0))
    width = int(form.get("width", 0))
    height = int(form.get("height", 0))

    if x < 0 or y < 0 or width <= 0 or height <= 0:
        raise ValueError("Invalid crop dimensions")

    x = min(max(0, x), w - 1)
    y = min(max(0, y), h - 1)
    width = min(width, w - x)
    height = min(height, h - y)

    cropped = img[y:y + height, x:x + width]
    if cropped.size == 0:
        raise ValueError("Crop region is outside image boundaries")
    return cropped


def apply_rotation(img, form):
    angle = float(form.get("angle", 0))
    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(img, M, (w, h))


def apply_flip(img, form):
    flip_code = int(form.get("flip_code", 1))
    return cv2.flip(img, flip_code)


def apply_shape(img, form):
    out = img.copy()
    shape = form.get("shape", "").lower()
    color_raw = form.get("color", "255 0 0")
    color = tuple(int(c) for c in color_raw.split())
    thickness = int(form.get("thickness", 2))

    if shape == "rectangle":
        x1 = int(form.get("x1", 0))
        y1 = int(form.get("y1", 0))
        x2 = int(form.get("x2", 0))
        y2 = int(form.get("y2", 0))
        cv2.rectangle(out, (x1, y1), (x2, y2), color, thickness)

    elif shape == "circle":
        cx = int(form.get("center_x", 0))
        cy = int(form.get("center_y", 0))
        radius = int(form.get("radius", 0))
        cv2.circle(out, (cx, cy), radius, color, thickness)

    elif shape == "line":
        x1 = int(form.get("x1", 0))
        y1 = int(form.get("y1", 0))
        x2 = int(form.get("x2", 0))
        y2 = int(form.get("y2", 0))
        cv2.line(out, (x1, y1), (x2, y2), color, thickness)

    else:
        raise ValueError("Invalid shape choice")

    return out


OPERATIONS = {
    "grayscale": apply_grayscale,
    "crop": apply_crop,
    "rotate": apply_rotation,
    "flip": apply_flip,
    "shape": apply_shape,
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/process", methods=["POST"])
def process():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file_storage = request.files["image"]
    operation = request.form.get("operation")

    if operation not in OPERATIONS:
        return jsonify({"error": "Unknown operation"}), 400

    img = read_image_from_request(file_storage)
    if img is None:
        return jsonify({"error": "Could not read image."}), 400

    try:
        result = OPERATIONS[operation](img, request.form)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception:
        return jsonify({"error": "Something went wrong."}), 400

    buffer = encode_image(result)
    return send_file(buffer, mimetype="image/jpeg", download_name=f"{operation}_result.jpg")


if __name__ == "__main__":
    app.run(debug=True) 