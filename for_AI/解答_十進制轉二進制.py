# 十進制轉二進制 - Python 參考解答

n = int(input())

# 邊界處理：0 的二進制就是 "0"
if n == 0:
    print(0)
else:
    result = ""

    # 反覆除以 2，將餘數串接起來
    while n > 0:
        result = str(n % 2) + result  # 餘數加在最前面（反向堆疊）
        n = n // 2

    print(result)
