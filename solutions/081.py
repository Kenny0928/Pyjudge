# 解題核心：依序讀取兩個整數與運算子字元，用 if/elif 選擇對應運算；除法保證整除。
a = int(input())
b = int(input())
op = input().strip()

if op == "+":
    result = a + b
elif op == "-":
    result = a - b
elif op == "*":
    result = a * b
else:
    result = a // b

print(result)
