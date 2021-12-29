
# https://www.machinelearningplus.com/time-series/arima-model-time-series-forecasting-python/
from statsmodels.tsa.arima_model import ARIMA
import pmdarima as pm
import pandas as pd
import numpy as np
import os
import model_service as model_service
import json
from json import JSONEncoder


def predict_usage_data(data, n_periods):
    # df = pd.read_csv('https://raw.githubusercontent.com/selva86/datasets/master/wwwusage.csv', names=['value'], header=0)
    # print(df.value.shape)
    # data = df.value
    df = pd.DataFrame(data)
    model = pm.auto_arima(df.values, start_p=1, start_q=1,
                        test='adf',       # use adftest to find optimal 'd'
                        max_p=3, max_q=3, # maximum p and q
                        m=1,              # frequency of series
                        d=None,           # let model determine 'd'
                        seasonal=False,   # No Seasonality
                        start_P=0, 
                        D=0, 
                        trace=False,
                        error_action='ignore',  
                        suppress_warnings=True, 
                        stepwise=True)

    # Forecast
    fc, confint = model.predict(n_periods=n_periods, return_conf_int=True)
    index_of_fc = np.arange(len(df.values), len(df.values)+n_periods)

    # make series for calculating ranges
    fc_series = pd.Series(fc, index=index_of_fc).to_numpy()
    lower_series = pd.Series(confint[:, 0], index=index_of_fc).array
    upper_series = pd.Series(confint[:, 1], index=index_of_fc).array
    ranges = list()
    for i in range(lower_series.shape[0]):
        ranges.append([str(lower_series[i]), str(upper_series[i])])
    return fc_series, ranges



n_test = 200
resp = {}
props = ['new_cases', 'new_deaths', 'new_tests', 'new_vaccinations']
# props = ['new_cases']

for k in range(len(props)):
    prop = props[k]
    all_data_df = model_service.load_data_by_prop(prop)
    grouped_loc_df = all_data_df.groupby(by=["location"]).sum().reset_index()
    excl_regions = ['World', 'Asia', 'European Union', 'Europe', 'South America', 'North America', 'High income', 'Low income', 'Upper middle income', 'Lower middle income']
    grouped_loc_df = grouped_loc_df[~grouped_loc_df.location.isin(excl_regions)]

    grouped_loc_df = grouped_loc_df.sort_values(by=[prop], ascending=False)
    resp[prop] = {}
    for i in range(100):
        location = grouped_loc_df.location.values[i]
        print(location)
        filtered_df = all_data_df[all_data_df.location == location]
        data = filtered_df[prop].values
        # print(data[0])
        dates = filtered_df.date.values
        start_timestamp = dates[-n_test:][0]

        code = filtered_df.iso_code.values[0]
        # print(code)
        fc_series, ranges = predict_usage_data(data, n_test)
        # print(ranges)
        arima = {"y_pred": fc_series, "ranges": ranges, "start_timestamp": start_timestamp}

        resp[prop][location] = {"code": code, "arima": arima}

with open('resp-arima-new.json', 'w+') as outfile:
    json.dump(json.dumps(resp, cls=model_service.NumpyArrayEncoder), outfile)
