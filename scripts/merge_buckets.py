import pandas as pd

# Since we only care about the data per industry, let's group by industry
ic = pd.read_csv("out/indivs.csv", error_bad_lines=False)
ic = ic.loc[ic['Cycle'] % 4 == 0, ['Cycle', 'RecipID', 'Orgname', 'Amount']]
ic['Count'] = 1
ic['Bucket'] = pd.cut(ic['Amount'], bins = [ 0, 500, 1000, 2600, ic['Amount'].max() ], \
                      labels = [ "a", "b", "c", "d" ])
ic = ic.groupby([ "Cycle", "Bucket"]).sum().reset_index()
ic = ic.loc[ic['Cycle'] != 2016]

out = ic

# Set empty values because its easier to deal with them here than in d3
cycles = list(set(out["Cycle"]))
buckets = list(set(out["Bucket"]))

to_add = []
for c in cycles:
  for b in buckets :
    if not ((out["Cycle"] == c) & (out["Bucket"] == b)).any():
      to_add.append({ "Cycle": c, "Bucket": b, "Amount": 0.0, "Count": 0 })

out = pd.concat([out, pd.DataFrame(to_add)])
out = out.sort("Cycle")
out.to_csv("out/count_out.csv")
