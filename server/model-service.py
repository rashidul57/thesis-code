from statsmodels.tsa.arima.model import ARIMA
from random import random
from numpy import array
from keras.models import Sequential
from keras.layers import Dense
from keras.models import model_from_yaml
from keras.models import load_model
import numpy as np

import pandas
import pandas as pd
import warnings
warnings.filterwarnings("ignore") 

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
    total_size = group_df.shape[0]
    
    perc = 10
    test_size = int(total_size * perc/100)
    train_size = total_size - test_size

    if mode == 'train':
        ret_df = group_df.iloc[0:train_size, :]
    else:
        ret_df = group_df.iloc[train_size: -1, :]
    
    print(mode, total_size, train_size, test_size, ret_df.shape)
    return ret_df


def build_n_save_mlp_model(group_df):
    X = train_data['date'].values.ravel()
    y = train_data['total_cases'].values.ravel()

    print('----training-----')
    print('Input')
    xx = X[-10:-1]
    for i in range(len(xx)):
        print(xx[i])

    print('Output')
    yy = y[-10:-1]
    for i in range(len(yy)):
        print(yy[i])

    # define model
    model = Sequential()
    model.add(Dense(100, activation='relu', input_dim=1))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')
    # fit model
    model.fit(X, y, epochs=2000, verbose=0)

    model.save("trained-models/mlp.h5")
    print("Saved model to disk")

def load_n_test_model(test_data):

    # load model
    model = load_model('trained-models/mlp.h5')
    print("Loaded model from disk")

    x_input = test_data['date'].values.ravel()

    print('----------Testing------------')

    print('Input')
    xx = x_input[-10:-1]
    for i in range(len(xx)):
        print(xx[i])


    # print(type(x_input))
    # print(x_input)
    y = test_data['total_cases'].values.ravel()
    yhat = model.predict(x_input, verbose=0)
    print('\nActual:', len(y))
    yy = y[-20:-1]
    for i in range(len(yy)):
        print(yy[i])

    print('\nPredicted:', len(yhat))
    yhat1 = yhat[-20:-1]
    for i in range(len(yhat1)):
        print(yhat1[i][0])
    

group_df = load_data()
train_data = get_data('train', group_df)
test_data = get_data('test', group_df)

print(train_data.shape, test_data.shape)

build_n_save_mlp_model(train_data)
load_n_test_model(test_data)


