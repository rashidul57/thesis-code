from statsmodels.tsa.arima.model import ARIMA
from random import random
from numpy import array
from keras.models import Sequential
from keras.layers import Dense
from keras.models import model_from_yaml
from keras.models import load_model
import numpy as np

from keras.layers import Dense
from keras.layers import Flatten
from keras.layers.convolutional import Conv1D
from keras.layers.convolutional import MaxPooling1D
import datetime

from sklearn.preprocessing import MinMaxScaler

import pandas
import pandas as pd
import os
import logging
import json
from json import JSONEncoder

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
logging.getLogger('tensorflow').setLevel(logging.FATAL)

class NumpyArrayEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return JSONEncoder.default(self, obj)

def arima_model():
    # contrived dataset
    data = [x + random() for x in range(1, 100)]

    # fit model
    model = ARIMA(data, order=(1, 1, 1))
    model_fit = model.fit()
    # make prediction
    yhat = model_fit.predict(len(data), len(data), typ='levels')
    print(yhat)


def load_all_data(prop):
    df = pandas.read_csv('server/data/owid.csv', 
        # parse_dates=['date'], 
        header=0
    )
    prop_df = df[['location', 'date', prop]]
    return prop_df

def get_grouped_data(df):
    group_df = df.groupby(by=["date"]).sum().reset_index()

    # group_df['date'] = (group_df.date.values.astype(np.int64) // 10 ** 9)/1000000
    dates = group_df.date.values
    for i in range(len(dates)):
        date = datetime.datetime.strptime(str(dates[i]), "%Y-%m-%d")
        timestamp = datetime.datetime.timestamp(date)
        dates[i] = timestamp

    group_df['date'] = np.asarray(dates).astype('float32')

    # print('all....................')
    # for i in range(len(group_df['date'])):
    #     print('>', group_df['date'][i], group_df['total_cases'][i])

    return group_df

def get_data(mode, group_df):
    total_size = group_df.shape[0]
    perc = 15
    test_size = int(total_size * perc/100)
    train_size = total_size - test_size

    if mode == 'train':
        ret_df = group_df.iloc[0:train_size, :]
    else:
        ret_df = group_df.iloc[train_size: -1, :]
    
    return ret_df


def mlp_model_forecast(train_data, test_data):
    X = train_data['date'].values
    y = train_data['total_cases'].values

    # build and train model
    model = Sequential()
    model.add(Dense(100, activation='relu', input_dim=1))
    # model.add(Dense(10, activation='relu', input_dim=1))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')
    # fit model
    model.fit(X, y, epochs=100, verbose=0)

    # predict with test set
    x_input = test_data['date'].values

    # print('-Testing-')

    y = test_data['total_cases'].values
    y_pred = model.predict(x_input, verbose=0)

    # print('\nActual<>Predicted:', len(y_pred))
    # yhat1 = y_pred[-5:-1]
    # for i in range(len(y_pred)):
    #     print(x_input[i], ': ', y[i], '<>', y_pred[i][0])

    # return predicted results
    return y, y_pred


def cnn_model_forecast(train_data, test_data):
    dates = train_data['date'].values
    y = train_data['total_cases'].values

    n_features = 1
    n_steps = 3

    X = []
    for i in range(len(dates)):
        row = np.array([np.array([dates[i]]), np.array([1]), np.array([1])])
        X.append(row)
    X = np.array(X)

    # build and train model 
    model = Sequential()
    model.add(Conv1D(filters=64, kernel_size=2, activation='relu', input_shape=(n_steps, n_features)))
    model.add(MaxPooling1D(pool_size=2))
    model.add(Flatten())
    model.add(Dense(50, activation='relu'))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')
    # fit model
    model.fit(X, y, epochs=100, verbose=0)

    # predict with test set
    dates = test_data['date'].values
    X = []
    for i in range(len(dates)):
        row = np.array([np.array([dates[i]]), np.array([1]), np.array([1])])
        X.append(row)
    x_input = np.array(X)

    y = test_data['total_cases'].values
    y_pred = model.predict(x_input, verbose=0)

    # return predicted results
    return y, y_pred


all_data_df = load_all_data('total_cases')
loc_df = all_data_df.groupby(by=["location"]).sum().reset_index()

regions = ['World', 'Asia', 'European Union', 'Europe', 'South America', 'North America']
# filtered_df = all_data_df[all_data_df.location.isin(regions) == False]
loc_df = loc_df[~loc_df.location.isin(regions)]

loc_df = loc_df.sort_values(by=['total_cases'], ascending=False)
resp = {}
for i in range(10):
    location = loc_df.location.values[i]
    filtered_df = all_data_df[all_data_df.location == location]

    group_df = get_grouped_data(filtered_df)

    train_data = get_data('train', group_df)
    test_data = get_data('test', group_df)

    print(location)

    start_timestamp = test_data['date'].values[0] * 1000

    print('--MLP')
    y, y_pred = mlp_model_forecast(train_data.copy(), test_data.copy())
    mlp = {"y": y, "y_pred": y_pred, "start_timestamp": start_timestamp}

    print('--CNN')
    y, y_pred = cnn_model_forecast(train_data.copy(), test_data.copy())
    cnn = {"y": y, "y_pred": y_pred, "start_timestamp": start_timestamp}

    resp[location] = {"mlp": mlp, "cnn": cnn}

with open('resp.json', 'w+') as outfile:
    json.dump(json.dumps(resp, cls=NumpyArrayEncoder), outfile)





