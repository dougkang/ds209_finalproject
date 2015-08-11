import pandas as pd
import numpy as np

# Since we only care about the data per industry, let's group by industry
ic = pd.read_csv("out/indivs.csv", error_bad_lines=False)
ic = ic.loc[ic['Cycle'].astype(int) % 4 == 0, ['Cycle', 'RecipID', 'Amount']]
ic['Count'] = 1
ic = ic.groupby([ "Cycle", "RecipID"]).sum().reset_index()
ic = ic.loc[(ic['RecipID'] == 'P00003335') | (ic['RecipID'] == 'P60003852') | (ic['Cycle'] < 2000) ]

# Combine candidates and committees into one superlist of entities
c = pd.read_csv("out/cands.csv", error_bad_lines=False)
c = c.loc[c['Cycle'] <= 2000]
c = c.loc[(c["DistIDRunFor"] == "PRES"), [ "CID", "FirstLastP" ]]
c.columns = [ "EntityId", "Name" ]

c = c.drop_duplicates(["EntityId"])

out = ic.merge(c, left_on = [ 'RecipID' ], right_on = [ 'EntityId' ], how = 'inner')
out = out.loc[:, [ "Cycle", "Name", "Amount", "Count" ]]
out = out.groupby([ "Cycle", "Name" ]).agg(sum).reset_index()

out = out.sort("Cycle")
out.to_csv("out/cont_bush_out.csv")
