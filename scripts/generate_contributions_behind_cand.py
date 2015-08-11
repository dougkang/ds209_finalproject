import simplejson
import numpy as np
import pandas as pd


# Since we only care about the data per industry, let's group by industry
ic = pd.read_csv("data/indivs.csv", error_bad_lines=False)
ic = ic.loc[((ic["Cycle"] == 1992) | (ic["Cycle"] == 1996) | (ic["Cycle"] == 2000) | (ic["Cycle"] == 2004) | (ic["Cycle"] == 2008) | (ic["Cycle"] == 2012) | (ic["Cycle"] == 2016)), ['Cycle', 'RecipID', 'Orgname', 'Contrib', 'RealCode', 'Amount']]
ic["Type"] = "Individual"

# Combine candidates and committees into one superlist of entities
c = pd.read_csv("data/cands.csv", error_bad_lines=False)
c = c.loc[(c["DistIDRunFor"] == "PRES"), :]
c = c.loc[((c["Cycle"] == 1992) | (c["Cycle"] == 1996) | (c["Cycle"] == 2000) | (c["Cycle"] == 2004) | (c["Cycle"] == 2008) | (c["Cycle"] == 2012) | (c["Cycle"] == 2016)), [ "Cycle", "CID", "FirstLastP", "Party", "RecipCode" ]]
c.columns = [ "Cycle", "EntityId", "Name", "Party", "RecipCode" ]

p = pd.read_csv("data/cmtes.csv", error_bad_lines=False)
p = p.loc[((p["Cycle"] == 1992) | (p["Cycle"] == 1996) | (p["Cycle"] == 2000) | (p["Cycle"] == 2004) | (p["Cycle"] == 2008) | (p["Cycle"] == 2012) | (p["Cycle"] == 2016)), [ "Cycle", "CmteID", "PACShort", "Party", "RecipCode", "PrimCode" ]]
p.columns = [ "Cycle", "EntityId", "Name", "Party", "RecipCode", "PrimCode" ]

a = pd.read_csv("data/pacs.csv", error_bad_lines=False)
a = a.loc[((a["Cycle"] == 1992) | (a["Cycle"] == 1996) | (a["Cycle"] == 2000) | (a["Cycle"] == 2004) | (a["Cycle"] == 2008) | (a["Cycle"] == 2012) | (a["Cycle"] == 2016)), [ "Cycle", "PACID", "CID", "RealCode", "Amount" ]]
a.columns = [ "Cycle", "PACID", "EntityId", "RealCode", "Amount"]
a["Type"] = "PACs"

g = pd.read_csv("data/categories_updated.csv", error_bad_lines=False)

ent = pd.concat([c, p]).drop_duplicates(["EntityId"])

ic = ic.loc[ic.RecipID.isin(np.unique(c["EntityId"])),:]
# ic.to_csv("ic.csv")
# ic = ic.read_csv('ic.csv')

ic = ic.merge(ent, left_on = [ 'RecipID' ], right_on = [ 'EntityId' ], how = 'inner')
a = a.merge(ent, left_on = [ 'EntityId' ], right_on = [ 'EntityId' ], how = 'inner')

ic.loc[:, 'Name'] = ic['Name_x']

out = pd.concat([ic, a])
out = out.merge(g, left_on = [ 'RealCode' ], right_on = [ 'Catcode' ], how = 'left')
out = out.loc[:, [ "Cycle_x", "Orgname", "RealCode", "Amount", "EntityId", "Name", "Party", "PrimCode", "RecipCode", "Type", "Grouping", "Catgroup", "Sectorlong", "Industry", "Catname", "Contrib"]]
out.columns = [ "Cycle", "Orgname", "RealCode", "Amount", "EntityId", "Name", "Party", "PrimCode", "RecipCode", "Type", "Grouping", "Catgroup", "Sectorlong", "Industry", "Catname","Contrib" ]

out_results = out.groupby(['Cycle', 'Name', 'Type', 'Industry', 'Catname'], as_index=False).agg({
                        'Amount': [np.sum, 'count', lambda x: 1.0 * np.mean(x) / np.sum(x)]
                    }).reset_index()
# out_results.loc['Catname'] = out_results.Catname.str.replace('/', ' ')
out_results = out_results.fillna(0.0)

for year in np.unique(out_results['Cycle']):
    for cand in np.unique(out_results.loc[out_results['Cycle'] == year, 'Name']):
        temp_results = out_results[(out_results['Cycle'] == year) & (out_results['Name'] == cand)]
        temp_output = { 'name': cand,
                        'donations': 10000,
                        'children': [
                            {
                                'name': 'Individual',
                                'donations': 50000,
                                'children': [
                                    ]
                            },
                            {
                                'name': 'PACs',
                                'donations': 1000,
                                'children': [
                                    ]
                            }
                        ]
                    }
        for i, row in temp_results[temp_results['Type'] == 'Individual'].iterrows():
            don = {
                'name': row['Catname'].values[0],
                'value': row['Amount']['sum'],
                'donations': row['Amount']['count'],
                'rate': row['Amount']['<lambda>']
            }
            temp_output['children'][0]['children'].append(don)
        for i, row in temp_results[temp_results['Type'] == 'PACs'].iterrows():
            don = {
                'name': row['Catname'].values[0],
                'value': row['Amount']['sum'],
                'donations': row['Amount']['count'],
                'rate': row['Amount']['<lambda>']
            }
            temp_output['children'][1]['children'].append(don)
        filename = cand.lower().split('(')[0].rstrip().replace(' ', '_') + '_' + str(year() + '.json'
        with open('data/treemap/' + filename, 'w') as outfile:
            json.dump(temp_output, outfile)