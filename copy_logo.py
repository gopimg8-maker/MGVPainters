import shutil
import os

src = r"C:\Users\navya shree g n\.gemini\antigravity-ide\brain\03c80d4e-8b04-41e6-9c0a-ecccdeca1575\media__1784868379434.jpg"
dst = r"E:\MGV Painters\logo.jpg"

print("Checking src exists:", os.path.exists(src))
try:
    shutil.copy(src, dst)
    print("Success")
except Exception as e:
    print("Error:", e)
