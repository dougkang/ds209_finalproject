import pandas as pd

# Since we only care about the data per industry, let's group by industry
ic = pd.read_csv("out/indivs.csv", error_bad_lines=False)
ic = ic.loc[ic['Cycle'].astype(int) % 4 == 0, ['Cycle', 'RecipID', 'Orgname', 'Amount']]
ic['Count'] = 1
ic = ic.groupby([ "Cycle", "RecipID", "Orgname"]).sum().reset_index()
ic = ic.loc[ic['Cycle'] != 2016]

# Combine candidates and committees into one superlist of entities
c = pd.read_csv("out/cands.csv", error_bad_lines=False)
c = c.loc[c["DistIDRunFor"] == "PRES", [ "CID", "FirstLastP", "Party" ]]
c.columns = [ "EntityId", "Name", "Party" ]
c["RealCode"] = "?"
c["Destination"] = "Cand"

p = pd.read_csv("out/cmtes.csv", error_bad_lines=False)
p = p.loc[:, [ "CmteID", "PACShort", "Party", "PrimCode" ]]
p['RealCode'] = map(lambda x: x[0], p['PrimCode'].astype(str))
p = p.loc[:, [ "CmteID", "PACShort", "Party", "RealCode" ]]
p.columns = [ "EntityId", "Name", "Party", "RealCode" ]
p["Destination"] = "Cmte"

ent = pd.concat([c, p]).drop_duplicates(["EntityId"])

out = ic.merge(ent, left_on = [ 'RecipID' ], right_on = [ 'EntityId' ], how = 'inner')
out = out.loc[:, [ "Cycle", "RealCode", "Amount", "Party", "Destination", "Count" ]]
out = out.groupby([ "Cycle", "RealCode", "Party", "Destination" ]).agg(sum).reset_index()

# Set empty values because its easier to deal with them here than in d3
realcodes = list(set(out["RealCode"]))
cycles = list(set(out["Cycle"]))
parties = list(set(out["Party"]))
destinations = list(set(out["Destination"]))

to_add = []
for rc in realcodes:
  for c in cycles:
    for p in parties:
      for d in destinations:
        if not ((out["RealCode"] == rc) & (out["Cycle"] == c) & \
                   (out["Party"] == p) & (out['Destination'] == d)).any():
          to_add.append({ "RealCode": rc, "Cycle": c, "Party": p, "Destination": d, \
                        "Amount": 0.0, "Count": 0 })

out = pd.concat([out, pd.DataFrame(to_add)])
out = out.sort("Cycle")
out.to_csv("out/cont_out.csv")
