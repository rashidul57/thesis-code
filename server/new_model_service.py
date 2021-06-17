# evaluate mlp
from math import sqrt
from numpy import array
from numpy import mean
from numpy import std
from pandas import DataFrame
from pandas import concat
from pandas import read_csv
from sklearn.metrics import mean_squared_error
from keras.models import Sequential
from keras.layers import Dense
from matplotlib import pyplot
import pandas
import pandas as pd
import numpy as np
from keras.layers import Dense
from keras.layers import LSTM
from keras.layers import Flatten
from keras.layers.convolutional import Conv1D
from keras.layers.convolutional import MaxPooling1D
import datetime

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

# split a univariate dataset into train/test sets
def train_test_split(data, n_test):
	return data[:-n_test], data[-n_test:]

# transform list into supervised learning format
def series_to_supervised(data, n_in=1, n_out=1):
	df = DataFrame(data)
	cols = list()
	# input sequence (t-n, ... t-1)
	for i in range(n_in, 0, -1):
		cols.append(df.shift(i))
	# forecast sequence (t, t+1, ... t+n)
	for i in range(0, n_out):
		cols.append(df.shift(-i))
	# put it all together
	agg = concat(cols, axis=1)
	# drop rows with NaN values
	agg.dropna(inplace=True)
	return agg.values

# root mean squared error or rmse
def measure_rmse(actual, predicted):
	return sqrt(mean_squared_error(actual, predicted))

# fit a model
def mlp_model_fit(train, config):
	# unpack config
	n_input, n_nodes, n_epochs, n_batch = config
	# prepare data
	data = series_to_supervised(train, n_in=n_input)
	# print(data.shape, n_input)

	train_x, train_y = data[:, :-1], data[:, -1]

	# define model
	model = Sequential()
	model.add(Dense(n_nodes, activation='relu', input_dim=n_input))
	model.add(Dense(1))
	model.compile(loss='mse', optimizer='adam')
	# train model
	model.fit(train_x, train_y, epochs=n_epochs, batch_size=n_batch, verbose=0)
	
	return model

def cnn_model_fit(train, config):
	# unpack config
	n_input, n_filters, n_kernel, n_epochs, n_batch = config
	# prepare data
	data = series_to_supervised(train, n_in=n_input)
	train_x, train_y = data[:, :-1], data[:, -1]

	train_x = train_x.reshape((train_x.shape[0], train_x.shape[1], 1))

	# define model
	model = Sequential()
	model.add(Conv1D(filters=n_filters, kernel_size=n_kernel, activation='relu', input_shape=(n_input, 1)))
	model.add(Conv1D(filters=n_filters, kernel_size=n_kernel, activation='relu'))
	model.add(MaxPooling1D(pool_size=2))
	model.add(Flatten())
	model.add(Dense(1))
	model.compile(loss='mse', optimizer='adam')
	# fit
	model.fit(train_x, train_y, epochs=n_epochs, batch_size=n_batch, verbose=0)
	return model

def lstm_model_fit(train, config):
	# unpack config
	n_input, n_nodes, n_epochs, n_batch, n_diff = config
	# prepare data
	if n_diff > 0:
		train = difference(train, n_diff)
	data = series_to_supervised(train, n_in=n_input)
	train_x, train_y = data[:, :-1], data[:, -1]
	train_x = train_x.reshape((train_x.shape[0], train_x.shape[1], 1))
	# define model
	model = Sequential()
	model.add(LSTM(n_nodes, activation='relu', input_shape=(n_input, 1)))
	model.add(Dense(n_nodes, activation='relu'))
	model.add(Dense(1))
	model.compile(loss='mse', optimizer='adam')
	# fit
	model.fit(train_x, train_y, epochs=n_epochs, batch_size=n_batch, verbose=0)
	return model

def difference(data, interval):
	return [data[i] - data[i - interval] for i in range(interval, len(data))]

# forecast with a pre-fit model
def model_predict(model, history, config, alg_name):
	if (alg_name == 'mlp'):
		# unpack config
		n_input, _, _, _ = config
		# prepare data
		x_input = array(history[-n_input:]).reshape(1, n_input)
	if (alg_name == 'cnn'):
		# unpack config
		n_input, _, _, _, _ = config
		# prepare data
		x_input = array(history[-n_input:]).reshape((1, n_input, 1))
	if (alg_name == 'lstm'):
		# unpack config
		n_input, _, _, _, n_diff = config
		# prepare data
		correction = 0.0
		if n_diff > 0:
			correction = history[-n_diff]
			history = difference(history, n_diff)
		x_input = array(history[-n_input:]).reshape((1, n_input, 1))

	# forecast
	yhat = model.predict(x_input, verbose=0)
	return yhat[0]

# walk-forward validation for univariate data
def train_n_forecast(data, n_test, config, alg_name):
	predictions = list()
	# split dataset
	train, test = train_test_split(data, n_test)

	# fit model
	if (alg_name == 'mlp'):
		model = mlp_model_fit(train, config)
	if (alg_name == 'cnn'):
		model = cnn_model_fit(train, config)
	if (alg_name == 'lstm'):
		model = lstm_model_fit(train, config)

	# seed history with training dataset
	history = [x for x in train]

	# step over each time-step in the test set
	for i in range(len(test)):
		# fit model and make forecast for history
		yhat = model_predict(model, history, config, alg_name)
		# store forecast in list of predictions
		predictions.append(yhat)
		# add actual observation to history for the next loop
		history.append(test[i])

		# print(test[i], yhat)

	# print(array(predictions))
	# estimate prediction error
	# error = measure_rmse(test, predictions)
	# print(' > %.3f' % error)
	return test, predictions

def load_all_data():
    df = pandas.read_csv('server/data/owid.csv', 
        # parse_dates=['date'], 
        header=0
    )
    prop_df = df[['location', 'iso_code', 'date', 'total_cases', 'new_cases', 'new_deaths', 'icu_patients', 'hosp_patients', 'new_tests', 'new_vaccinations' ]]
    prop_df = prop_df.replace(np.nan, 0)
    return prop_df

def load_data_by_prop(prop):
    df = pandas.read_csv('server/data/owid.csv', 
        # parse_dates=['date'], 
        header=0
    )
    prop_df = df[['location', 'iso_code', 'date', prop]]
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

    return group_df

