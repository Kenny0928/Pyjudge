# 解題核心：套用複利公式 P*(1+0.05)^N，四捨五入到小數第二位並固定輸出兩位小數。
principal = int(input())
periods = int(input())
amount = principal * (1.05 ** periods)
print(f"{amount:.2f}")
