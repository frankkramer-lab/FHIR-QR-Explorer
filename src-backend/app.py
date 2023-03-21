from flask import Flask, render_template, jsonify
import os, json

dpath = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_url_path="/static", static_folder=os.path.join(dpath, "static"))

@app.route('/')
def root():
    return render_template("react.html")

@app.route('/fhir-query.json', methods=["GET"])
def getFhirQuery():
    # FHIR Server Query:
    # https://h96-31.net2.misit-augsburg.de/fhir-server/api/v4/QuestionnaireResponse?_format=json
    # Fetch Ops with enabled credentials: {"headers": {"Accept": "application/fhir+json"}, "credentials": "include"}}

    url = os.environ.get("FHIR_ENDPOINT_PATH", "http://localhost:5000/static/bundle.json")
    fetch = os.environ.get("FHIR_ENDPOINT_FETCH_OPS", '{"headers": {"Accept": "application/fhir+json"}}')
    reload_url = os.environ.get("FHIR_ENDPOINT_RELOAD", None)

    opts = {"url":  url, "fetch": json.loads(fetch)}
    if reload_url is not None:
        opts["reload"] = reload_url
    return jsonify(opts)

if __name__ == '__main__':
    if app.debug:
        # allow Cross-Origin requests for React page
        import sys
        print("Allowing Cross-Origin requests due to DEBUG mode...", file=sys.stderr)

        @app.after_request
        def after_request(response):
            header = response.headers
            header['Access-Control-Allow-Origin'] = '*'
            header['Access-Control-Allow-Methods'] = '*'
            header['Access-Control-Allow-Headers'] = '*'
            return response

    app.run(host="0.0.0.0")

