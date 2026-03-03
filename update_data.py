#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import pandas as pd
import json
from datetime import datetime
import sys

# Set UTF-8 encoding for console output
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

print("Loading Excel file...")

# Read the Reduced_10000_Diverse file
df = pd.read_excel('Reduced_10000_Diverse.xlsx')

print(f"Loaded {len(df)} rows")
print(f"Columns: {list(df.columns)}")

# Get unique values
unique_countries = df['Market'].nunique()
unique_brands = df['Brand'].nunique()
unique_stores = df['StoreID'].nunique()

print(f"\nData Overview:")
print(f"   Countries: {unique_countries}")
print(f"   Brands: {unique_brands}")
print(f"   Stores: {unique_stores}")

# Use all data from the file (already reduced to 10,000 diverse records)
print(f"\nUsing all {len(df)} records from Reduced_10000_Diverse.xlsx")
print(f"   Countries in data: {df['Market'].nunique()}")
print(f"   Brands in data: {df['Brand'].nunique()}")
print(f"   Stores in data: {df['StoreID'].nunique()}")

# Convert date column
def parse_date(date_val):
    if pd.isna(date_val):
        return None
    try:
        if isinstance(date_val, str):
            parts = date_val.split('-')
            if len(parts) == 3:
                return datetime(int(parts[2]), int(parts[1]), int(parts[0]))
        return pd.to_datetime(date_val)
    except:
        return None

print("Processing dates...")
df['ParsedDate'] = df['Date'].apply(parse_date)
df = df.dropna(subset=['ParsedDate'])

print(f"{len(df)} valid records after date parsing")

# Convert to JSON
print("Converting to JSON...")
data_json = []
for idx, row in df.iterrows():
    try:
        sales = float(row['Sales'])
        target = float(row['Budget'])  # Reading Budget column as target
        
        # Only skip if BOTH sales AND target are zero or negative
        if sales <= 0 and target <= 0:
            continue
            
        data_json.append({
            'Date': row['ParsedDate'].strftime('%Y-%m-%d'),
            'StoreID': int(row['StoreID']),
            'Store': str(row['Store']),
            'Market': str(row['Market']),
            'Country_ID': str(row.get('Country_ID', '')),
            'Brand': str(row['Brand']),
            'Channel': str(row.get('Channel', '')),
            'HomeDelivery_Channel': str(row.get('HomeDelivery_Channel', '')),
            'Digital_Channel': str(row.get('Digital_Channel', '')),
            'Sales': sales,
            'Transactions': int(row.get('Transactions', 0)),
            'Budget': target,  # Renamed from budget to target
            'Budget_Transactions': int(row.get('Budget_Transactions', 0))
        })
    except Exception as e:
        continue

print(f"Converted {len(data_json)} records")

# Write to data.json
print("Writing data.json...")
with open('dist/data.json', 'w', encoding='utf-8') as f:
    json.dump(data_json, f, ensure_ascii=False)

# Also write to public folder for Vercel
with open('public/data.json', 'w', encoding='utf-8') as f:
    json.dump(data_json, f, ensure_ascii=False)

print("\n" + "="*60)
print("Data updated successfully!")
print("="*60)
print(f"Data points: {len(data_json):,}")
print(f"Unique stores: {len(set(d['StoreID'] for d in data_json))}")
print(f"Countries: {len(set(d['Market'] for d in data_json))}")
print(f"Brands: {len(set(d['Brand'] for d in data_json))}")
print(f"\nRefresh your browser at: http://localhost:8080")
print("="*60)
