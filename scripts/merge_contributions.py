import pandas as pd

# Since we only care about the data per industry, let's group by industry
ic = pd.read_csv("out/indivs.sample.csv", error_bad_lines=False)
ic = ic.loc[:, ['Cycle', 'RecipID', 'Orgname', 'RealCode', 'Amount']]
ic = ic.groupby([ "Cycle", "RecipID", "Orgname", "RealCode" ]).sum().reset_index()

# Combine candidates and committees into one superlist of entities
c = pd.read_csv("out/cands.csv", error_bad_lines=False)
c = c.loc[:, [ "Cycle", "CID", "FirstLastP", "Party", "RecipCode" ]]
c.columns = [ "Cycle", "EntityId", "Name", "Party", "RecipCode" ]
c["Type"] = "Cand"

p = pd.read_csv("out/cmtes.csv", error_bad_lines=False)
p = p.loc[:, [ "Cycle", "CmteID", "PACShort", "Party", "RecipCode", "PrimCode" ]]
p.columns = [ "Cycle", "EntityId", "Name", "Party", "RecipCode", "PrimCode" ]
p["Type"] = "Cmte"

ent = pd.concat([c, p]).drop_duplicates(["EntityId"])

out = ic.merge(ent, left_on = [ 'RecipID' ], right_on = [ 'EntityId' ], how = 'inner')
out = out.loc[:, [ "Cycle_x", "Orgname", "RealCode", "Amount", "EntityId", "Name", "Party", "PrimCode", "RecipCode", "Type" ]]
out.columns = [ "Cycle", "Orgname", "RealCode", "Amount", "EntityId", "Name", "Party", "PrimCode", "RecipCode", "Type" ]
out.to_csv("out/ic_org.csv")
