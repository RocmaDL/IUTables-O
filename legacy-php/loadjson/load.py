import os
from supabase import create_client, Client
import json

url = 'https://uqphmrdxocqjbcbucdju.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGhtcmR4b2NxamJjYnVjZGp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzM4OTA2OSwiZXhwIjoyMDUyOTY1MDY5fQ.16zkEtD-M7vcRr43DZUJR6vYk7lTfUgA71nAscBczZ4'
supabase = create_client(url, key)

with open('loadjson/restaurants_orleans.json', 'r') as f:
    """Example data 
    
      {
    "geo_point_2d": {
      "lon": 1.9052942,
      "lat": 47.9011497999612
    },
    "geo_shape": {
      "type": "Feature",
      "geometry": {
        "coordinates": [1.9052942, 47.9011497999612],
        "type": "Point"
      },
      "properties": {

      }
    },
    "osm_id": "node/3422189698",
    "type": "fast_food",
    "name": "Cha+",
    "operator": null,
    "brand": null,
    "opening_hours": "Tu-Sa 11:00-20:00; Su 13:00-20:00",
    "wheelchair": "no",
    "cuisine": null,
    "vegetarian": null,
    "vegan": null,
    "delivery": null,
    "takeaway": null,
    "internet_access": null,
    "stars": null,
    "capacity": null,
    "drive_through": null,
    "wikidata": null,
    "brand_wikidata": null,
    "siret": "83037025000011",
    "phone": "+33 2 38 53 78 02",
    "website": "http://www.le-dream-s-coffee.com",
    "facebook": null,
    "smoking": null,
    "com_insee": "45234",
    "com_nom": "Orléans",
    "region": "Centre-Val de Loire",
    "code_region": "24",
    "departement": "Loiret",
    "code_departement": "45",
    "commune": "Orléans",
    "code_commune": "45234",
    "osm_edit": "https://www.openstreetmap.org/edit?node=3422189698"
  }
  
    """
    data = json.load(f)
    first_item = data[7]
    for key in first_item:
        print(key)
    # Insert data into the table
    # table = 'restaurant'
    # supabase.table(table).insert(data).execute()

# print(supabase.table(table).select("name").execute())
