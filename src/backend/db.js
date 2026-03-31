/*
* db.js - PostgreSQL Connection
*
* Understanding
* This file will be used to create and send a shared connection pool to the PostgreSQL database.
* All controllers will import to this pool to run queries instead of opening new connections each time.
*
* What this File Does
* Read DB credentials from the environment variables
* Create a pg. Pool with host, port, databases, and use
* Export the pool so any controller can call pool .query
*
* Key Terms 
* Pool - a group of reusable DB connections
* PG - the node postgres library used to talk to PostgreSQL
* .env - file where DB credentials are stored (won't commit to Git)
