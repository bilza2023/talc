

19-Jul-2025

# AB Business Process
ok let me explain my understading of the system thus far


1: The business has "stations" (JSS, PSS, KEF etc). All the activity is around stations.

2: There are also many activities which are not specific to any station but relate to business as a whole for example collecting mines data , owners , suppliers , supply contracts etc et

3: The dashboards we need 
        - 1 for each station: 
        - 1 for each non-station specific (company level data). for example 1 dash board for suppliers (even if they are specific to any station this makes global data)
        - Master/Summary dashboard collectiving data on custom basis  
        - 1 dashboard / user ??? this does not seems feasible at the moment -- for now lets have just dashboards for CEO and we figure this out later 

4: As MVP (app zero) we provide forms for each activity which are filled by 1 person only (for now). We also keep option of file upload.

5: First thing to do is write independent "services" module that is 100% tested.

6: We also need a central logging / time stamping system that each serive can logto and genenrate logs/messages for exampl "SYSTEM ALERT" , "SUPPLIER CONTRACT VIOLATION" etc. 
 