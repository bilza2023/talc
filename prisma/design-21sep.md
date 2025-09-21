lets have some chat with AB/Talc project 
just get what information you can if not its ok 
in nutshell AB project is where we trace transportation and processes of talc and raw material .

New Information
here is the situation
raw-material reach in "ABS" (abbostabad base station) it is marked by 
1: supplier 2: shade of the raw-material (we have fixed shades) .. other details like weight , amount  etc etc 
2: Screening Process : A process of screening divide each truck into 3 sizes (Lumps , chips and fine). now each truck has been divivded based on sizes.
3: Now this screened material is transported to PSS where it is 
dumped into a dump area (stack) still based on supplier , shade and size.

4: Sorting Process : a sorting process is applied which add "wastage" and "HF" (discarded minealrs) from the same material and move it to another place called slots where this sorted-material is again stored based on supplier, shade and size but this time is also has wastage and HF data as well.


This is the crux of the problem ---which we want to disucss.

here is a brief system i am thinking for this 

---> SLOT SYSTEM: a slot is a physical place in a station. it stores screened- material based on (SSS supplier-shade-size). 
suppose there is just 1 supplier (Sup-A) in ABS station and 2 suppliers in JSS station
ABS will have    

slots in ABS =  
sup-A-white-lumps ,sup-A-white-chips, sup-A-white-fine,
sup-A-gray-lumps ,sup-A-gray-chips, sup-A-gray-fine,  

so the number of slots = ( suppliers X shades ) X 3 (since there are 3 sizes).

IMPORTANT  ===> suppliers are global, sizes are fixed AND shades CAN BE ADDED but the present ones can not be removed. 
if a new shade is added it genenrates new virtual slots.
we show only those slots which has material

--- the slots in pss are the same as in ABS or JSS just that pss has all the slots ---- but material does not travvel directly from ABS slot to PSS slot it has to stop in dumb area and the get sorted