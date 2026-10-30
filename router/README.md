# SARPRASIN v2.0 Router


## Overview

Router module bertanggung jawab untuk:

- navigasi halaman
- authentication checking
- authorization checking
- route protection
- redirect handling


## Architecture


User

 ↓

Router

 ↓

Middleware

 ↓

Auth Guard

 ↓

Role Guard

 ↓

Page


## Route Type


### Public Route

Dapat diakses tanpa login.

Contoh:

