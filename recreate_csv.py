#!/usr/bin/env python3

import csv

# Define the correct product data
products = [
    {
        'sku': 'IF_9223B4D0',
        'title': 'POP MART Labubu Wacky Mart Series Vinyl Plush Hanging Card – 100 % Authentic New',
        'description': 'Authentic POP MART Labubu Wacky Mart Series Vinyl Plush Hanging Card. Brand new factory sealed. Official Pop Mart product not sold in US stores. Cute Labubu pendant made of soft vinyl approximately 7 inches tall.',
        'quantity': '2',
        'price': '170',
        'images': 'https://i.frg.im/CPrua0eq/406044552584-0.jpg, https://i.frg.im/4ohSdXsh/406044552584-1.jpg',
        'product_identifier': 'UPC',
        'product_identifier_type': 'Pop Mart',
        'brand': '',
        'status': 'live',
        'show_in_coming_soon': '1',
        'weight': '0.4',
        'length': '5',
        'width': '3',
        'height': '7'
    },
    {
        'sku': 'IF_FACE0CEA',
        'title': 'Pop Mart Labubu The Monsters Big into Energy Crystal Ball 6 Blind Box',
        'description': 'Authentic POP MART Labubu Crystal Ball 6 Blind Box set. Complete set of mystical series figures. Rare collectible perfect for Pop Mart collectors.',
        'quantity': '1',
        'price': '160',
        'images': '/uploads/products/1755493902069_ltnsqg.jpeg, /uploads/products/1755493907588_4xsn92.jpeg',
        'product_identifier': 'MPN',
        'product_identifier_type': 'Pop Mart',
        'brand': '',
        'status': 'live',
        'show_in_coming_soon': 'true',
        'weight': '0.8',
        'length': '6',
        'width': '4',
        'height': '8'
    },
    {
        'sku': 'IF_EB0C6000',
        'title': 'POP MART Labubu Tempura Shrimp Wacky Mart Earphone Holder – Authentic US Seller',
        'description': 'Authentic POP MART Labubu Tempura Shrimp Earphone Holder. Adorable design that fits most wireless earphone cases.',
        'quantity': '10',
        'price': '60',
        'images': '/uploads/products/1755493954309_uuurel.jpg, /uploads/products/1755493957858_7vwicd.jpg',
        'product_identifier': '',
        'product_identifier_type': '',
        'brand': '',
        'status': 'live',
        'released_date': '2025-08-14T05:07:07.190Z',
        'show_in_featured': 'true',
        'weight': '0.2',
        'length': '4',
        'width': '3',
        'height': '2'
    },
    {
        'sku': 'IF_28CB01DA',
        'title': 'POP MART × Disney Mickey & Friends Family Cute Together Figure Set – Authentic',
        'description': 'Authentic POP MART Disney Mickey and Friends Family Cute Together Figure Set. Official Disney collaboration exclusive release.',
        'quantity': '6',
        'price': '230',
        'images': '/uploads/products/1755493983942_gnqbtz.jpg',
        'product_identifier': 'MPN',
        'product_identifier_type': 'Disney',
        'brand': '',
        'status': 'live',
        'show_in_coming_soon': 'true',
        'weight': '0.6',
        'length': '5',
        'width': '4',
        'height': '6'
    },
    {
        'sku': 'IF_AF2FDE13',
        'title': 'Labubu Forest Fairy Tale Series Vinyl Plush China Exclusive - US SELLER',
        'description': 'Authentic POP MART Labubu Forest Fairy Tale Series. Beautiful woodland themed Labubu with intricate fairy tale detailing. China exclusive release.',
        'quantity': '18',
        'price': '150',
        'images': 'https://i.frg.im/Eqi57RgK/406003915115-0.jpg, https://i.frg.im/XndEmvtz/406003915115-1.jpg',
        'product_identifier': '6931571082000',
        'product_identifier_type': 'UPC',
        'brand': '',
        'status': 'live',
        'show_in_coming_soon': 'true',
        'weight': '0.5',
        'length': '5',
        'width': '3',
        'height': '7'
    },
    {
        'sku': 'IF_23CB7D69',
        'title': '2025 SKULLPANDA SHANGHAI SIEGE AND CONFINEMENT - US SELLER',
        'description': 'Authentic POP MART 2025 SKULLPANDA Shanghai Siege and Confinement exclusive. Limited edition exhibition exclusive with QR authentication.',
        'quantity': '5',
        'price': '130',
        'images': 'https://i.frg.im/XnLE00Uy/406076050752-0.jpg,https://i.frg.im/krku0uLJ/406076050752-1.jpg',
        'product_identifier': '',
        'product_identifier_type': '',
        'brand': '',
        'status': 'live',
        'weight': '0.4',
        'length': '4',
        'width': '3',
        'height': '6'
    },
    {
        'sku': 'IF_2B221F94',
        'title': 'POP MART Labubu The Monsters Big Into Energy Wireless Phone Charger – Authentic',
        'description': 'Authentic POP MART Labubu wireless phone charger. Qi-certified with fast charging technology and LED status indicator.',
        'quantity': '0',
        'price': '50',
        'images': 'https://i.frg.im/OlJuz2vu/406101734910-0.jpg,https://i.frg.im/dDqr6jmp/406101734910-1.jpg',
        'product_identifier': '',
        'product_identifier_type': '',
        'brand': '',
        'status': 'live',
        'weight': '0.5',
        'length': '4',
        'width': '4',
        'height': '2'
    },
    {
        'sku': 'TST',
        'title': 'TEST',
        'description': 'TEST',
        'quantity': '1',
        'price': '0.1',
        'images': '/uploads/products/1755590092436_nqzg4t.png',
        'product_identifier': '',
        'product_identifier_type': '',
        'brand': '',
        'status': 'live',
        'show_in_coming_soon': 'true',
        'show_in_featured': 'true',
        'total_inventory_value': '1',
        'weight': '0.3',
        'length': '4',
        'width': '3',
        'height': '6'
    }
]

# Define all CSV columns in correct order
fieldnames = [
    'sku', 'title', 'description', 'quantity', 'price', 'images',
    'optionname1', 'optionname2', 'optionname3', 'optionname4', 'optionname5',
    'option1', 'option2', 'option3', 'option4', 'option5',
    'product_identifier', 'product_identifier_type', 'brand', 'cost',
    'status', 'drop_date', 'released_date', 'show_in_new_releases',
    'out_of_stock', 'show_in_staff_picks', 'show_in_coming_soon',
    'show_in_featured_while_coming_soon', 'show_in_featured', 'show_in_limited_editions',
    'purchase_cost', 'shipping_cost', 'total_cost', 'purchase_date',
    'supplier', 'tracking_number', 'profit_per_unit', 'total_inventory_value',
    'potential_profit', 'weight', 'length', 'width', 'height'
]

# Create a clean CSV with proper format
with open('export.csv', 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    
    for product in products:
        # Create a full row with all fields, defaulting to empty strings
        row = {field: '' for field in fieldnames}
        
        # Update with actual product data
        row.update(product)
        
        # Set default values for missing fields
        if not row.get('show_in_new_releases'):
            row['show_in_new_releases'] = 'false'
        if not row.get('out_of_stock'):
            row['out_of_stock'] = 'false'
        if not row.get('show_in_staff_picks'):
            row['show_in_staff_picks'] = 'false'
        if not row.get('show_in_coming_soon'):
            row['show_in_coming_soon'] = 'false'
        if not row.get('show_in_featured_while_coming_soon'):
            row['show_in_featured_while_coming_soon'] = 'false'
        if not row.get('show_in_featured'):
            row['show_in_featured'] = 'false'
        if not row.get('show_in_limited_editions'):
            row['show_in_limited_editions'] = 'false'
        if not row.get('purchase_cost'):
            row['purchase_cost'] = '0'
        if not row.get('shipping_cost'):
            row['shipping_cost'] = '0'
        if not row.get('total_cost'):
            row['total_cost'] = '0'
        if not row.get('profit_per_unit'):
            row['profit_per_unit'] = row['price']
        if not row.get('total_inventory_value'):
            row['total_inventory_value'] = str(int(row['quantity'] or '0') * float(row['total_cost'] or '0'))
        if not row.get('potential_profit'):
            row['potential_profit'] = str(int(row['quantity'] or '0') * float(row['profit_per_unit'] or '0'))
        
        writer.writerow(row)

print(f"CSV recreated successfully with {len(products)} products and {len(fieldnames)} columns")