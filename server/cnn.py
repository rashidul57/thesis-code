# univariate cnn example
from numpy import array
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import Flatten
from keras.layers.convolutional import Conv1D
from keras.layers.convolutional import MaxPooling1D
import os
import numpy as np
from pandas import DataFrame
from pandas import concat
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 
 
# split a univariate sequence into samples
def split_sequence(sequence, n_steps):
	X, y = list(), list()
	for i in range(len(sequence)):
		# find the end of this pattern
		end_ix = i + n_steps
		# check if we are beyond the sequence
		if end_ix > len(sequence)-1:
			break
		# gather input and output parts of the pattern
		seq_x, seq_y = sequence[i:end_ix], sequence[end_ix]
		X.append(seq_x)
		y.append(seq_y)
	return array(X), array(y)

# define input sequence
# raw_seq = [10, 20, 30, 40, 50, 60, 70, 80, 90]
# # choose a number of time steps
# n_steps = 3
# # split into samples
# X, y = split_sequence(raw_seq, n_steps)
# # print(X)
# # reshape from [samples, timesteps] into [samples, timesteps, features]
# n_features = 1
# X = X.reshape((X.shape[0], X.shape[1], n_features))

# print('.......', X.shape)
# print(X)
# print(y.shape, y)

# # define model
# model = Sequential()
# model.add(Conv1D(filters=64, kernel_size=2, activation='relu', input_shape=(n_steps, n_features)))
# model.add(MaxPooling1D(pool_size=2))
# model.add(Flatten())
# model.add(Dense(50, activation='relu'))
# model.add(Dense(1))
# model.compile(optimizer='adam', loss='mse')
# # fit model
# model.fit(X, y, epochs=100, verbose=0)
# # demonstrate prediction
# x_input = array([70, 80, 90])
# x_input = x_input.reshape((1, n_steps, n_features))
# print(x_input)
# yhat = model.predict(x_input, verbose=0)
# print(yhat)






# define model
def get_model():
	model = Sequential()
	model.add(Conv1D(filters=64, kernel_size=2, activation='relu', input_shape=(n_steps, n_features)))
	model.add(MaxPooling1D(pool_size=2))
	model.add(Flatten())
	model.add(Dense(50, activation='relu'))
	model.add(Dense(1))
	model.compile(optimizer='adam', loss='mse')
	# fit model
	model.fit(X, y, epochs=100, verbose=0)
	return model;

def get_uncertainty(yhats):
	# calculate 95% gaussian prediction interval
	# https://en.wikipedia.org/wiki/1.96
	interval = 1.96 * yhats.std()
	yhat = yhats.mean()
	lower, upper = yhat - interval, yhat + interval
	return lower, yhat, upper

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

n_steps = 3
n_features = 1
# X = array([20211103, 20211103, 20211103, 20211104, 20211104, 20211104, 20211105, 20211105, 20211105, 20211106, 20211106, 20211106, 20211107, 20211107, 20211107, 20211108, 20211108, 20211108])
X = array([20211103, 20211104, 20211105, 20211106, 20211107, 20211108, 20211109, 20211110, 20211111])
series_to_supervised(X, n_in=3, n_out=1)
X = X.reshape((3, n_steps, n_features))
y = array([85,105,125])

print('.......', X.shape)
print(X)
print(y.shape, y)

model1 = get_model();
model2 = get_model();
model3 = get_model();

# demonstrate prediction
x_input = array([20211112, 20211113, 20211114]).reshape((1, n_steps, n_features))
yhat1 = model1.predict(x_input, verbose=0)
# print(x_input, yhat)

# x_input = array([20211123]).reshape((1, n_steps, n_features))
yhat2 = model2.predict(x_input, verbose=0)
# print(x_input, yhat)

yhat3 = model3.predict(x_input, verbose=0)
# print(x_input, yhat)

yhat = np.array([yhat1, yhat2, yhat3])
lower, yhat, upper = get_uncertainty(yhat)

print(lower, yhat, upper)






# data = array([20211103, 20211104, 20211105, 20211106, 20211107, 20211108, 20211109, 20211110, 20211111])
# vals = series_to_supervised(data, n_in=3, n_out=1)

# print(vals)