import re

CHAR_SUB = re.compile("{(\\d+)}", re.DOTALL)

def processOneReport(key, value):
  value = re.sub(CHAR_SUB, "<code>character\\1</code>", value)

  return f"""<details><summary>{key}</summary>
<p>{value}</p></details>
"""

def main():
  with open("sales_report.txt", "w", encoding="utf-8") as w:
    with open("_data/processed/Japanese.properties", "r") as f:
      for l in f:
        key, value = l.split("=", 1)
        if key.startswith("SALES_REPORT_") or key.startswith("SALES_EVENT_"):
          w.write(processOneReport(key, value))
          w.write("\n")

if __name__ == '__main__':
  main()
