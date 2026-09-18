# 解題核心：套用三角形面積公式 a * b / 2，並以固定兩位小數格式輸出。
a = int(input())
b = int(input())
area = a * b / 2
print(f"{area:.2f}")
