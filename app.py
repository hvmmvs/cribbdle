from flask import Flask

from routes import bp


def create_app() -> Flask:
    # Serve static assets (playing card PNGs) from the local "assets" folder.
    app = Flask(
        __name__,
        static_folder="assets",
        static_url_path="/assets",
    )

    # Register main routes / API.
    app.register_blueprint(bp)

    return app


app = create_app()


if __name__ == "__main__":
    # Development server; in production you would use gunicorn or a similar WSGI server.
    app.run(debug=True, host="0.0.0.0", port=5555)


