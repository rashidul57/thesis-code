import flask
import os
from flask import request, jsonify, render_template
from server import new_model_service as model_service
import json

app = flask.Flask(__name__, template_folder='./client/templates', static_folder="./client/static");

app.config["DEBUG"] = True


@app.route('/')
def index():
    return render_template('index.html')



@app.route('/get-forcasts', methods=['GET'])
def get_forcasts():
    with open('resp.json') as json_file:
        data = json.load(json_file)
        return jsonify(data)

@app.route('/get-covid-data', methods=['GET'])
def get_covid_data():
    df = model_service.load_all_data()
    values = df.values.tolist()
    data = {"columns": df.columns.values.tolist(), "data": values}
    return jsonify(json.dumps(data))

app.run()
