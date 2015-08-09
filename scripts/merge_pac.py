import pandas as pd

# Since we only care about the data per industry, let's group by industry
ic = pd.read_csv("out/pacs.csv", error_bad_lines=False)
ic = ic.loc[ic['Cycle'] % 4 == 0, ['Cycle', 'PACID', 'CID', 'Type', 'RealCode', 'Amount']]
ic = ic.loc[ic['Cycle'] != 2016]
ic['RealCode'] = map(lambda x: x[0], ic['RealCode'])
ic = ic.groupby([ "Cycle", "PACID", "CID", "Type", "RealCode"]).sum().reset_index()

p = pd.read_csv("out/cmtes.csv", error_bad_lines=False)
p = p.loc[:, [ "CmteID", "PACShort", "Party" ]]
p.columns = [ "CmteID", "Name", "Party" ]
p = p.drop_duplicates(["CmteID"])

out = ic.merge(p, left_on = [ 'PACID' ], right_on = [ 'CmteID' ], how = 'inner')
out = out.loc[:, [ "Cycle", "Name", "RealCode", "Amount", "Party", "Type" ]]
out.columns = [ "Cycle", "Name", "RealCode", "Amount", "Party", "Type" ]
out = out.groupby([ "Cycle", "Name", "RealCode", "Party", "Type" ]).agg(sum).reset_index()

# Set empty values because its easier to deal with them here than in d3
realcodes = list(set(out["RealCode"]))
cycles = list(set(out["Cycle"]))
parties = list(set(out["Party"]))
types = list(set(out["Type"]))

to_add = []
for rc in realcodes:
  for c in cycles:
    for p in parties:
      for t in types:
        if not ((out["RealCode"] == rc) & (out["Cycle"] == c) & \
                   (out["Party"] == p) & (out['Type'] == t)).any():
          to_add.append({ "RealCode": rc, "Cycle": c, "Party": p, "Type": t, \
                          "Amount": 0.0 })

out = pd.concat([out, pd.DataFrame(to_add)])
out = out.sort("Cycle")
out.to_csv("out/pac_out.csv")
