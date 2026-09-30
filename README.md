# Contact Sheet - an OpenCV darkroom

A small Flask web app that puts a browser front end on five basic OpenCV
operations: grayscale conversion, cropping, rotation, flipping, and
drawing shapes. Built as a web version of a menu-driven OpenCV script.

## Run it locally

```bash
git clone <your-repo-url>
cd opencv-image-lab
python -m venv venv
source venv/bin/activate      # venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000` in a browser.

## How it works

- `app.py` — Flask routes. `/` serves the page, `/process` accepts an
  uploaded image plus the chosen operation and its parameters, runs the
  matching OpenCV function, and streams the result back as a JPEG.
- `templates/index.html` — the page: an upload area, a strip of five
  operation choices, a settings panel whose fields change per operation,
  and a result panel.
- `static/js/app.js` — loads the chosen file, shows/hides the right
  parameter fields, and submits everything to `/process` with `fetch`.
- `static/css/style.css` — the visual theme.

No image is ever saved to disk on the server; everything is processed
in memory and returned straight to the browser.
