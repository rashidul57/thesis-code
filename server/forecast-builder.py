import os
import model_service as model_service
import json
from json import JSONEncoder

# data split
n_test = 200

# props = ['new_cases', 'new_deaths', 'icu_patients', 'hosp_patients', 'new_tests', 'new_vaccinations']
resp = {}
props = ['new_cases', 'new_deaths', 'new_tests', 'new_vaccinations']
# props = ['new_cases']

for k in range(len(props)):
	prop = props[k]
	all_data_df = model_service.load_data_by_prop(prop)
	grouped_loc_df = all_data_df.groupby(by=["location"]).sum().reset_index()
	excl_regions = ['World', 'Asia', 'European Union', 'Europe', 'South America', 'North America', 'High income', 'Low income', 'Upper middle income', 'Lower middle income']
	grouped_loc_df = grouped_loc_df[~grouped_loc_df.location.isin(excl_regions)]

	# loc_df = all_data_df[all_data_df.location.isin(['United States'])]

	grouped_loc_df = grouped_loc_df.sort_values(by=[prop], ascending=False)
	resp[prop] = {}
	for i in range(100):
		location = grouped_loc_df.location.values[i]
		print(location)
		filtered_df = all_data_df[all_data_df.location == location]

		data = filtered_df[prop].values
		dates = filtered_df.date.values
		start_timestamp = dates[-n_test:][0]
		code = filtered_df.iso_code.values[0]
	
		# print(start_timestamp)
		# start_timestamp = test_data['date'].values[0] * 1000

		# define config
		config = [24, 500, 100, 100] #n_input, n_nodes, n_epochs, n_batch
		test, predictions, ranges = model_service.train_n_forecast(data, n_test, config, 'mlp')
		mlp = {"y": test, "y_pred": predictions, "ranges": ranges, "start_timestamp": start_timestamp}

		config = [36, 256, 3, 100, 100] #n_input, n_filters, n_kernel, n_epochs, n_batch
		test, predictions, ranges = model_service.train_n_forecast(data, n_test, config, 'cnn')
		cnn = {"y": test, "y_pred": predictions, "ranges": ranges, "start_timestamp": start_timestamp}

		config = [36, 50, 100, 100, 12]
		test, predictions, ranges = model_service.train_n_forecast(data, n_test, config, 'lstm')
		lstm = {"y": test, "y_pred": predictions, "ranges": ranges, "start_timestamp": start_timestamp}

		# print(test, array(predictions))
		resp[prop][location] = {"code": code, "mlp": mlp, "cnn": cnn, "lstm": lstm}

with open('resp-new.json', 'w+') as outfile:
    json.dump(json.dumps(resp, cls=model_service.NumpyArrayEncoder), outfile)


