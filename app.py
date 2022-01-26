import flask
import os
from flask import request, jsonify, render_template, make_response
from server import model_service as model_service
import json
import cgi
import sys
import cgi, cgitb

app = flask.Flask(__name__, template_folder='./client/templates', static_folder="./client/static");

app.config["DEBUG"] = True


@app.route('/')
def index_def():
    return render_template('index.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/index.html')
def index_html():
    return render_template('index.html')

@app.route('/questionnaire')
def questionnaire():
    return render_template('questionnaire.html')

@app.route('/get-forecasts', methods=['GET'])
def get_forecasts():
    with open('resp.json') as json_file:
        data = json.load(json_file)
        return jsonify(data)

@app.route('/get-arima-forecasts', methods=['GET'])
def get_arima_forecasts():
    with open('resp-arima.json') as json_file:
        data = json.load(json_file)
        return jsonify(data)

@app.route('/world-map', methods=['GET'])
def get_world_map_json():
    with open('world-map.json') as json_file:
        data = json.load(json_file)
        return jsonify(data)

@app.route('/get-covid-data', methods=['GET'])
def get_covid_data():
    df = model_service.load_all_data()
    values = df.values.tolist()
    columns = df.columns.values.tolist()
    data = {"columns": columns, "data": values}
    json_data = jsonify(json.dumps(data))

    # with open('covid-raw.json', 'w+') as outfile:
    #     json.dump(json.dumps(data), outfile)
    
    return json_data;

@app.route('/get-counter-balance', methods=['GET'])
def get_counter_balance():
    with open('counter-balance.json') as json_file:
        data = json.load(json_file)
        return jsonify(data)


@app.route('/save-feedback', methods=['POST'])
def save_feedback():
    cb_user_data = request.form.get('cb_user_data')
    answers = request.form.get('answers')
    email = request.form.get('email')

    with open('counter-balance.json', 'w+') as outfile:
        json.dump(cb_user_data, outfile)

    with open('answers/' + email + '.json', 'w+') as outfile:
        json.dump(answers, outfile)

    return jsonify({'success': True})


app.run()
