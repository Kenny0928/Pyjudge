# 解題核心：多層 if/elif/else，由高到低依序判斷分數等級
# 切點：A>=90, B>=80, C>=70, D<70
# 積木對照解法：
#   ① [設定 score]
#   ② 先判斷 >= 90（A），再 >= 80（B），再 >= 70（C），其餘 D
score = int(input())
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("D")
