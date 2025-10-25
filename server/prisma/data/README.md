# Seed Data Directory

This directory contains JSON files used for seeding the database with initial data.

## Files

### `accounts.json`
Contains user account data for seeding the database with test accounts.

**Structure:**
```json
[
  {
    "email": "string (required)",
    "password": "string (required)",
    "role": "ADMIN | USER",
    "last_name": "string",
    "first_name": "string",
    "middle_name": "string",
    "name_extension": "string",
    "birthdate": "YYYY-MM-DD",
    "sex": "Male | Female",
    "nationality": "Filipino | American | Chinese | Japanese | Korean | Other",
    "civil_status": "Single | Married | Widowed | Divorced | Separated",
    "weight": "number (kg)",
    "height": "number (meters)",
    "blood_type": "string",
    "eye_color": "string",
    "address_house_no": "string",
    "address_street": "string",
    "address_barangay": "string",
    "address_city_municipality": "string",
    "address_province": "string",
    "telephone_number": "string",
    "cellphone_number": "string",
    "email_address": "string",
    "emergency_contact_name": "string",
    "emergency_contact_relationship": "string",
    "emergency_contact_number": "string",
    "vehicle_categories": "string (comma-separated: A,B,C,D,E)"
  }
]
```

**Enum Values:**

- **Nationality:** Filipino, American, Chinese, Japanese, Korean, Other
- **Civil Status:** Single, Married, Widowed, Divorced, Separated
- **Role:** ADMIN, USER

**Important Notes:**

1. All fields except `email` and `password` are optional
2. Empty strings for enum fields (`nationality`, `civil_status`) will be converted to `null`
3. `birthdate` must be in ISO format: `YYYY-MM-DD`
4. `weight` is in kilograms, `height` is in meters
5. `vehicle_categories` is a comma-separated string (e.g., "A,B,C")

## Usage

The seed script (`../seed.js`) automatically reads from this JSON file.

**Run seed:**
```bash
npm run fill
```

## Adding New Accounts

To add new test accounts:

1. Edit `accounts.json`
2. Add new account objects following the structure above
3. Run `npm run fill`
4. The seed script will only create accounts that don't already exist

## Developer Access Accounts

Default accounts for development:

- **Admin:** username=`admin`, password=`123456`
- **User:** username=`user`, password=`123456`

## Scalability

This separation allows for:
- Easy data management without touching code
- Version control of test data
- Multiple data sets for different environments
- Simplified data updates and maintenance
