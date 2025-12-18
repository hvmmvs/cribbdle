## View it here

https://cribbdle.com/

## Cribbdle – ultra-light daily cribbage page

This is a tiny Flask app that serves a single-page shell for a daily cribbage puzzle.

### Setup

1. **Create a virtualenv (recommended)**

```bash
cd /Users/smartino/projects/cribbdle
python3 -m venv .venv
source .venv/bin/activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

### Running the dev server

From the project root:

```bash
export FLASK_APP=app:app
export FLASK_ENV=development  # optional, for auto-reload / debug
flask run --host=0.0.0.0 --port=5555
```

Then open `http://127.0.0.1:5555` in your browser.

Alternatively, you can just run:

```bash
python app.py
```

### Next steps

- Wire in real daily game state inside `app.py` and pass it into `index.html`.
- Attach actual game logic and interactions to the existing cribbage UI shell in `templates/index.html`.


# cribbdle
# cribbdle
# cribbdle
