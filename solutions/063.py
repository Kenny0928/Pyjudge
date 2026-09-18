# 解題核心：由高到低依序用 if/elif 判斷分數所在的等級區間。
a = int(input())
if a >= 90:
    grade = "A"
elif a >= 80:
    grade = "B"
elif a >= 70:
    grade = "C"
elif a >= 60:
    grade = "D"
else:
    grade = "F"
print(grade)
