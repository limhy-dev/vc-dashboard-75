-- Copy and paste this script into your Supabase SQL Editor to create the table

CREATE TABLE sales_data (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  date text NOT NULL,
  product text NOT NULL,
  channel text NOT NULL,
  orders integer NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  cost numeric NOT NULL DEFAULT 0,
  visitors integer NOT NULL DEFAULT 0,
  customers integer NOT NULL DEFAULT 0
);

-- Note: the 'date' field is created as text to easily map exactly to the local CSV outputs for a drop-in replacement
-- Alternatively you could change to `date` type in postgres, but if you do, 
-- make sure to format the date correctly when returning from backend API so Dashboard charts react cleanly.
