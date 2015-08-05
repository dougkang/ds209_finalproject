import pandas as pd

# Since we only care about the data per industry, let's group by industry
ic = pd.read_csv("out/indivs.csv", error_bad_lines=False)
ic = ic.loc[:, ['Cycle', 'RecipID', 'Orgname', 'RealCode', 'Amount']]
ic = ic.groupby([ "Cycle", "RecipID", "Orgname", "RealCode"]).sum().reset_index()

# Combine candidates and committees into one superlist of entities
c = pd.read_csv("out/cands.csv", error_bad_lines=False)
c = c.loc[c["DistIDRunFor"] == "PRES", [ "Cycle", "CID", "FirstLastP", "Party", "RecipCode" ]]
c.columns = [ "Cycle", "EntityId", "Name", "Party", "RecipCode" ]
c["Destination"] = "Cand"

p = pd.read_csv("out/cmtes.csv", error_bad_lines=False)
p = p.loc[:, [ "Cycle", "CmteID", "PACShort", "Party", "RecipCode", "PrimCode" ]]
p.columns = [ "Cycle", "EntityId", "Name", "Party", "RecipCode", "PrimCode" ]
p["Destination"] = "Cmte"

ent = pd.concat([c, p]).drop_duplicates(["EntityId"])

out = ic.merge(ent, left_on = [ 'RecipID' ], right_on = [ 'EntityId' ], how = 'inner')
out = out.loc[:, [ "Cycle_x", "RealCode", "Amount", "Party", "Destination" ]]
out.columns = [ "Cycle", "RealCode", "Amount", "Party", "Destination" ]
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
                          "Amount": 0.0 })

out = pd.concat([out, pd.DataFrame(to_add)])
out = out.sort("Cycle")
out.to_csv("out/ic_org.csv")
