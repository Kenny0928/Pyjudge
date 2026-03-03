# 二進制轉十進制 - Python 參考解答

binary = input()

result = 0

# 從左到右走訪每個字元
# 每走一步，把目前結果乘以 2，再加上當前位元值
for ch in binary:
    result = result * 2 + int(ch)

print(result)
