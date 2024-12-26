import json
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
import numpy as np
from scipy.optimize import linprog

data = """{
    "2011": {"MountainBikes": {"Profit": 33.05, "Quantity": 19, "Weight": 56.37}, "RoadBikes": {"Profit": 66.95, "Quantity": 43, "Weight": 43.63}},
    "2012": {"MountainBikes": {"Profit": 38.72, "Quantity": 67, "Weight": 41.46}, "RoadBikes": {"Profit": 61.28, "Quantity": 129, "Weight": 58.54}},
    "2013": {"BikeRacks": {"Profit": 0.23, "Quantity": 16, "Weight": 0}, "BikeStands": {"Profit": 0.07, "Quantity": 2, "Weight": 0}, "BottlesandCages": {"Profit": 0.13, "Quantity": 79, "Weight": 0}, "BottomBrackets": {"Profit": 0.07, "Quantity": 11, "Weight": 10.03}, "Brakes": {"Profit": 0.03, "Quantity": 5, "Weight": 8.09}, "Caps": {"Profit": 0.01, "Quantity": 26, "Weight": 0}, "Chains": {"Profit": 0.01, "Quantity": 6, "Weight": 0}, "Cleaners": {"Profit": 0.02, "Quantity": 16, "Weight": 0}, "Cranksets": {"Profit": 0.09, "Quantity": 5, "Weight": 29.97}, "Derailleurs": {"Profit": 0.08, "Quantity": 15, "Weight": 7.73}, "Fenders": {"Profit": 0.09, "Quantity": 17, "Weight": 0}, "Gloves": {"Profit": 0.12, "Quantity": 26, "Weight": 0}, "Handlebars": {"Profit": 0.04, "Quantity": 10, "Weight": 0}, "Helmets": {"Profit": 0.5, "Quantity": 70, "Weight": 0}, "HydrationPacks": {"Profit": 0.15, "Quantity": 15, "Weight": 0}, "Jerseys": {"Profit": 0.03, "Quantity": 65, "Weight": 0}, "MountainBikes": {"Profit": 51.01, "Quantity": 162, "Weight": 7.13}, "MountainFrames": {"Profit": 0.02, "Quantity": 3, "Weight": 0.14}, "Pedals": {"Profit": 0.02, "Quantity": 5, "Weight": 5.56}, "RoadBikes": {"Profit": 38.03, "Quantity": 179, "Weight": 14.58}, "RoadFrames": {"Profit": 0, "Quantity": 1, "Weight": 0.06}, "Saddles": {"Profit": 0.04, "Quantity": 15, "Weight": 0}, "Shorts": {"Profit": 0.2, "Quantity": 18, "Weight": 0}, "Socks": {"Profit": 0, "Quantity": 2, "Weight": 0}, "TiresandTubes": {"Profit": 0.23, "Quantity": 69, "Weight": 0}, "TouringBikes": {"Profit": 8.68, "Quantity": 211, "Weight": 15.53}, "TouringFrames": {"Profit": 0, "Quantity": 70, "Weight": 1.18}, "Vests": {"Profit": 0.15, "Quantity": 22, "Weight": 0}},
    "2014": {"BikeRacks": {"Profit": 0.59, "Quantity": 47, "Weight": 0}, "BikeStands": {"Profit": 0.46, "Quantity": 14, "Weight": 0}, "BottlesandCages": {"Profit": 0.48, "Quantity": 343, "Weight": 0}, "BottomBrackets": {"Profit": 0.1, "Quantity": 20, "Weight": 8.97}, "Brakes": {"Profit": 0.08, "Quantity": 14, "Weight": 14.47}, "Caps": {"Profit": 0.03, "Quantity": 113, "Weight": 0}, "Chains": {"Profit": 0.02, "Quantity": 16, "Weight": 0}, "Cleaners": {"Profit": 0.11, "Quantity": 88, "Weight": 0}, "Cranksets": {"Profit": 0.27, "Quantity": 19, "Weight": 26.82}, "Derailleurs": {"Profit": 0.14, "Quantity": 25, "Weight": 6.92}, "Fenders": {"Profit": 0.36, "Quantity": 79, "Weight": 0}, "Gloves": {"Profit": 0.37, "Quantity": 91, "Weight": 0}, "Handlebars": {"Profit": 0.05, "Quantity": 12, "Weight": 0}, "Helmets": {"Profit": 2.33, "Quantity": 368, "Weight": 0}, "HydrationPacks": {"Profit": 0.75, "Quantity": 86, "Weight": 0}, "Jerseys": {"Profit": 0.26, "Quantity": 332, "Weight": 0}, "MountainBikes": {"Profit": 35.18, "Quantity": 157, "Weight": 11.47}, "MountainFrames": {"Profit": 0.27, "Quantity": 22, "Weight": 0.65}, "Pedals": {"Profit": 0.02, "Quantity": 6, "Weight": 9.2}, "RoadBikes": {"Profit": 41.53, "Quantity": 277, "Weight": 7.12}, "Saddles": {"Profit": 0.05, "Quantity": 20, "Weight": 0}, "Shorts": {"Profit": 0.51, "Quantity": 48, "Weight": 0}, "Socks": {"Profit": 0.04, "Quantity": 24, "Weight": 0}, "TiresandTubes": {"Profit": 2.32, "Quantity": 795, "Weight": 0}, "TouringBikes": {"Profit": 12.91, "Quantity": 333, "Weight": 13.9}, "TouringFrames": {"Profit": 0, "Quantity": 35, "Weight": 0.49}, "Vests": {"Profit": 0.79, "Quantity": 122, "Weight": 0}}
}"""

data_dict = json.loads(data)

def normalize_values(data_dict):
    profits, weights, quantities = [], [], []
    
    # Thu thập tất cả các giá trị
    for year, products in data_dict.items():
        for product, values in products.items():
            profits.append(values["Profit"])
            weights.append(values["Weight"])
            quantities.append(values["Quantity"])
    
    # Chuẩn hóa các giá trị
    scaler = MinMaxScaler()
    profits = scaler.fit_transform([[x] for x in profits])
    weights = scaler.fit_transform([[x] for x in weights])
    quantities = scaler.fit_transform([[x] for x in quantities])
    
    index = 0
    for year, products in data_dict.items():
        for product, values in products.items():
            values["NormalizedProfit"] = profits[index][0]
            values["NormalizedWeight"] = weights[index][0]
            values["NormalizedQuantity"] = quantities[index][0]
            index += 1
            
    return data_dict

def calculate_combined_index(data_dict):
    combined_indices = {}  

    for year, products in data_dict.items():
        print(f"Năm {year}:")
        for product, values in products.items():
            profit = values["Profit"]
            quantity = values["Quantity"]
            weight = values["Weight"]
            
            if weight != 0:
                profit_weight_ratio = profit / weight
            else:
                profit_weight_ratio = profit / quantity
            
            profit_quantity_ratio = profit / quantity
            
            combined_index = (profit_weight_ratio + profit_quantity_ratio) / 2  
            
            if product not in combined_indices:
                combined_indices[product] = []
            combined_indices[product].append((year, combined_index))
            
            print(f"  Sản phẩm {product}: Combined Index = {combined_index:.2f}")

    return combined_indices



def predict_future_index(composite_indices):
    output = {}
    for product, indices in composite_indices.items():
        years = np.array([int(year) for year, _ in indices]).reshape(-1, 1)
        index_values = np.array([index for _, index in indices])
        
        model = LinearRegression()
        
        model.fit(years, index_values)
        
        year_2015 = np.array([[2015]])
        predicted_index_2015 = model.predict(year_2015)
        
        output[product] = round(predicted_index_2015[0], 2)
    return output

def optimize_storage(predicted_indices):
    products = list(predicted_indices.keys())
    indices = np.array(list(predicted_indices.values()))
    
    c = -indices  
    
    A_eq = np.ones((1, len(products)))
    b_eq = np.array([1])
    
    bounds = [(0.001, 0.6) for _ in range(len(products))]
    
    result = linprog(c, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
    
    if result.success:
        allocation = result.x
        allocation_dict = {products[i]: round(allocation[i] * 100, 2) for i in range(len(products))}
        return allocation_dict
    else:
        return "Không tìm thấy giải pháp tối ưu"

def combine_allocation(optimized_allocation, current_allocation, capacity = 1, min_percentage=0.001):
    total_allocated = sum(
        float(value) for product, value in current_allocation.items() if isinstance(value, (float, int))
    )
    
    final_allocation = current_allocation.copy()
    
    for product in set(optimized_allocation.keys()).union(current_allocation.keys()):
        try:
            current_alloc = float(final_allocation.get(product, 0))
            if current_alloc < min_percentage:
                additional_alloc = min_percentage - current_alloc
                if total_allocated + additional_alloc <= capacity:
                    final_allocation[product] = round(min_percentage, 4)
                    total_allocated += additional_alloc
                else:
                    final_allocation[product] = round(current_alloc + (capacity - total_allocated), 4)
                    total_allocated = capacity

            if total_allocated >= capacity:
                break
        except:
            print("skip")
    
    for product, desired_alloc in optimized_allocation.items():
        current_alloc = float(final_allocation.get(product, 0))
        
        if current_alloc < desired_alloc / 100:
            additional_alloc = desired_alloc / 100 - current_alloc
            if total_allocated + additional_alloc <= capacity:
                final_allocation[product] = round(current_alloc + additional_alloc, 4)
                total_allocated += additional_alloc
            else:
                final_allocation[product] = round(current_alloc + (capacity - total_allocated), 4)
                total_allocated = capacity
                
        if total_allocated >= capacity:
            break
    
    return final_allocation

current_allocation = {
    "region": "AU",
    "time": "now",
    "weight": "123123",
    "inventory": "",
    "unit": "percent",
    "MountainBikes": 0.12,
    "RoadBikes": 0.32,
    "TouringBikes": 0.11,
    "Handlebars": 0.01,
    "BottomBrackets": 0.01,
    "Brakes": 0.02,
    "Chains": 0.01,
    "Cranksets": 0,
    "Forks": 0,
    "Headsets": 0,
    "MountainFrames": 0.01,
    "Pedals": 0,
    "RoadFrames": 0,
    "Saddles": 0,
    "TouringFrames": 0.02,
    "Wheels": 0.01,
    "Derailleurs": 0,
    "BibShorts": 0,
    "Caps": 0.01,
    "Gloves": 0.02,
    "Jerseys": 0.01,
    "Shorts": 0,
    "Socks": 0,
    "Tights": 0.01,
    "Vests": 0,
    "BikeRacks": 0.01,
    "BikeStands": 0,
    "BottlesandCages": 0,
    "Cleaners": 0,
    "Fenders": 0,
    "Helmets": 0,
    "HydrationPacks": 0,
    "Lights": 0,
    "Locks": 0,
    "Panniers": 0,
    "Pumps": 0,
    "TiresandTubes": 0
}

composite_indices = calculate_combined_index(data_dict)
predicted_indices = predict_future_index(composite_indices)
optimized_allocation = optimize_storage(predicted_indices)

print("Phân bổ tối ưu:\n")
print(optimized_allocation)
final_allocation = combine_allocation(optimized_allocation, current_allocation)
print("\nKết quả cuối cùng:")
print(final_allocation)