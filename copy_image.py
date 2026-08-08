import shutil
import os

src = r"C:\Users\navya shree g n\.gemini\antigravity-ide\brain\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\media__1785573027866.jpg"
dst = r"e:\MGV Painters\director.jpg"

try:
    shutil.copy(src, dst)
    print("SUCCESS")
except Exception as e:
    print("ERROR:", e)
