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

import pandas
import pandas as pd
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

def arima_model():
    # contrived dataset
    data = [x + random() for x in range(1, 100)]

    # fit model
    model = ARIMA(data, order=(1, 1, 1))
    model_fit = model.fit()
    # make prediction
    yhat = model_fit.predict(len(data), len(data), typ='levels')
    print(yhat)


def load_data():
    df = pandas.read_csv('server/data/owid.csv', 
        parse_dates=['date'], 
        header=0
    )
    cases_df = df[['location', 'date', 'total_cases']]
    group_df = cases_df.groupby(by=["date"]).sum().reset_index()
    group_df['date'] = group_df.date.values.astype(np.int64) // 10 ** 9

    return group_df

def get_data(mode, group_df):
    # group_df = group_df.iloc[0:50, :]

    total_size = group_df.shape[0]
    
    perc = 10
    test_size = int(total_size * perc/100)
    train_size = total_size - test_size

    if mode == 'train':
        ret_df = group_df.iloc[0:train_size, :]
    else:
        ret_df = group_df.iloc[train_size: -1, :]
    
    # print(mode, total_size, train_size, test_size, ret_df.shape)
    return ret_df


def build_n_save_mlp_model(group_df):
    X = train_data['date'].values.ravel()
    y = train_data['total_cases'].values.ravel()

    # print('----training-----')
    # print('Input')
    # xx = X[-10:-1]
    # for i in range(len(xx)):
    #     print(xx[i])

    # print('Output')
    # yy = y[-10:-1]
    # for i in range(len(yy)):
    #     print(yy[i])

    # define model
    model = Sequential()
    model.add(Dense(100, activation='relu', input_dim=1))
    # model.add(Dense(10, activation='relu', input_dim=1))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')
    # fit model
    model.fit(X, y, epochs=100, verbose=0)

    model.save("trained-models/mlp.h5")
    print("Saved model to disk")

def load_n_test_mlp_model(test_data):

    # load model
    model = load_model('trained-models/mlp.h5')
    print("Loaded model from disk")

    x_input = test_data['date'].values.ravel()

    print('----------Testing------------')

    # print('Input')
    # xx = x_input[-10:-1]
    # for i in range(len(xx)):
    #     print(xx[i])

    y = test_data['total_cases'].values.ravel()
    yhat = model.predict(x_input, verbose=0)
    print('\nActual:', len(y))
    yy = y[-5:-1]
    for i in range(len(yy)):
        print(yy[i])

    print('\nPredicted:', len(yhat))
    yhat1 = yhat[-5:-1]
    for i in range(len(yhat1)):
        print(yhat1[i][0])


def build_n_save_cnn_model(group_df):
    dates = train_data['date'].values
    y = train_data['total_cases'].values

    # define model
    # model = Sequential()
    # model.add(Dense(100, activation='relu', input_dim=1))
    # # model.add(Dense(10, activation='relu', input_dim=1))
    # model.add(Dense(1))
    # model.compile(optimizer='adam', loss='mse')
    # # fit model
    # model.fit(X, y, epochs=100, verbose=0)

    n_features = 1
    n_steps = 3

    X = []
    for i in range(len(dates)):
        row = np.array([np.array([dates[i]]), np.array([1]), np.array([1])])
        X.append(row)
    X = np.array(X)
    # print('...............................')
    # print(X[0], X.shape)
    # print(type(X))
    # print(type(X[0]))
    # print(type(X[0][0]))
    # print(type(X[0][0][0]))
    # print(y)

    # X = X.reshape((X.shape[0], X.shape[1], n_features))

    model = Sequential()
    model.add(Conv1D(filters=64, kernel_size=2, activation='relu', input_shape=(n_steps, n_features)))
    model.add(MaxPooling1D(pool_size=2))
    model.add(Flatten())
    model.add(Dense(50, activation='relu'))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')
    # fit model
    model.fit(X, y, epochs=100, verbose=0)

    model.save("trained-models/cnn.h5")
    print("Saved model to disk")

def load_n_test_cnn_model(test_data):

    # load model
    model = load_model('trained-models/cnn.h5')
    print("Loaded model from disk")

    dates = test_data['date'].values.ravel()

    X = []
    for i in range(len(dates)):
        row = np.array([np.array([dates[i]]), np.array([1]), np.array([1])])
        X.append(row)
    x_input = np.array(X)

    print('----------Testing------------')

    # print('Input')
    # xx = x_input[-10:-1]
    # for i in range(len(xx)):
    #     print(xx[i])

    y = test_data['total_cases'].values.ravel()
    yhat = model.predict(x_input, verbose=0)
    print('\nActual:', len(y))
    yy = y[-5:-1]
    for i in range(len(yy)):
        print(yy[i])

    print('\nPredicted:', len(yhat))
    yhat1 = yhat[-5:-1]
    for i in range(len(yhat1)):
        print(yhat1[i][0])
    

group_df = load_data()
train_data = get_data('train', group_df)
test_data = get_data('test', group_df)

# print(train_data.shape, test_data.shape)

print('---mlp---')
build_n_save_mlp_model(train_data.copy())
load_n_test_mlp_model(test_data.copy())

print('---cnn---')
build_n_save_cnn_model(train_data.copy())
load_n_test_cnn_model(test_data.copy())


