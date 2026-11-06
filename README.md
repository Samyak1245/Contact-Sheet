# Contact Sheet

A small Flask web app for applying OpenCV operations to images in your
browser. Choose grayscale conversion, cropping, rotation, flipping, or
drawing a rectangle, circle, or line, then preview and download the result.

## Run locally

```bash
git clone https://github.com/Samyak1245/Open-CV.git
cd Open-CV/Contact-Sheet
python -m venv venv
```

Activate the virtual environment:

```bash
# macOS / Linux
source venv/bin/activate

# Windows PowerShell
.\venv\Scripts\Activate.ps1
```

Install the dependencies and start the app:

```bash
pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000` in your browser. Upload a JPG, PNG, or BMP
image, choose an operation, set its parameters, and select **Develop**.
The processed JPEG can be previewed and downloaded. Uploads are limited to
10 MiB.

## Run with Docker

From the `Contact-Sheet` directory, build and run the container:

```bash
docker build -t contact-sheet .
docker run --rm -p 5000:5000 contact-sheet
```

Then open `http://127.0.0.1:5000`.

## How it works

- `app.py` — Flask routes. `/` serves the page; `POST /process` accepts an
  image, operation, and parameters, then returns the processed image as a
  JPEG.
- `templates/index.html` — the upload area, operation choices, parameter
  controls, and result panel.
- `static/js/app.js` — handles image previews, operation controls, uploads,
  and result downloads.
- `static/css/style.css` — page styling.

Images are processed in memory and are not saved to disk by the app.
