# 解題核心：能被 400 整除，或能被 4 整除但不能被 100 整除，即為閏年。
# 積木對照：要求輸入年份 → 用餘數與「且／或」組合條件 → 說出 true 或 false。
year = int(input())
is_leap = year % 400 == 0 or (year % 4 == 0 and year % 100 != 0)
print("true" if is_leap else "false")
