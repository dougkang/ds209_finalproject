import numpy as np
import pandas as pd


# Since we only care about the data per industry, let's group by industry
ic = pd.read_csv("./data/indivs.sample.csv", error_bad_lines=False)
ic = ic.loc[(ic["Cycle"] == 2008) | (ic["Cycle"] == 2012), ['Cycle', 'RecipID', 'Orgname', 'RealCode', 'Amount']]
# ic = ic.groupby([ "Cycle", "RecipID", "Orgname", "RealCode" ]).sum().reset_index()
ic["Type"] = "Individual"

# Combine candidates and committees into one superlist of entities
c = pd.read_csv("data/cands.csv", error_bad_lines=False)
	c = c.loc[(c["Cycle"] == 2008) | (c["Cycle"] == 2012), [ "Cycle", "CID", "FirstLastP", "Party", "RecipCode" ]]
c.columns = [ "Cycle", "EntityId", "Name", "Party", "RecipCode" ]

p = pd.read_csv("data/cmtes.csv", error_bad_lines=False)
p = p.loc[(p["Cycle"] == 2008) | (p["Cycle"] == 2012), [ "Cycle", "CmteID", "PACShort", "Party", "RecipCode", "PrimCode" ]]
p.columns = [ "Cycle", "EntityId", "Name", "Party", "RecipCode", "PrimCode" ]

a = pd.read_csv("data/pacs.csv", error_bad_lines=False)
a = a.loc[(a["Cycle"] == 2008) | (a["Cycle"] == 2012), [ "Cycle", "PACID", "CID", "RealCode", "Amount"]]
a.columns = [ "Cycle", "PACID", "EntityId", "RealCode", "Amount"]
a["Type"] = "PACs"

g = pd.read_csv("data/categories_updated.csv", error_bad_lines=False)

ent = pd.concat([c, p]).drop_duplicates(["EntityId"])

ic = ic.merge(ent, left_on = [ 'RecipID' ], right_on = [ 'EntityId' ], how = 'inner')
a = a.merge(ent, left_on = [ 'EntityId' ], right_on = [ 'EntityId' ], how = 'inner')

out = pd.concat([ic, a]).drop_duplicates(["EntityId"])
out = out.merge(g, left_on = [ 'RealCode' ], right_on = [ 'Catcode' ], how = 'inner')
out = out.loc[:, [ "Cycle_x", "Orgname", "RealCode", "Amount", "EntityId", "Name", "Party", "PrimCode", "RecipCode", "Type", "Grouping", "Catgroup", "Sectorlong", "Industry", "Catname"]]
out.columns = [ "Cycle", "Orgname", "RealCode", "Amount", "EntityId", "Name", "Party", "PrimCode", "RecipCode", "Type", "Grouping", "Catgroup", "Sectorlong", "Industry", "Catname" ]

out = out.loc[out['Cycle'] % 4 == 0, :]
out_results = out.groupby(['Cycle', 'Party', 'Type', 'Name'], as_index=False).agg({
						'Amount': [np.sum, 'count', lambda x: 1.0 * np.mean(x) / np.sum(x)]
					}).reset_index()

# full_out = out.merge(temp, on = ['Cycle', 'Orgname'], how = 'inner')
# out_grouped = out.groupby(['Party', 'Grouping', 'Sectorlong', 'Industry', 'Orgname'])
# out_results = out_grouped.agg({
#						'Cycle': np.mean,
#						'Amount': [np.sum, 'count', lambda x: 1.0 * np.mean(x) / np.sum(x)]
#					})

# dem_results = out_results.apply(lambda x: x['Party'] == 'D')
# rep_results = out_results.apply(lambda x: x['Party'] == 'R')

dem_results = out_results[out_results['Party'] == 'D']
rep_results = out_results[out_results['Party'] == 'R']

# dem_2008_results = dem_results.apply(lambda x: x['Cycle'] == '2008')
# dem_2012_results = dem_results.apply(lambda x: x['Cycle'] == '2012')
dem_2008_results = dem_results[dem_results['Cycle'] == 2008]
dem_2012_results = dem_results[dem_results['Cycle'] == 2012]

# rep_2008_results = rep_results.apply(lambda x: x['Cycle'] == '2008')
# rep_2012_results = rep_results.apply(lambda x: x['Cycle'] == '2012')
rep_2008_results = rep_results[rep_results['Cycle'] == 2008]
rep_2012_results = rep_results[rep_results['Cycle'] == 2012]

# group by Catgroup, Orgname
dem_2008_results.loc[dem_2008_results['Amount']['<lambda>'] != 1]
dem_2012_results.loc[dem_2012_results['Amount']['<lambda>'] != 1]

rep_2008_results.loc[rep_2008_results['Amount']['<lambda>'] != 1]
rep_2012_results.loc[rep_2012_results['Amount']['<lambda>'] != 1]

dem_2008_results.to_csv("data/dem_2008_results.csv")
dem_2012_results.to_csv("data/dem_2012_results.csv")

rep_2008_results.to_csv("data/rep_2008_results.csv")
rep_2012_results.to_csv("data/rep_2012_results.csv")
