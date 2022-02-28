**Prepare Chicago Covid Death data 

import delimited "https://data.cityofchicago.org/api/views/553k-3xzc/rows.csv?accessType=DOWNLOAD", clear
egen totalpop = sum(population) if date == "01/01/2021"
collapse (sum) vaccineseriescompletedcumulative (mean) totalpop, by(date)
egen pop = max(totalpop)
drop totalpop
gen percent_vax = round(vaccineseriescompletedcumulative/pop, .01)
gen Region = "Chicago"
keep Region date percent_vax
 

replace date = substr(date, 1, 3) + substr(date, -6, .) if substr(date, 4, 1) == "0"
replace date = substr(date, 1, 5) + substr(date, -2, .) if substr(date, 5, 1) == "/"
replace date = substr(date, 1, 6) + substr(date, -2, .) if substr(date, 5, 1) != "/"
