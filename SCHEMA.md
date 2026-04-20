# Inventory Pro - Cloud Data Schema

This document outlines the Firestore structure for the Inventory Management App.

## Root Collection: `users`
Each user document is identified by their unique Firebase Auth UID.

### 1. User Document: `/users/{userId}`
- `email`: string
- `businessName`: string

---

## Sub-Collections (Per User)

### 2. Products: `/users/{userId}/products`
- `name`: string
- `sku`: string
- `costPrice`: number
- `sellingPrice`: number
- `stock`: number
- `categoryId`: string (optional)
- `supplierId`: string (optional)

### 3. Transactions: `/users/{userId}/transactions`
- `type`: 'sale' | 'purchase'
- `productId`: string
- `quantity`: number
- `amount`: number
- `customerId`: string (optional)
- `date`: string (ISO 8601)

### 4. Debts: `/users/{userId}/debts`
- `customerId`: string
- `amount`: number
- `reason`: string
- `status`: 'pending' | 'paid'
- `dueDate`: string

### 5. Categories: `/users/{userId}/categories`
- `name`: string

### 6. Suppliers: `/users/{userId}/suppliers`
- `name`: string
- `contact`: string
- `category`: string

### 7. Customers: `/users/{userId}/customers`
- `name`: string
- `phone`: string
- `debt`: number

---

## Configuration: `/users/{userId}/config`

### 8. Settings Document: `/users/{userId}/config/settings`
- `businessName`: string
- `currency`: string
- `lowStockThreshold`: number
- `initialCapital`: number
- `theme`: 'light' | 'dark'

---

## Security Rules (Required)
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
