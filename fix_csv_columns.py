#!/usr/bin/env python3

import csv

def fix_csv_columns():
    # Read the current CSV
    with open('export.csv', 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        rows = list(reader)
    
    if not rows:
        print("No rows found in CSV")
        return
    
    # Get the header (should have 43 columns)
    header = rows[0]
    expected_columns = len(header)
    print(f"Header has {expected_columns} columns")
    
    # Fix each row to have exactly the same number of columns as header
    fixed_rows = [header]
    
    for i, row in enumerate(rows[1:], 1):
        current_columns = len(row)
        
        if current_columns == expected_columns:
            # Row is correct length
            fixed_rows.append(row)
        elif current_columns < expected_columns:
            # Row is too short, pad with empty strings
            padded_row = row + [''] * (expected_columns - current_columns)
            fixed_rows.append(padded_row)
            print(f"Row {i}: Padded from {current_columns} to {expected_columns} columns")
        else:
            # Row is too long, truncate
            truncated_row = row[:expected_columns]
            fixed_rows.append(truncated_row)
            print(f"Row {i}: Truncated from {current_columns} to {expected_columns} columns")
    
    # Write the fixed CSV
    with open('export.csv', 'w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(fixed_rows)
    
    print(f"CSV fixed! All {len(fixed_rows)} rows now have exactly {expected_columns} columns")

if __name__ == "__main__":
    fix_csv_columns()