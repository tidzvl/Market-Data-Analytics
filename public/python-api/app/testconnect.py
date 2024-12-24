from pulp import LpMaximize, LpProblem, LpVariable, lpSum, value

# Dữ liệu giả định với xử lý null
categories = ['Bikes', 'Components', 'Clothing', 'Accessories']
profit_percent = [20, 15, 12, 8]  # % lợi nhuận cho từng loại sản phẩm
weight_percent = [0.4, 0.3, 0.2, 0.1]  # % khối lượng của từng loại sản phẩm
diversity_constraints = [0.2, 0.2, 0.2, 0.2]  # Tỷ lệ tối thiểu của mỗi loại sản phẩm
total_weight = 100000  # Tổng khối lượng hàng hóa (kg)
sell_rate = 0.5  # 50% hàng hóa sẽ được bán sau 3 tháng

# Thêm xử lý null cho weight_percent nếu có
weight_percent = [w if w is not None else 0.1 for w in weight_percent]

# Khởi tạo mô hình bài toán
model = LpProblem(name="profit-maximization", sense=LpMaximize)

# Khai báo các biến số nguyên và số thực cho từng loại sản phẩm
x = {category: LpVariable(name=category, lowBound=0, cat="Continuous") for category in categories}

# Hàm mục tiêu: Tối đa hóa lợi nhuận
model += lpSum([profit_percent[i] * x[category] for i, category in enumerate(categories)]), "Total Profit"

# Ràng buộc tổng khối lượng <= 50% tổng khối lượng ban đầu
model += lpSum([weight_percent[i] * x[category] for i, category in enumerate(categories)]) <= total_weight * sell_rate, "Weight Constraint"

# Ràng buộc đảm bảo đa dạng sản phẩm
for i, category in enumerate(categories):
    model += x[category] >= total_weight * diversity_constraints[i], f"Diversity Constraint {category}"

# Thêm ràng buộc mới để tránh ưu tiên một sản phẩm duy nhất
# Giả sử không loại sản phẩm nào được vượt quá một tỷ lệ nhất định (ví dụ 60%) trong tổng khối lượng bán ra
max_proportion = 0.6
for i, category in enumerate(categories):
    model += x[category] <= total_weight * max_proportion, f"Max Proportion Constraint {category}"

# Giải bài toán
model.solve()

# In kết quả
print("Status:", model.status)
for var in model.variables():
    print(f"{var.name}: {var.value()} kg")
print("Lợi nhuận tối đa:", value(model.objective))
