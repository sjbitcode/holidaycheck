# holidaycheck
Node API to monitor 2019 holidays in the United States

---
- #### `/holidays` `GET`
  Get a paginated list of holidays ordered by ascending date.
  
  **Optional**
  
  **`name`**: search against holiday name. Example: `/holidays?name=christmas`.
  
  **`type`**: search against holiday type. Example: `/holidays?type=federal`.
  
  **`date`**: search holidays on a date, formatted like `YYYY-MM-DD`. Takes precedence over `month`, `after`, `before`, `peek`                query params. Example: `/holidays?date=2019-01-01`.
  
  **`month`**: search holidays in a month, formatted like `M` or `MM`. Takes precedence over `after`, `before`, `peek` query                  params. Example: `/holidays?month=09`.
  
  **`after`**: search holidays after a date formatted like `YYYY-MM-DD`. Can be used together with `before`. Takes precedence                over `peek`. Example: `/holidays?after=2019-10-31`.
  
  **`before`**: search holidays before a date formatted like `YYYY-MM-DD`. Can be used together with `after`. Takes precedence                 over `peek`. Example: `/holidays?before=2019-11-01`.
  
  **`peek`**: search holidays within a number of days of the current day, forwards or backwards. Days must be represented as                 integers. Example: `holidays?peek=-3`.
  
  **`sort`**: sort holidays by [name, type, or date]. Can set ordering by concatenating `:asc` or `:desc`, but is ascending by               default. Example: `/holidays?sort=type:desc`.
  
  **`page`**: get a specific page in paginated results. Example `/holidays?page=2`.
  
  
 ---
 - #### `/holidays/{id}` `GET`
   Get detailed info for a single holiday.
 
 
 ---
 - #### `/holidays/types` `GET`
   Get a list of holiday types.

---
 - #### `/holidays/stats` `GET`
   Get holiday counts categorized 
   - by type,
   - by type per month
   
   and holiday count for remaining of the year.
