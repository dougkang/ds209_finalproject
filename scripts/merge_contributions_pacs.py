import pandas as pd

# Since we only care about the data per industry, let's group by industry
ic = pd.read_csv("out/indivs.sample.csv", error_bad_lines=False)
ic = ic.loc[ic['Cycle'].astype(int) % 4 == 0, ['Cycle', 'RecipID', 'Orgname', 'RealCode', 'Amount']]
ic['Count'] = 1
ic['Bucket'] = pd.cut(ic['Amount'], bins = [ 0, 500, 1000, 2500, 30000, ic['Amount'].max() ], \
                      labels = [ "a", "b", "c", "d", "e" ])
ic = ic.groupby([ "Cycle", "RecipID", "Orgname", "RealCode", "Bucket" ]).sum().reset_index()
ic = ic.loc[ic['Cycle'] != 2016]

p = pd.read_csv("out/cmtes.csv", error_bad_lines=False)
p = p.loc[:, [ "CmteID", "PACShort", "Party", "RecipCode", "PrimCode" ]]
p.columns = [ "EntityId", "Name", "Party", "RecipCode", "PrimCode" ]
p = p.drop_duplicates(["EntityId"])

out = ic.merge(p, left_on = [ 'RecipID' ], right_on = [ 'EntityId' ], how = 'inner')
out = out.loc[:, [ "Cycle", "RealCode", "Amount", "Party", "Bucket", "Count" ]]
out = out.groupby([ "Cycle", "RealCode", "Party", "Bucket" ]).agg(sum).reset_index()

# Set empty values because its easier to deal with them here than in d3
realcodes = list(set(out["RealCode"]))
cycles = list(set(out["Cycle"]))
parties = list(set(out["Party"]))
buckets = list(set(out["Bucket"]))

to_add = []
for rc in realcodes:
  for c in cycles:
    for p in parties:
      for b in buckets:
        if not ((out["RealCode"] == rc) & (out["Cycle"] == c) & \
                   (out["Party"] == p) & (out['Bucket'] == b)).any():
          to_add.append({ "RealCode": rc, "Cycle": c, "Party": p, "Bucket": b, \
                        "Amount": 0.0, "Count": 0 })

out = pd.concat([out, pd.DataFrame(to_add)])
out = out.sort("Cycle")
out.to_csv("out/cont_pacs_out.csv")
