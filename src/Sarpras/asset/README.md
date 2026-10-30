# SARPRASIN v2.0
# Asset Service


## Overview

Asset Service merupakan business layer yang menangani seluruh proses data aset sekolah.


## Responsibility


- Create Asset
- Read Asset
- Update Asset
- Delete Asset
- Search Asset
- Filter Asset
- QR Verification
- Asset History
- Asset Statistics



## Architecture


Component

↓

Asset Service

↓

Repository

↓

Firebase Firestore

↓

Database



## Principle


Service tidak berhubungan langsung dengan UI.


UI hanya memanggil:


```javascript
assetService.getAssets()
